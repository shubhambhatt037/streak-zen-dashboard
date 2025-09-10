from django.contrib.auth import get_user_model

User = get_user_model()


def get_or_create_user_with_clerk_data(clerk_user):
    """
    Get or create a user with proper Clerk data handling.
    Updates existing user data if new information is available.
    """
    if not hasattr(clerk_user, 'clerk_id') or not clerk_user.clerk_id:
        raise ValueError("User does not have a valid Clerk ID")
    
    clerk_id = clerk_user.clerk_id
    
    user, created = User.objects.get_or_create(
        clerk_id=clerk_id,
        defaults={
            'username': getattr(clerk_user, 'username', '') or getattr(clerk_user, 'email', ''),
            'email': getattr(clerk_user, 'email', ''),
            'first_name': getattr(clerk_user, 'first_name', '') or '',
            'last_name': getattr(clerk_user, 'last_name', '') or '',
        }
    )
    
    # Update user data if not created or if new data is available
    if not created:
        updated = False
        
        if getattr(clerk_user, 'email', None) and clerk_user.email != user.email:
            user.email = clerk_user.email
            updated = True
            
        if getattr(clerk_user, 'first_name', None) and clerk_user.first_name != user.first_name:
            user.first_name = clerk_user.first_name
            updated = True
            
        if getattr(clerk_user, 'last_name', None) and clerk_user.last_name != user.last_name:
            user.last_name = clerk_user.last_name
            updated = True
        
        if updated:
            user.save()
    
    return user 