from django.contrib import admin
from .models import Activity, StreakEntry


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    """Admin interface for Activity model"""
    
    list_display = ('title', 'user', 'category', 'frequency', 'current_streak', 'best_streak', 'completed_today', 'created_at')
    list_filter = ('category', 'frequency', 'created_at', 'user')
    search_fields = ('title', 'description', 'user__username', 'user__email')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('title', 'user', 'category', 'frequency')}),
        ('Appearance', {'fields': ('color', 'description')}),
        ('Settings', {'fields': ('target_days',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def current_streak(self, obj):
        return obj.current_streak
    current_streak.short_description = 'Current Streak'
    
    def best_streak(self, obj):
        return obj.best_streak
    best_streak.short_description = 'Best Streak'
    
    def completed_today(self, obj):
        return "✓" if obj.completed_today else "✗"
    completed_today.short_description = 'Completed Today'


@admin.register(StreakEntry)
class StreakEntryAdmin(admin.ModelAdmin):
    """Admin interface for StreakEntry model"""
    
    list_display = ('activity', 'date', 'completed', 'user', 'created_at')
    list_filter = ('completed', 'date', 'activity__category', 'activity__user')
    search_fields = ('activity__title', 'note', 'activity__user__username')
    ordering = ('-date', '-created_at')
    
    fieldsets = (
        (None, {'fields': ('activity', 'date', 'completed')}),
        ('Details', {'fields': ('note',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def user(self, obj):
        return obj.activity.user.username
    user.short_description = 'User'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('activity__user')
