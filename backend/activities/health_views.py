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
