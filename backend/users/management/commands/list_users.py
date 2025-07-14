from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import datetime, timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'List all users with their login status and activity'

    def add_arguments(self, parser):
        parser.add_argument(
            '--active',
            action='store_true',
            help='Show only recently active users (last 24 hours)',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed information',
        )

    def handle(self, *args, **options):
        users = User.objects.all().order_by('-last_login')
        
        if options['active']:
            # Show only users active in last 24 hours
            cutoff_time = datetime.now(timezone.utc) - timezone.timedelta(hours=24)
            users = users.filter(last_login__gte=cutoff_time)
            self.stdout.write(f"=== ACTIVE USERS (Last 24 hours) ===")
        else:
            self.stdout.write(f"=== ALL USERS ===")
        
        self.stdout.write(f"Total users: {users.count()}")
        
        for user in users:
            self.stdout.write(f"\n👤 User: {user.full_name}")
            self.stdout.write(f"   Username: {user.username}")
            self.stdout.write(f"   Email: {user.email}")
            self.stdout.write(f"   Clerk ID: {user.clerk_id}")
            self.stdout.write(f"   Joined: {user.date_joined.strftime('%Y-%m-%d %H:%M')}")
            
            if user.last_login:
                time_since_login = datetime.now(timezone.utc) - user.last_login
                self.stdout.write(f"   Last Login: {user.last_login.strftime('%Y-%m-%d %H:%M')}")
                self.stdout.write(f"   Time since login: {time_since_login}")
            else:
                self.stdout.write(f"   Last Login: Never")
            
            if options['verbose']:
                self.stdout.write(f"   Bio: {user.bio or 'No bio'}")
                self.stdout.write(f"   Timezone: {user.timezone}")
                self.stdout.write(f"   Email Notifications: {user.email_notifications}")
            
            self.stdout.write("-" * 50) 