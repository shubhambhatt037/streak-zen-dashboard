import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class TokenExpirationMiddleware(MiddlewareMixin):
    """Middleware to handle token expiration more gracefully"""
    
    def process_response(self, request, response):
        """Process the response to add helpful headers for token expiration"""
        
        # Only process API responses
        if request.path.startswith('/api/') and response.status_code == 403:
            # Check if this is a token expiration issue
            if hasattr(response, 'data') and response.data:
                error_message = str(response.data.get('detail', ''))
                if 'expired' in error_message.lower():
                    # Add a header to help the frontend detect token expiration
                    response['X-Token-Expired'] = 'true'
                    response['X-Error-Code'] = 'TOKEN_EXPIRED'
                    logger.info(f"Token expiration detected for {request.path}")
        
        return response
