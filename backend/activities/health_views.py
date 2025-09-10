from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for monitoring and keeping service awake"""
    try:
        # Basic health check - just return a simple response
        return Response({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'service': 'streakflow-backend',
            'message': 'Service is running'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return Response({
            'status': 'unhealthy',
            'timestamp': timezone.now().isoformat(),
            'service': 'streakflow-backend',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def root_health(request):
    """Root endpoint for basic health checks and cron job pinging"""
    return Response({
        'status': 'ok',
        'service': 'streakflow-backend',
        'timestamp': timezone.now().isoformat(),
        'message': 'StreakFlow Backend is running'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def debug_auth(request):
    """Debug endpoint to help troubleshoot authentication issues"""
    from django.contrib.auth import get_user_model
    from django.db import connection
    
    User = get_user_model()
    
    # Get basic stats
    total_users = User.objects.count()
    users_with_clerk_id = User.objects.exclude(clerk_id__isnull=True).exclude(clerk_id='').count()
    
    # Get recent users
    recent_users = list(User.objects.order_by('-created_at')[:5].values(
        'id', 'username', 'clerk_id', 'email', 'created_at'
    ))
    
    # Check for duplicate Clerk IDs
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT clerk_id, COUNT(*) as count 
            FROM users 
            WHERE clerk_id IS NOT NULL 
            GROUP BY clerk_id 
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()
    
    return Response({
        'status': 'debug_info',
        'timestamp': timezone.now().isoformat(),
        'user_stats': {
            'total_users': total_users,
            'users_with_clerk_id': users_with_clerk_id,
            'users_without_clerk_id': total_users - users_with_clerk_id,
            'duplicate_clerk_ids': len(duplicates),
        },
        'recent_users': recent_users,
        'duplicates': [{'clerk_id': clerk_id, 'count': count} for clerk_id, count in duplicates],
        'message': 'Authentication debug information'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def test_auth(request):
    """Test endpoint to debug authentication flow"""
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    
    return Response({
        'status': 'auth_test',
        'timestamp': timezone.now().isoformat(),
        'has_auth_header': bool(auth_header),
        'auth_header_preview': auth_header[:50] + '...' if auth_header and len(auth_header) > 50 else auth_header,
        'request_user': str(request.user) if hasattr(request, 'user') else 'No user',
        'request_user_type': str(type(request.user)) if hasattr(request, 'user') else 'No user',
        'is_authenticated': request.user.is_authenticated if hasattr(request, 'user') else False,
        'message': 'Authentication test information'
    }, status=status.HTTP_200_OK)
