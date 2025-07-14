# StreakFlow Backend

A Django REST Framework backend for the StreakFlow habit tracking application.

## Features

### 🔐 Authentication
- JWT-based authentication with `djangorestframework-simplejwt`
- User registration, login, logout
- Password change functionality
- User profile management

### 📊 Core Models
- **User**: Extended Django user model with additional fields
- **Activity**: Habit/activity tracking with categories and frequencies
- **StreakEntry**: Daily completion tracking with notes

### 🧮 Calculated Fields
- Current streak calculation
- Best streak tracking
- Total completions count
- Daily progress tracking
- Weekly progress percentages

### 📅 Calendar & Notes
- Calendar entries for date ranges
- Daily notes with activities
- Heatmap data for calendar visualization

### 📧 Reminders
- Email reminder system (Celery tasks)
- Configurable reminder times
- Daily and weekly summaries

### 🛠️ API Features
- RESTful API design
- Comprehensive filtering and search
- Pagination support
- API documentation with Swagger/OpenAPI

## Setup

### Prerequisites
- Python 3.8+
- PostgreSQL (for production)
- Redis (for Celery)

### Installation

1. **Clone and setup virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment configuration**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser**
```bash
python manage.py createsuperuser
```

6. **Run development server**
```bash
python manage.py runserver
```

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `POST /api/users/token/refresh/` - Refresh JWT token

### User Management
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/update/` - Update user profile
- `POST /api/users/change-password/` - Change password
- `GET /api/users/stats/` - Get user statistics

### Activities
- `GET /api/activities/` - List activities
- `POST /api/activities/` - Create activity
- `GET /api/activities/{id}/` - Get activity details
- `PUT /api/activities/{id}/` - Update activity
- `DELETE /api/activities/{id}/` - Delete activity
- `GET /api/activities/search/` - Search activities

### Streak Entries
- `GET /api/activities/entries/` - List streak entries
- `POST /api/activities/entries/` - Create streak entry
- `GET /api/activities/entries/{id}/` - Get entry details
- `PUT /api/activities/entries/{id}/` - Update entry
- `DELETE /api/activities/entries/{id}/` - Delete entry

### Dashboard & Calendar
- `GET /api/activities/dashboard/` - Dashboard statistics
- `GET /api/activities/calendar/` - Calendar entries
- `POST /api/activities/complete/{id}/` - Complete activity for today

### Analytics
- `GET /api/activities/analytics/` - Analytics data

## API Documentation

- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`
- JSON Schema: `http://localhost:8000/api-docs/`

## Environment Variables

Create a `.env` file with the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1

# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Celery Settings
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Production Deployment

### Database
For production, use PostgreSQL:
```env
DATABASE_URL=postgres://user:password@localhost:5432/streakflow
```

### Celery
Start Celery worker:
```bash
celery -A streakflow worker -l info
```

Start Celery beat for scheduled tasks:
```bash
celery -A streakflow beat -l info
```

### Static Files
```bash
python manage.py collectstatic
```

## Development

### Running Tests
```bash
python manage.py test
```

### Code Formatting
```bash
pip install black
black .
```

### Database Reset
```bash
python manage.py flush
```

## Models

### User Model
- Extends Django's AbstractUser
- Additional fields: bio, profile_picture, timezone
- Preferences: email_notifications, reminder_time

### Activity Model
- Fields: title, category, color, frequency, user
- Calculated properties: current_streak, best_streak, total_completions, completed_today, weekly_progress
- Categories: Health & Fitness, Personal Growth, Learning, Work, Hobbies, Social, Wellness, Other
- Frequencies: Daily, Weekly, Custom

### StreakEntry Model
- Fields: date, activity, completed, note
- Unique constraint on date + activity
- Automatic entry creation/update on save

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 