from django.contrib.auth import get_user_model

User = get_user_model()


def get_or_create_user_with_clerk_data(clerk_user):
    """
    Get or create a user with proper Clerk data handling.
    Updates existing user data if new information is available.
    """
    clerk_id = clerk_user.clerk_id
    
    user, created = User.objects.get_or_create(
        clerk_id=clerk_id,
        defaults={
            'username': clerk_user.username or clerk_user.email,
            'email': clerk_user.email,
            'first_name': clerk_user.first_name or '',
            'last_name': clerk_user.last_name or '',
        }
    )
    
    # Update user data if not created or if new data is available
    if not created:
        updated = False
        
        if clerk_user.email and clerk_user.email != user.email:
            user.email = clerk_user.email
            updated = True
            
        if clerk_user.first_name and clerk_user.first_name != user.first_name:
            user.first_name = clerk_user.first_name
            updated = True
            
        if clerk_user.last_name and clerk_user.last_name != user.last_name:
            user.last_name = clerk_user.last_name
            updated = True
        
        if updated:
            user.save()
    
    return user 