from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Custom exception handler for better error responses"""
    
    # Get the standard error response
    response = exception_handler(exc, context)
    
    if response is not None:
        # Handle authentication failures with better messages
        if isinstance(exc, AuthenticationFailed):
            error_message = str(exc)
            
            # Provide more user-friendly error messages
            if 'expired' in error_message.lower():
                custom_response_data = {
                    'error': 'Authentication expired',
                    'message': 'Your session has expired. Please refresh the page to continue.',
                    'code': 'TOKEN_EXPIRED',
                    'status_code': response.status_code
                }
            elif 'invalid' in error_message.lower():
                custom_response_data = {
                    'error': 'Invalid authentication',
                    'message': 'Please sign in again to continue.',
                    'code': 'INVALID_TOKEN',
                    'status_code': response.status_code
                }
            else:
                custom_response_data = {
                    'error': 'Authentication failed',
                    'message': 'Please sign in again to continue.',
                    'code': 'AUTH_FAILED',
                    'status_code': response.status_code
                }
            
            # Log the authentication failure for monitoring
            logger.warning(f"Authentication failure: {error_message}")
            
            return Response(custom_response_data, status=response.status_code)
        
        # Handle other errors with consistent format
        custom_response_data = {
            'error': response.data.get('detail', 'An error occurred'),
            'message': response.data.get('detail', 'An error occurred'),
            'status_code': response.status_code
        }
        
        # Add field errors if they exist
        if hasattr(response.data, 'items'):
            field_errors = {}
            for field, errors in response.data.items():
                if field != 'detail' and isinstance(errors, list):
                    field_errors[field] = errors
            if field_errors:
                custom_response_data['field_errors'] = field_errors
        
        return Response(custom_response_data, status=response.status_code)
    
    return response
