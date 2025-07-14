# StreakFlow - Habit Tracking Dashboard

A modern, full-stack habit tracking application built with React, TypeScript, Django, and Clerk authentication.

---

**Folder Structure Update:**
- The frontend (React/Vite) code is now located in the `frontend/` directory.
- The backend (Django) code remains in the `backend/` directory.

---

## 🚀 Features

### Core Features
- **Habit Tracking**: Create and track daily habits with streak counting
- **Progress Visualization**: Beautiful charts and progress rings
- **Calendar View**: Heatmap calendar to visualize your progress
- **Analytics**: Detailed insights into your habit performance
- **Reminders**: Email notifications to keep you on track
- **Modern UI**: Clean, responsive design with dark/light mode

### Authentication & Security
- **Clerk Authentication**: Secure, modern authentication with pre-built UI components
- **JWT Tokens**: Secure API communication
- **User Profiles**: Customizable user profiles with preferences
- **Protected Routes**: Secure access to user-specific data

### Technical Features
- **Real-time Updates**: Live dashboard updates
- **Responsive Design**: Works on desktop and mobile
- **API-first Architecture**: RESTful API with comprehensive endpoints
- **Database Migrations**: Easy schema updates
- **Environment Configuration**: Flexible configuration management

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Clerk** for authentication
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Django 5.2** with Python 3.13
- **Django REST Framework** for APIs
- **Custom Clerk Authentication** for secure user management
- **SQLite** (dev) / **PostgreSQL** (prod)
- **Celery** for background tasks
- **Redis** for task queue
- **CORS** enabled for frontend integration

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.13+
- Redis (for background tasks)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd streak-zen-dashboard
```

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Create environment file
cp env.example .env

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### 4. Clerk Authentication Setup
See [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed instructions on setting up Clerk authentication.

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key
```

#### Backend (.env)
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Clerk Settings
CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key
CLERK_JWT_AUDIENCE=your-jwt-audience
CLERK_JWT_ISSUER=https://clerk.your-domain.com

# Database
DATABASE_URL=sqlite:///db.sqlite3

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

## 🚀 Running the Application

### Development
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
python manage.py runserver

# Terminal 3 - Celery (optional, for email reminders)
cd backend
celery -A streakflow worker --loglevel=info
```

### Production
```bash
# Build frontend
npm run build

# Deploy backend
python manage.py collectstatic
python manage.py migrate
gunicorn streakflow.wsgi:application
```

## 📚 API Documentation

### Authentication
All API endpoints require authentication via Clerk JWT tokens.

### Endpoints

#### Users
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/update/` - Update user profile
- `GET /api/users/stats/` - Get user statistics

#### Activities
- `GET /api/activities/` - List user activities
- `POST /api/activities/` - Create new activity
- `GET /api/activities/{id}/` - Get activity details
- `PUT /api/activities/{id}/` - Update activity
- `DELETE /api/activities/{id}/` - Delete activity
- `POST /api/activities/{id}/complete/` - Mark activity as completed

#### Dashboard
- `GET /api/activities/dashboard/` - Get dashboard statistics
- `GET /api/activities/calendar/` - Get calendar entries
- `GET /api/activities/analytics/` - Get analytics data

#### Streak Entries
- `GET /api/streak-entries/` - List streak entries
- `POST /api/streak-entries/` - Create streak entry
- `GET /api/streak-entries/{id}/` - Get streak entry
- `PUT /api/streak-entries/{id}/` - Update streak entry
- `DELETE /api/streak-entries/{id}/` - Delete streak entry

## 🏗 Project Structure

```
streak-zen-dashboard/
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── activities/          # Activity-related components
│   │   ├── calendar/            # Calendar components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── layout/              # Layout components
│   │   ├── profile/             # Profile components
│   │   ├── settings/            # Settings components
│   │   └── ui/                  # Reusable UI components
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Utility functions
│   └── pages/                   # Page components
├── backend/                     # Django backend
│   ├── activities/              # Activities app
│   ├── users/                   # Users app
│   ├── streakflow/              # Django project settings
│   └── requirements.txt         # Python dependencies
├── public/                      # Static assets
└── README.md                    # This file
```

## 🔐 Authentication Flow

1. **User signs up/in** via Clerk's pre-built UI components
2. **Clerk generates JWT token** with user information
3. **Frontend stores token** in localStorage
4. **API requests include token** in Authorization header
5. **Backend verifies token** using Clerk's public keys
6. **User is created/retrieved** in Django database
7. **Protected endpoints** return user-specific data

## 📊 Data Models

### User
- `clerk_id`: Unique Clerk user identifier
- `username`, `email`: User credentials
- `first_name`, `last_name`: User information
- `bio`, `profile_picture`: Profile details
- `timezone`, `email_notifications`: Preferences

### Activity
- `user`: Foreign key to User
- `title`, `description`: Activity details
- `category`, `frequency`: Activity classification
- `color`: Visual customization
- `current_streak`, `best_streak`: Streak tracking
- `total_completions`: Completion statistics

### StreakEntry
- `activity`: Foreign key to Activity
- `date`: Entry date
- `completed`: Completion status
- `note`: Optional notes

## 🎨 UI Components

Built with **shadcn/ui** and **Tailwind CSS**:
- **Cards**: Activity cards, stat cards
- **Progress Rings**: Visual progress indicators
- **Calendar**: Heatmap calendar view
- **Forms**: Activity creation, profile updates
- **Navigation**: Sidebar, breadcrumbs
- **Modals**: Confirmation dialogs

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Run migrations
python manage.py migrate
# Deploy with gunicorn
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the [CLERK_SETUP.md](./CLERK_SETUP.md) for authentication setup
- Review the API documentation above
- Check browser console and Django logs for errors
- Ensure all environment variables are set correctly

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Social features (sharing streaks)
- [ ] Advanced analytics
- [ ] Integration with calendar apps
- [ ] Team/group challenges
- [ ] Export data functionality
