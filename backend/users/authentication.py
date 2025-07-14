import jwt
from jwt import PyJWKClient
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import requests
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class ClerkAuthentication(authentication.BaseAuthentication):
    """Custom authentication backend for Clerk"""
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
        
        try:
            # Extract token from Authorization header
            token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
            
            # Verify token with Clerk
            user_data = self.verify_clerk_token(token)
            
            # Get or create user
            user = self.get_or_create_user(user_data)
            
            return (user, None)
            
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def verify_clerk_token(self, token):
        """Verify JWT token with Clerk using PyJWKClient"""
        try:
            clerk_issuer = settings.CLERK.get('JWT_ISSUER', '')
            jwks_url = f"{clerk_issuer}/.well-known/jwks.json"

            jwks_client = PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=['RS256'],
                issuer=clerk_issuer,
                options={"verify_aud": False}  # Skip audience verification for now
            )
            return payload
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT token: {str(e)}")
            raise AuthenticationFailed(f'Invalid JWT token: {str(e)}')
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise AuthenticationFailed(f'Token verification failed: {str(e)}')
    
    def fetch_user_from_clerk_api(self, clerk_id):
        """Fetch user data from Clerk's API"""
        try:
            clerk_secret_key = settings.CLERK.get('SECRET_KEY', '')
            if not clerk_secret_key:
                logger.warning("Clerk SECRET_KEY not configured, cannot fetch user data")
                return None
            
            headers = {
                'Authorization': f'Bearer {clerk_secret_key}',
                'Content-Type': 'application/json'
            }
            
            # Fetch user data from Clerk API
            response = requests.get(
                f"https://api.clerk.com/v1/users/{clerk_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                user_data = response.json()
                return user_data
            else:
                logger.error(f"Failed to fetch user from Clerk API: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching user from Clerk API: {str(e)}")
            return None
    
    def get_or_create_user(self, user_data):
        """Get or create user from Clerk data, always update with latest Clerk info"""
        clerk_id = user_data.get('sub')  # Clerk user ID
        if not clerk_id:
            raise AuthenticationFailed('No user ID in token')

        # Extract Clerk fields from JWT
        email = user_data.get('email', '')
        given_name = user_data.get('given_name')
        family_name = user_data.get('family_name')
        name = user_data.get('name')
        first_name = user_data.get('first_name')
        last_name = user_data.get('last_name')

        # If JWT doesn't have user data, try to fetch from Clerk API
        if not any([email, given_name, family_name, name, first_name, last_name]):
            api_user_data = self.fetch_user_from_clerk_api(clerk_id)
            if api_user_data:
                # Extract data from API response
                email = api_user_data.get('email_addresses', [{}])[0].get('email_address', '') if api_user_data.get('email_addresses') else ''
                first_name = api_user_data.get('first_name', '')
                last_name = api_user_data.get('last_name', '')
                name = api_user_data.get('full_name', '')

        # Prefer given_name/family_name, then name, then first_name/last_name
        if given_name or family_name:
            use_first = given_name or ''
            use_last = family_name or ''
        elif name:
            parts = name.split()
            use_first = parts[0]
            use_last = ' '.join(parts[1:]) if len(parts) > 1 else ''
        else:
            use_first = first_name or ''
            use_last = last_name or ''

        # Generate a better username
        if use_first and use_last:
            username = f"{use_first.lower()}{use_last.lower().replace(' ', '')}"
        elif use_first:
            username = use_first.lower()
        elif email:
            username = email.split('@')[0]
        else:
            username = f"user_{clerk_id[:8]}"

        # Ensure username is unique
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exclude(clerk_id=clerk_id).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user, created = User.objects.get_or_create(
            clerk_id=clerk_id,
            defaults={
                'username': username,
                'email': email,
                'first_name': use_first,
                'last_name': use_last,
            }
        )
        # Always update user with latest Clerk info
        updated = False
        if user.email != email and email:
            user.email = email
            updated = True
        if user.first_name != use_first and use_first:
            user.first_name = use_first
            updated = True
        if user.last_name != use_last and use_last:
            user.last_name = use_last
            updated = True
        if user.username != username and username:
            user.username = username
            updated = True
        if updated:
            user.save()
        return user 