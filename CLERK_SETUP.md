# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your StreakFlow application.

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Configure Your Clerk Application

### Frontend Configuration

1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Create a `.env` file in your frontend root directory:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
```

### Backend Configuration

1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. Go to **JWT Templates** and note your **JWT Audience** and **JWT Issuer**
4. Create a `.env` file in your backend directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1

# Clerk Settings
CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key
CLERK_JWT_AUDIENCE=your-jwt-audience
CLERK_JWT_ISSUER=https://clerk.your-domain.com

# Email Settings (for reminders)
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

## 3. Configure Clerk JWT Settings

1. In your Clerk dashboard, go to **JWT Templates**
2. Create a new JWT template or use the default one
3. Make sure the template includes these claims:
   - `sub` (user ID)
   - `email`
   - `username` (optional)
   - `first_name` (optional)
   - `last_name` (optional)

## 4. Configure CORS in Clerk

1. In your Clerk dashboard, go to **Settings** > **Domains**
2. Add your frontend domain (e.g., `http://localhost:5173`)
3. Add your backend domain (e.g., `http://127.0.0.1:8000`)

## 5. Run the Application

### Backend
```bash
cd backend
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
npm run dev
```

## 6. Test the Integration

1. Open your frontend application
2. You should see Clerk's sign-in page
3. Sign up or sign in with your email
4. You should be redirected to the dashboard
5. Check that your user data is synced with the backend

## 7. Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your domains are added to Clerk's allowed domains
2. **JWT Verification Failed**: Check that your JWT audience and issuer are correct
3. **User Not Created**: The backend automatically creates users on first API call

### Debug Steps

1. Check browser console for frontend errors
2. Check Django logs for backend errors
3. Verify your environment variables are loaded correctly
4. Ensure Clerk keys are correct and active

## 8. Production Deployment

For production:

1. Use production Clerk keys (`pk_live_` and `sk_live_`)
2. Update CORS settings for your production domains
3. Use a production database (PostgreSQL recommended)
4. Set `DEBUG=False` in Django settings
5. Use environment variables for all sensitive data

## 9. Features

With this setup, you get:

- ✅ Secure authentication with Clerk
- ✅ Automatic user creation in backend
- ✅ JWT token verification
- ✅ User profile management
- ✅ Protected API endpoints
- ✅ CORS support
- ✅ Modern UI components from Clerk

## 10. Next Steps

- Customize the Clerk UI components
- Add more user profile fields
- Implement email verification
- Add social login providers
- Set up webhooks for user events 
