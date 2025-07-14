from django.core.management.base import BaseCommand
from activities.email_service import EmailReminderService
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Send evening reminders to users who have incomplete activities'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending emails',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No emails will be sent')
            )
        
        try:
            if dry_run:
                # In dry run mode, just show what would be sent
                from users.models import User
                from activities.models import Activity, StreakEntry
                from django.utils import timezone
                
                users = User.objects.filter(is_active=True)
                eligible_users = 0
                
                for user in users:
                    activities = Activity.objects.filter(user=user)
                    if not activities.exists():
                        continue
                    
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
                    
                    if incomplete_activities:
                        eligible_users += 1
                        self.stdout.write(
                            f"Would send evening reminder to: {user.email} ({user.first_name or user.username}) - {len(incomplete_activities)} incomplete activities"
                        )
                
                self.stdout.write(
                    self.style.SUCCESS(f'Dry run complete. Would send {eligible_users} evening reminders.')
                )
            else:
                # Actually send the reminders
                sent_count = EmailReminderService.send_evening_reminders_to_all_users()
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully sent {sent_count} evening reminders.')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error sending evening reminders: {str(e)}')
            )
            logger.error(f'Error in send_evening_reminders command: {str(e)}') 