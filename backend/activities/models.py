from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta

User = get_user_model()


class Activity(models.Model):
    """Model for tracking activities/habits"""
    
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('custom', 'Custom'),
    ]
    
    CATEGORY_CHOICES = [
        ('health_fitness', 'Health & Fitness'),
        ('personal_growth', 'Personal Growth'),
        ('learning', 'Learning'),
        ('work', 'Work'),
        ('hobbies', 'Hobbies'),
        ('social', 'Social'),
        ('wellness', 'Wellness'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    color = models.CharField(max_length=7, default='#8B5CF6')  # Hex color
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    
    # Optional fields
    description = models.TextField(blank=True)
    target_days = models.PositiveIntegerField(default=1)  # For weekly/custom frequency
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'activities'
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['user', 'category']),
            models.Index(fields=['user', 'frequency']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.user.username})"
    
    @property
    def current_streak(self):
        """Calculate current streak"""
        today = timezone.now().date()
        entries = self.streak_entries.filter(completed=True).order_by('-date')
        
        if not entries.exists():
            return 0
        
        streak = 0
        current_date = today
        
        while True:
            entry = entries.filter(date=current_date).first()
            if entry and entry.completed:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return streak
    
    @property
    def best_streak(self):
        """Calculate best streak"""
        entries = self.streak_entries.filter(completed=True).order_by('date')
        
        if not entries.exists():
            return 0
        
        max_streak = 0
        current_streak = 0
        prev_date = None
        
        for entry in entries:
            if prev_date is None:
                current_streak = 1
            elif (entry.date - prev_date).days == 1:
                current_streak += 1
            else:
                max_streak = max(max_streak, current_streak)
                current_streak = 1
            
            prev_date = entry.date
        
        max_streak = max(max_streak, current_streak)
        return max_streak
    
    @property
    def total_completions(self):
        """Calculate total number of completions"""
        return self.streak_entries.filter(completed=True).count()
    
    @property
    def completed_today(self):
        """Check if activity is completed today"""
        today = timezone.now().date()
        return self.streak_entries.filter(date=today, completed=True).exists()
    
    @property
    def weekly_progress(self):
        """Calculate weekly progress percentage"""
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        if self.frequency == 'daily':
            total_days = min(7, (week_end - week_start).days + 1)
            completed_days = self.streak_entries.filter(
                date__gte=week_start,
                date__lte=week_end,
                completed=True
            ).count()
            return round((completed_days / total_days) * 100) if total_days > 0 else 0
        elif self.frequency == 'weekly':
            # For weekly activities, check if completed this week
            return 100 if self.streak_entries.filter(
                date__gte=week_start,
                date__lte=week_end,
                completed=True
            ).exists() else 0
        else:
            # For custom frequency, calculate based on target_days
            completed_days = self.streak_entries.filter(
                date__gte=week_start,
                date__lte=week_end,
                completed=True
            ).count()
            return round((completed_days / self.target_days) * 100) if self.target_days > 0 else 0


class StreakEntry(models.Model):
    """Model for tracking daily streak entries"""
    
    date = models.DateField()
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='streak_entries')
    completed = models.BooleanField(default=False)
    note = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'streak_entries'
        verbose_name = 'Streak Entry'
        verbose_name_plural = 'Streak Entries'
        unique_together = ['date', 'activity']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['activity', 'date']),
            models.Index(fields=['activity', 'date', 'completed']),
            models.Index(fields=['date', 'completed']),
            models.Index(fields=['activity', 'completed']),
        ]
    
    def __str__(self):
        status = "✓" if self.completed else "✗"
        return f"{self.activity.title} - {self.date} {status}"
    
    def save(self, *args, **kwargs):
        """Override save to ensure only one entry per date per activity"""
        if not self.pk:
            # Check if entry already exists for this date and activity
            existing = StreakEntry.objects.filter(
                date=self.date,
                activity=self.activity
            ).first()
            if existing:
                # Update existing entry
                existing.completed = self.completed
                existing.note = self.note
                existing.save()
                return
        super().save(*args, **kwargs)
