# Email Reminder System for StreakFlow

This system sends automated email reminders to users based on their activity completion status.

## 🔄 Reminder Logic

### Midday Reminder (12 PM)
- **Trigger**: User has not completed any activity for today
- **Subject**: "Keep Your Streak Alive 🔥"
- **Purpose**: Motivational reminder to start the day's activities

### End-of-Day Reminder (11 PM)
- **Trigger**: User has any activities still incomplete for today
- **Subject**: "One Last Push for Today 🚀"
- **Purpose**: Final reminder before midnight to maintain streaks

## 📧 Email Features

- **HTML & Plain Text**: Both formats included for maximum compatibility
- **Personalized Content**: Uses user's name and activity information
- **Call-to-Action**: Direct link to dashboard
- **Responsive Design**: Mobile-friendly email templates
- **Branded**: StreakFlow branding and colors

## 🚀 Setup Instructions

### 1. Email Configuration

Add these environment variables to your `.env` file:

```bash
# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

### 2. Gmail Setup (Recommended)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password as `EMAIL_HOST_PASSWORD`

### 3. Test the System

```bash
# Test with a specific user
python manage.py test_email_reminders --user-id 1 --type midday

# Test with email address
python manage.py test_email_reminders --email user@example.com --type evening
```

## 📋 Management Commands

### Send Midday Reminders
```bash
# Dry run (see what would be sent)
python manage.py send_midday_reminders --dry-run

# Actually send reminders
python manage.py send_midday_reminders
```

### Send Evening Reminders
```bash
# Dry run (see what would be sent)
python manage.py send_evening_reminders --dry-run

# Actually send reminders
python manage.py send_evening_reminders
```

## ⏰ Scheduling (Production)

### Using Cron (Linux/Mac)

Add to your crontab:
```bash
# Midday reminders at 12:00 PM
0 12 * * * cd /path/to/streakflow && python manage.py send_midday_reminders

# Evening reminders at 11:00 PM
0 23 * * * cd /path/to/streakflow && python manage.py send_evening_reminders
```

### Using Celery (Recommended for Production)

1. Install Celery:
```bash
pip install celery redis
```

2. Create a Celery task in `activities/tasks.py`:
```python
from celery import shared_task
from activities.email_service import EmailReminderService

@shared_task
def send_midday_reminders_task():
    return EmailReminderService.send_midday_reminders_to_all_users()

@shared_task
def send_evening_reminders_task():
    return EmailReminderService.send_evening_reminders_to_all_users()
```

3. Schedule with Celery Beat:
```python
# In settings.py
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'send-midday-reminders': {
        'task': 'activities.tasks.send_midday_reminders_task',
        'schedule': crontab(hour=12, minute=0),
    },
    'send-evening-reminders': {
        'task': 'activities.tasks.send_evening_reminders_task',
        'schedule': crontab(hour=23, minute=0),
    },
}
```

## 📊 Monitoring

### Logs
The system logs all email activities:
- `INFO`: Successful email sends
- `ERROR`: Failed email sends
- `WARNING`: Skipped sends (user not eligible)

### Check Logs
```bash
# View recent email logs
tail -f /var/log/streakflow/email_reminders.log
```

## 🔧 Customization

### Email Templates
- HTML: `templates/emails/midday_reminder.html`
- Plain Text: `templates/emails/midday_reminder.txt`
- Evening HTML: `templates/emails/evening_reminder.html`
- Evening Plain Text: `templates/emails/evening_reminder.txt`

### Email Service
- Main logic: `activities/email_service.py`
- Customize reminder logic, content, and timing

### Management Commands
- `activities/management/commands/send_midday_reminders.py`
- `activities/management/commands/send_evening_reminders.py`
- `activities/management/commands/test_email_reminders.py`

## 🛡️ Safety Features

- **Dry Run Mode**: Test without sending emails
- **Error Handling**: Graceful failure with logging
- **User Filtering**: Only sends to active users with activities
- **Completion Checking**: Only sends to eligible users
- **Logging**: Comprehensive logging for debugging

## 📈 Performance

- **Batch Processing**: Processes all users efficiently
- **Database Optimization**: Uses efficient queries
- **Template Caching**: Django template caching
- **Async Ready**: Can be easily converted to async tasks

## 🚨 Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check email credentials in `.env`
   - Verify SMTP settings
   - Check firewall/network settings

2. **Wrong timezone**:
   - Set `TIME_ZONE` in settings.py
   - Ensure server timezone matches

3. **Template errors**:
   - Check template syntax
   - Verify template directory in settings

### Debug Commands
```bash
# Test email configuration
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])

# Check user eligibility
python manage.py shell
>>> from users.models import User
>>> from activities.models import Activity
>>> user = User.objects.first()
>>> Activity.objects.filter(user=user).count()
```

## 📝 Environment Variables

Required environment variables:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

Optional:
```bash
EMAIL_USE_SSL=False
EMAIL_TIMEOUT=30
DEFAULT_FROM_EMAIL=your-email@gmail.com
``` 