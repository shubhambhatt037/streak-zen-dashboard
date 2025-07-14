from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model for StreakFlow with Clerk integration"""
    
    # Clerk integration
    clerk_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    # Additional fields
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.URLField(blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    reminder_time = models.TimeField(default='09:00:00')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    @property
    def full_name(self):
        """Return the user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
