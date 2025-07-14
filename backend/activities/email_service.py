import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import datetime, time
from activities.models import Activity, StreakEntry

logger = logging.getLogger(__name__)

class EmailReminderService:
    """Service for sending email reminders to users"""
    
    @staticmethod
    def send_midday_reminder(user, force=False):
        """Send midday reminder if user hasn't completed any activities today, or always if force=True"""
        try:
            activities = Activity.objects.filter(user=user)
            if not activities.exists():
                logger.info(f"No activities found for user {user.id}, skipping midday reminder")
                if not force:
                    return False
            today = timezone.now().date()
            completed_today = StreakEntry.objects.filter(
                activity__user=user,
                date=today,
                completed=True
            ).exists()
            if completed_today and not force:
                logger.info(f"User {user.id} has already completed activities today, skipping midday reminder")
                return False
            # Use all activities for the email context
            user_activities = activities[:5]
            context = {
                'user': user,
                'activities': user_activities,
                'dashboard_url': f"{settings.FRONTEND_URL}/dashboard" if hasattr(settings, 'FRONTEND_URL') else "http://localhost:5173",
            }
            html_message = render_to_string('emails/midday_reminder.html', context)
            plain_message = render_to_string('emails/midday_reminder.txt', context)
            send_mail(
                subject='Keep Your Streak Alive 🔥',
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Midday reminder sent to user {user.id} ({user.email}) [force={force}]")
            return True
        except Exception as e:
            logger.error(f"Error sending midday reminder to user {user.id}: {str(e)}")
            return False
    
    @staticmethod
    def send_evening_reminder(user, force=False):
        """Send evening reminder if user has incomplete activities, or always if force=True"""
        try:
            activities = Activity.objects.filter(user=user)
            if not activities.exists():
                logger.info(f"No activities found for user {user.id}, skipping evening reminder")
                if not force:
                    return False
            today = timezone.now().date()
            incomplete_activities = []
            for activity in activities:
                completed_today = StreakEntry.objects.filter(
                    activity=activity,
                    date=today,
                    completed=True
                ).exists()
                if not completed_today:
                    incomplete_activities.append(activity)
            if not incomplete_activities and not force:
                logger.info(f"User {user.id} has completed all activities today, skipping evening reminder")
                return False
            context = {
                'user': user,
                'incomplete_activities': incomplete_activities,
                'dashboard_url': f"{settings.FRONTEND_URL}/dashboard" if hasattr(settings, 'FRONTEND_URL') else "http://localhost:5173",
            }
            html_message = render_to_string('emails/evening_reminder.html', context)
            plain_message = render_to_string('emails/evening_reminder.txt', context)
            send_mail(
                subject='One Last Push for Today 🚀',
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Evening reminder sent to user {user.id} ({user.email}) for {len(incomplete_activities)} incomplete activities [force={force}]")
            return True
        except Exception as e:
            logger.error(f"Error sending evening reminder to user {user.id}: {str(e)}")
            return False
    
    @staticmethod
    def send_midday_reminders_to_all_users():
        from users.models import User
        users = User.objects.filter(is_active=True)
        sent_count = 0
        for user in users:
            if EmailReminderService.send_midday_reminder(user):
                sent_count += 1
        logger.info(f"Midday reminders sent to {sent_count} users")
        return sent_count
    
    @staticmethod
    def send_evening_reminders_to_all_users():
        from users.models import User
        users = User.objects.filter(is_active=True)
        sent_count = 0
        for user in users:
            if EmailReminderService.send_evening_reminder(user):
                sent_count += 1
        logger.info(f"Evening reminders sent to {sent_count} users")
        return sent_count 