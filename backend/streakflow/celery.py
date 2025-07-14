import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'streakflow.settings')

app = Celery('streakflow')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


# Email reminder task
@app.task
def send_daily_reminders():
    """Send daily reminders to users for their activities"""
    from django.core.mail import send_mail
    from django.template.loader import render_to_string
    from django.utils import timezone
    from users.models import User
    from activities.models import Activity
    
    today = timezone.now().date()
    
    # Get all users with email notifications enabled
    users = User.objects.filter(email_notifications=True, is_active=True)
    
    for user in users:
        # Get user's activities that haven't been completed today
        incomplete_activities = []
        for activity in user.activities.all():
            if not activity.completed_today:
                incomplete_activities.append(activity)
        
        if incomplete_activities:
            # Send reminder email
            subject = f"StreakFlow Reminder - {today.strftime('%B %d, %Y')}"
            
            # Simple email template
            message = f"""
            Hello {user.first_name or user.username},
            
            You have {len(incomplete_activities)} activities that haven't been completed today:
            
            """
            
            for activity in incomplete_activities:
                message += f"• {activity.title} (Current streak: {activity.current_streak} days)\n"
            
            message += f"""
            
            Keep your streaks alive! Complete your activities today.
            
            Best regards,
            StreakFlow Team
            """
            
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
                print(f"Reminder sent to {user.email}")
            except Exception as e:
                print(f"Failed to send reminder to {user.email}: {e}")


# Weekly summary task
@app.task
def send_weekly_summaries():
    """Send weekly summaries to users"""
    from django.core.mail import send_mail
    from django.utils import timezone
    from users.models import User
    
    # This would be scheduled to run weekly
    # Implementation similar to daily reminders but with weekly stats
    pass 