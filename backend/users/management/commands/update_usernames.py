from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Update existing users with better usernames based on their names'

    def handle(self, *args, **options):
        users = User.objects.all()
        updated_count = 0

        for user in users:
            old_username = user.username
            
            # Generate better username
            if user.first_name and user.last_name:
                new_username = f"{user.first_name.lower()}{user.last_name.lower()}"
            elif user.first_name:
                new_username = user.first_name.lower()
            elif user.email:
                new_username = user.email.split('@')[0]
            else:
                continue  # Skip if no name or email
            
            # Ensure username is unique
            base_username = new_username
            counter = 1
            while User.objects.filter(username=new_username).exclude(id=user.id).exists():
                new_username = f"{base_username}{counter}"
                counter += 1
            
            # Update if username changed
            if new_username != old_username:
                user.username = new_username
                user.save()
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Updated user {old_username} -> {new_username}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} usernames')
        ) 