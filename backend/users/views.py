from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from users.authentication import ClerkAuthentication
from .serializers import UserProfileSerializer, UserUpdateSerializer

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view with Clerk authentication"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [ClerkAuthentication]
    
    def get_object(self):
        # Get user by Clerk ID
        clerk_id = self.request.user.clerk_id
        user, created = User.objects.get_or_create(
            clerk_id=clerk_id,
            defaults={
                'username': self.request.user.username or self.request.user.email,
                'email': self.request.user.email,
                'first_name': self.request.user.first_name or '',
                'last_name': self.request.user.last_name or '',
            }
        )
        
        # Update user data if not created
        if not created:
            if self.request.user.email and self.request.user.email != user.email:
                user.email = self.request.user.email
            if self.request.user.first_name and self.request.user.first_name != user.first_name:
                user.first_name = self.request.user.first_name
            if self.request.user.last_name and self.request.user.last_name != user.last_name:
                user.last_name = self.request.user.last_name
            user.save()
        
        return user


class UserUpdateView(generics.UpdateAPIView):
    """User profile update view with Clerk authentication"""
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [ClerkAuthentication]
    
    def get_object(self):
        clerk_id = self.request.user.clerk_id
        user, created = User.objects.get_or_create(
            clerk_id=clerk_id,
            defaults={
                'username': self.request.user.username or self.request.user.email,
                'email': self.request.user.email,
                'first_name': self.request.user.first_name or '',
                'last_name': self.request.user.last_name or '',
            }
        )
        
        # Update user data if not created
        if not created:
            if self.request.user.email and self.request.user.email != user.email:
                user.email = self.request.user.email
            if self.request.user.first_name and self.request.user.first_name != user.first_name:
                user.first_name = self.request.user.first_name
            if self.request.user.last_name and self.request.user.last_name != user.last_name:
                user.last_name = self.request.user.last_name
            user.save()
        
        return user


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([ClerkAuthentication])
def user_stats(request):
    """Get user statistics for dashboard with Clerk authentication"""
    from activities.models import Activity
    
    # Get or create user
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
    
    # Update user data if not created
    if not created:
        if request.user.email and request.user.email != user.email:
            user.email = request.user.email
        if request.user.first_name and request.user.first_name != user.first_name:
            user.first_name = request.user.first_name
        if request.user.last_name and request.user.last_name != user.last_name:
            user.last_name = request.user.last_name
        user.save()
    
    # Get user's activities
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
    
    return Response({
        'total_activities': total_activities,
        'active_streaks': active_streaks,
        'completed_today': completed_today,
        'average_streak': average_streak,
        'weekly_progress': weekly_progress,
        'user': {
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'email': user.email
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([ClerkAuthentication])
def user_profile_stats(request):
    """Get comprehensive user statistics for profile page"""
    from activities.models import Activity, StreakEntry
    from django.utils import timezone
    from datetime import timedelta
    
    # Get or create user
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
    
    # Update user data if not created
    if not created:
        if request.user.email and request.user.email != user.email:
            user.email = request.user.email
        if request.user.first_name and request.user.first_name != user.first_name:
            user.first_name = request.user.first_name
        if request.user.last_name and request.user.last_name != user.last_name:
            user.last_name = request.user.last_name
        user.save()
    
    # Get user's activities and entries
    activities = user.activities.all()
    entries = StreakEntry.objects.filter(activity__user=user)
    
    # Calculate comprehensive stats
    total_activities = activities.count()
    total_completions = entries.filter(completed=True).count()
    total_streaks = sum(activity.current_streak for activity in activities)
    longest_streak = max([activity.best_streak for activity in activities], default=0)
    
    # Calculate days active (days since first activity or user creation)
    first_activity = activities.order_by('created_at').first()
    first_entry = entries.order_by('date').first()
    
    if first_activity or first_entry:
        start_date = min(
            first_activity.created_at.date() if first_activity else timezone.now().date(),
            first_entry.date if first_entry else timezone.now().date()
        )
        days_active = (timezone.now().date() - start_date).days + 1
    else:
        days_active = (timezone.now().date() - user.date_joined.date()).days + 1
    
    # Calculate completion rate
    total_possible_completions = entries.count()
    completion_rate = round((total_completions / total_possible_completions * 100), 1) if total_possible_completions > 0 else 0
    
    # Calculate achievements
    achievements = []
    
    # First Streak achievement
    first_streak_achieved = any(activity.best_streak >= 7 for activity in activities)
    achievements.append({
        'id': 1,
        'name': 'First Streak',
        'description': 'Complete your first 7-day streak',
        'achieved': first_streak_achieved,
        'icon': '🔥'
    })
    
    # Consistency Master achievement
    consistency_master_achieved = total_activities >= 3 and days_active >= 30
    achievements.append({
        'id': 2,
        'name': 'Consistency Master',
        'description': 'Maintain 3 activities for 30 days',
        'achieved': consistency_master_achieved,
        'icon': '💪'
    })
    
    # Early Bird achievement (placeholder - would need time-based data)
    early_bird_achieved = False
    achievements.append({
        'id': 3,
        'name': 'Early Bird',
        'description': 'Complete morning activities for 14 days',
        'achieved': early_bird_achieved,
        'icon': '🌅'
    })
    
    # Goal Getter achievement
    goal_getter_achieved = longest_streak >= 50
    achievements.append({
        'id': 4,
        'name': 'Goal Getter',
        'description': 'Reach 50-day streak on any activity',
        'achieved': goal_getter_achieved,
        'icon': '🎯'
    })
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined,
            'bio': getattr(user, 'bio', 'Habit Tracker Enthusiast')
        },
        'stats': {
            'total_activities': total_activities,
            'total_completions': total_completions,
            'total_streaks': total_streaks,
            'longest_streak': longest_streak,
            'days_active': days_active,
            'completion_rate': completion_rate
        },
        'achievements': achievements
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([ClerkAuthentication])
def current_user_info(request):
    """Get current user information"""
    user = get_or_create_user_with_clerk_data(request.user)
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.full_name,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'clerk_id': user.clerk_id,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
        'is_authenticated': True
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
@authentication_classes([ClerkAuthentication])
def all_users_info(request):
    """Get all users information (admin only)"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    users = User.objects.all().order_by('-date_joined')
    users_data = []
    
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'clerk_id': user.clerk_id,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'is_active': user.is_active,
        })
    
    return Response({
        'total_users': users.count(),
        'users': users_data
    })
