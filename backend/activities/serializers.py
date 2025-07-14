from rest_framework import serializers
from .models import Activity, StreakEntry
from django.utils import timezone


class StreakEntrySerializer(serializers.ModelSerializer):
    """Serializer for StreakEntry model"""
    
    class Meta:
        model = StreakEntry
        fields = ('id', 'date', 'activity', 'completed', 'note', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_date(self, value):
        """Validate that date is not in the future"""
        if value > timezone.now().date():
            raise serializers.ValidationError("Cannot create entries for future dates")
        return value


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for Activity model with calculated fields"""
    
    # Calculated fields
    current_streak = serializers.ReadOnlyField()
    best_streak = serializers.ReadOnlyField()
    total_completions = serializers.ReadOnlyField()
    completed_today = serializers.ReadOnlyField()
    weekly_progress = serializers.ReadOnlyField()
    
    # Nested serializer for recent entries
    recent_entries = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = ('id', 'title', 'category', 'color', 'frequency', 'description', 
                 'target_days', 'user', 'created_at', 'updated_at',
                 'current_streak', 'best_streak', 'total_completions', 
                 'completed_today', 'weekly_progress', 'recent_entries')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def get_recent_entries(self, obj):
        """Get recent entries for the activity"""
        entries = obj.streak_entries.order_by('-date')[:7]  # Last 7 days
        return StreakEntrySerializer(entries, many=True).data


class ActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating activities"""
    
    class Meta:
        model = Activity
        fields = ('title', 'category', 'color', 'frequency', 'description', 'target_days')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ActivityUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating activities"""
    
    class Meta:
        model = Activity
        fields = ('title', 'category', 'color', 'frequency', 'description', 'target_days')


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    
    total_activities = serializers.IntegerField()
    active_streaks = serializers.IntegerField()
    completed_today = serializers.IntegerField()
    average_streak = serializers.FloatField()
    weekly_progress = serializers.FloatField()
    activities = ActivitySerializer(many=True)


class CalendarEntrySerializer(serializers.Serializer):
    """Serializer for calendar entries"""
    
    date = serializers.DateField()
    activities = serializers.ListField(child=serializers.DictField())
    total_completed = serializers.IntegerField()
    total_activities = serializers.IntegerField()


class StreakEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating streak entries"""
    
    class Meta:
        model = StreakEntry
        fields = ('date', 'activity', 'completed', 'note')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate(self, attrs):
        """Validate that the activity belongs to the user"""
        user = self.context['request'].user
        if attrs['activity'].user != user:
            raise serializers.ValidationError("You can only create entries for your own activities")
        return attrs
    
    def validate_date(self, value):
        """Validate that date is not in the future"""
        if value > timezone.now().date():
            raise serializers.ValidationError("Cannot create entries for future dates")
        return value


class StreakEntryUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating streak entries"""
    
    class Meta:
        model = StreakEntry
        fields = ('completed', 'note')
    
    def validate(self, attrs):
        """Validate that the entry belongs to the user"""
        user = self.context['request'].user
        if self.instance.activity.user != user:
            raise serializers.ValidationError("You can only update entries for your own activities")
        return attrs 