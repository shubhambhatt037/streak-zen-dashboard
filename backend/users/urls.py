from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Profile management with Clerk
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.UserUpdateView.as_view(), name='profile_update'),
    
    # Stats
    path('stats/', views.user_stats, name='user_stats'),
    path('profile/stats/', views.user_profile_stats, name='user_profile_stats'),
    
    # User info endpoints
    path('current/', views.current_user_info, name='current_user_info'),
    path('all/', views.all_users_info, name='all_users_info'),
] 