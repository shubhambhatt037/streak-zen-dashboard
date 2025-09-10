from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()


class Command(BaseCommand):
    help = 'Debug user creation and authentication issues'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clerk-id',
            type=str,
            help='Check specific Clerk ID',
        )
        parser.add_argument(
            '--list-all',
            action='store_true',
            help='List all users in the database',
        )
        parser.add_argument(
            '--check-duplicates',
            action='store_true',
            help='Check for duplicate Clerk IDs',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Debugging User Issues...\n'))

        if options['list_all']:
            self.list_all_users()

        if options['check_duplicates']:
            self.check_duplicates()

        if options['clerk_id']:
            self.check_specific_user(options['clerk_id'])

        if not any([options['list_all'], options['check_duplicates'], options['clerk_id']]):
            self.show_summary()

    def list_all_users(self):
        """List all users in the database"""
        self.stdout.write(self.style.WARNING('📋 All Users in Database:'))
        users = User.objects.all().order_by('created_at')
        
        if not users.exists():
            self.stdout.write(self.style.ERROR('❌ No users found in database'))
            return

        for user in users:
            self.stdout.write(f"  • {user.username} (ID: {user.id}, Clerk ID: {user.clerk_id})")
            self.stdout.write(f"    Email: {user.email}, Created: {user.created_at}")
        
        self.stdout.write(f"\nTotal users: {users.count()}\n")

    def check_duplicates(self):
        """Check for duplicate Clerk IDs"""
        self.stdout.write(self.style.WARNING('🔍 Checking for duplicate Clerk IDs:'))
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT clerk_id, COUNT(*) as count 
                FROM users 
                WHERE clerk_id IS NOT NULL 
                GROUP BY clerk_id 
                HAVING COUNT(*) > 1
            """)
            
            duplicates = cursor.fetchall()
            
            if duplicates:
                self.stdout.write(self.style.ERROR('❌ Found duplicate Clerk IDs:'))
                for clerk_id, count in duplicates:
                    self.stdout.write(f"  • Clerk ID: {clerk_id} (appears {count} times)")
            else:
                self.stdout.write(self.style.SUCCESS('✅ No duplicate Clerk IDs found'))
        
        self.stdout.write()

    def check_specific_user(self, clerk_id):
        """Check specific user by Clerk ID"""
        self.stdout.write(self.style.WARNING(f'🔍 Checking user with Clerk ID: {clerk_id}'))
        
        try:
            user = User.objects.get(clerk_id=clerk_id)
            self.stdout.write(self.style.SUCCESS('✅ User found:'))
            self.stdout.write(f"  • Username: {user.username}")
            self.stdout.write(f"  • Email: {user.email}")
            self.stdout.write(f"  • First Name: {user.first_name}")
            self.stdout.write(f"  • Last Name: {user.last_name}")
            self.stdout.write(f"  • Created: {user.created_at}")
            self.stdout.write(f"  • Updated: {user.updated_at}")
            
            # Check if user has activities
            activities_count = user.activities.count()
            self.stdout.write(f"  • Activities: {activities_count}")
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('❌ User not found in database'))
            self.stdout.write('This could be the cause of "External Account was not found" error')
        
        self.stdout.write()

    def show_summary(self):
        """Show summary of user database"""
        self.stdout.write(self.style.WARNING('📊 User Database Summary:'))
        
        total_users = User.objects.count()
        users_with_clerk_id = User.objects.exclude(clerk_id__isnull=True).exclude(clerk_id='').count()
        users_without_clerk_id = total_users - users_with_clerk_id
        
        self.stdout.write(f"  • Total users: {total_users}")
        self.stdout.write(f"  • Users with Clerk ID: {users_with_clerk_id}")
        self.stdout.write(f"  • Users without Clerk ID: {users_without_clerk_id}")
        
        if users_without_clerk_id > 0:
            self.stdout.write(self.style.WARNING('⚠️  Some users don\'t have Clerk IDs - this might cause issues'))
        
        # Show recent users
        recent_users = User.objects.order_by('-created_at')[:5]
        if recent_users:
            self.stdout.write(f"\n📅 Recent users (last 5):")
            for user in recent_users:
                self.stdout.write(f"  • {user.username} ({user.clerk_id}) - {user.created_at}")
        
        self.stdout.write()
