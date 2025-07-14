from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q, Count, Avg
from django.contrib.auth import get_user_model
from users.authentication import ClerkAuthentication
from users.utils import get_or_create_user_with_clerk_data

from .models import Activity, StreakEntry
from .serializers import (
    ActivitySerializer,
    ActivityCreateSerializer,
    ActivityUpdateSerializer,
    StreakEntrySerializer,
    StreakEntryCreateSerializer,
    StreakEntryUpdateSerializer,
    DashboardStatsSerializer,
    CalendarEntrySerializer
)

User = get_user_model()


class ActivityListView(generics.ListCreateAPIView):
    """List and create activities with Clerk authentication"""
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [ClerkAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'frequency']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'current_streak', 'best_streak']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Get or create user by Clerk ID
        user = get_or_create_user_with_clerk_data(self.request.user)
        return Activity.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActivityCreateSerializer
        return ActivitySerializer


class ActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete activities with Clerk authentication"""
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [ClerkAuthentication]
    
    def get_queryset(self):
        user = get_or_create_user_with_clerk_data(self.request.user)
        return Activity.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ActivityUpdateSerializer
        return ActivitySerializer


class StreakEntryListView(generics.ListCreateAPIView):
    """List and create streak entries with Clerk authentication"""
    serializer_class = StreakEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [ClerkAuthentication]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['activity', 'completed', 'date']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']
    
    def get_queryset(self):
        user = get_or_create_user_with_clerk_data(self.request.user)
        return StreakEntry.objects.filter(activity__user=user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StreakEntryCreateSerializer
        return StreakEntrySerializer


class StreakEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete streak entries with Clerk authentication"""
    serializer_class = StreakEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [ClerkAuthentication]
    
    def get_queryset(self):
        user = get_or_create_user_with_clerk_data(self.request.user)
        return StreakEntry.objects.filter(activity__user=user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StreakEntryUpdateSerializer
        return StreakEntrySerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([ClerkAuthentication])
def dashboard_stats(request):
    """Get dashboard statistics with Clerk authentication"""
    clerk_id = request.user.clerk_id
    user, created = User.objects.get_or_create(
        clerk_id=clerk_id,
        defaults={
            'username': request.user.username or request.user.email,
            'email': request.user.email,
            'first_name': request.user.first_name or '',
            'last_name': request.user.last_name or '',
        }
    )
    
    activities = user.activities.all()
    
    # Calculate stats
    total_activities = activities.count()
    active_streaks = sum(1 for activity in activities if activity.current_streak > 0)
    completed_today = sum(1 for activity in activities if activity.completed_today)
    
    # Calculate average streak
    total_streak = sum(activity.current_streak for activity in activities)
    average_streak = round(total_streak / total_activities, 1) if total_activities > 0 else 0
    
    # Calculate weekly progress
    total_weekly_progress = sum(activity.weekly_progress for activity in activities)
    weekly_progress = round(total_weekly_progress / total_activities, 1) if total_activities > 0 else 0
    
    # Serialize activities
    activities_data = ActivitySerializer(activities, many=True).data
    
    data = {
        'total_activities': total_activities,
        'active_streaks': active_streaks,
        'completed_today': completed_today,
        'average_streak': average_streak,
        'weekly_progress': weekly_progress,
        'activities': activities_data
    }
    
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([ClerkAuthentication])
def complete_activity(request, activity_id):
    """Toggle activity completion for today with Clerk authentication"""
    user = get_or_create_user_with_clerk_data(request.user)
    try:
        activity = Activity.objects.get(id=activity_id, user=user)
    except Activity.DoesNotExist:
        return Response({'error': 'Activity not found'}, status=status.HTTP_404_NOT_FOUND)
    
    today = timezone.now().date()
    note = request.data.get('note', '')
    
    # Check if entry exists for today
    try:
        entry = StreakEntry.objects.get(date=today, activity=activity)
        # Toggle completion status
        entry.completed = not entry.completed
        if note:
            entry.note = note
        entry.save()
        action = 'completed' if entry.completed else 'uncompleted'
    except StreakEntry.DoesNotExist:
        # Create new entry as completed
        entry = StreakEntry.objects.create(
            date=today,
            activity=activity,
            completed=True,
            note=note
        )
        action = 'completed'
    
    # Return updated activity data
    activity_data = ActivitySerializer(activity).data
    return Response({
        'message': f'Activity {action} successfully',
        'activity': activity_data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([ClerkAuthentication])
def calendar_entries(request):
    """Get calendar entries for a date range with Clerk authentication"""
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if not start_date or not end_date:
        return Response({'error': 'start_date and end_date are required'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    clerk_id = request.user.clerk_id
    user, created = User.objects.get_or_create(
        clerk_id=clerk_id,
        defaults={
            'username': request.user.username or request.user.email,
            'email': request.user.email,
            'first_name': request.user.first_name or '',
            'last_name': request.user.last_name or '',
        }
    )
    
    activities = user.activities.all()
    
    calendar_data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Get entries for this date
        entries = StreakEntry.objects.filter(
            activity__user=user,
            date=current_date
        ).select_related('activity')
        
        # Prepare activities data for this date
        activities_data = []
        total_completed = 0
        total_activities = activities.count()
        
        for activity in activities:
            entry = entries.filter(activity=activity).first()
            completed = entry.completed if entry else False
            
            if completed:
                total_completed += 1
            
            activities_data.append({
                'id': activity.id,
                'title': activity.title,
                'color': activity.color,
                'completed': completed,
                'note': entry.note if entry else ''
            })
        
        calendar_data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'activities': activities_data,
            'total_completed': total_completed,
            'total_activities': total_activities
        })
        
        current_date += timedelta(days=1)
    
    return Response(calendar_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([ClerkAuthentication])
def analytics(request):
    """Get analytics data with Clerk authentication"""
    clerk_id = request.user.clerk_id
    user, created = User.objects.get_or_create(
        clerk_id=clerk_id,
        defaults={
            'username': request.user.username or request.user.email,
            'email': request.user.email,
            'first_name': request.user.first_name or '',
            'last_name': request.user.last_name or '',
        }
    )
    
    activities = user.activities.all()
    
    # Basic analytics
    total_activities = activities.count()
    total_completions = sum(activity.total_completions for activity in activities)
    average_streak = sum(activity.current_streak for activity in activities) / total_activities if total_activities > 0 else 0
    
    # Category breakdown
    category_stats = {}
    for activity in activities:
        category = activity.get_category_display()
        if category not in category_stats:
            category_stats[category] = {
                'count': 0,
                'total_streak': 0,
                'total_completions': 0
            }
        category_stats[category]['count'] += 1
        category_stats[category]['total_streak'] += activity.current_streak
        category_stats[category]['total_completions'] += activity.total_completions
    
    # Calculate averages for categories
    for category in category_stats:
        count = category_stats[category]['count']
        category_stats[category]['avg_streak'] = round(category_stats[category]['total_streak'] / count, 1)
        category_stats[category]['avg_completions'] = round(category_stats[category]['total_completions'] / count, 1)
    
    return Response({
        'total_activities': total_activities,
        'total_completions': total_completions,
        'average_streak': round(average_streak, 1),
        'category_breakdown': category_stats,
        'message': 'Analytics endpoint - more features coming soon!'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([ClerkAuthentication])
def search_activities(request):
    """Search activities by title or description with Clerk authentication"""
    query = request.GET.get('q', '')
    category = request.GET.get('category', '')
    
    clerk_id = request.user.clerk_id
    user, created = User.objects.get_or_create(
        clerk_id=clerk_id,
        defaults={
            'username': request.user.username or request.user.email,
            'email': request.user.email,
            'first_name': request.user.first_name or '',
            'last_name': request.user.last_name or '',
        }
    )
    
    activities = Activity.objects.filter(user=user)
    
    if query:
        activities = activities.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )
    
    if category:
        activities = activities.filter(category=category)
    
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)
