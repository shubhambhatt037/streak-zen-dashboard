from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with Clerk"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                 'bio', 'profile_picture', 'timezone', 'email_notifications', 
                 'reminder_time', 'date_joined', 'last_login', 'clerk_id')
        read_only_fields = ('id', 'username', 'date_joined', 'last_login', 'clerk_id')
    
    def get_full_name(self, obj):
        return obj.full_name


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile with Clerk"""
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'bio', 'profile_picture', 
                 'timezone', 'email_notifications', 'reminder_time') 