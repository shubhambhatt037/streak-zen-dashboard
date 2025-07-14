from django.core.management.base import BaseCommand
from activities.email_service import EmailReminderService
from users.models import User
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test email reminder system by sending a test email to a specific user'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='User ID to send test email to',
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test email to',
        )
        parser.add_argument(
            '--type',
            choices=['midday', 'evening'],
            default='midday',
            help='Type of reminder to test (midday or evening)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force sending the email even if user is not eligible',
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        email = options.get('email')
        reminder_type = options['type']
        force = options.get('force', False)
        
        if not user_id and not email:
            self.stdout.write(
                self.style.ERROR('Please provide either --user-id or --email')
            )
            return
        
        try:
            if user_id:
                user = User.objects.get(id=user_id)
            else:
                user = User.objects.get(email=email)
            
            self.stdout.write(
                f'Testing {reminder_type} reminder for user: {user.email} ({user.first_name or user.username}) [force={force}]'
            )
            
            if reminder_type == 'midday':
                success = EmailReminderService.send_midday_reminder(user, force=force)
            else:
                success = EmailReminderService.send_evening_reminder(user, force=force)
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS(f'Test {reminder_type} reminder sent successfully!')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Test {reminder_type} reminder not sent (user may not be eligible)')
                )
                
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User not found with {"ID " + str(user_id) if user_id else "email " + email}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error sending test email: {str(e)}')
            )
            logger.error(f'Error in test_email_reminders command: {str(e)}') 