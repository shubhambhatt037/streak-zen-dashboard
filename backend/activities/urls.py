from django.urls import path
from . import views
from . import health_views

app_name = 'activities'

urlpatterns = [
    # Activities
    path('', views.ActivityListView.as_view(), name='activity_list'),
    path('<int:pk>/', views.ActivityDetailView.as_view(), name='activity_detail'),
    path('search/', views.search_activities, name='search_activities'),
    
    # Streak Entries
    path('entries/', views.StreakEntryListView.as_view(), name='entry_list'),
    path('entries/<int:pk>/', views.StreakEntryDetailView.as_view(), name='entry_detail'),
    
    # Dashboard and Calendar
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),
    path('calendar/', views.calendar_entries, name='calendar_entries'),
    path('complete/<int:activity_id>/', views.complete_activity, name='complete_activity'),
    
    # Analytics
    path('analytics/', views.analytics, name='analytics'),
    
    # Health Check endpoints
    path('health/', health_views.health_check, name='health_check'),
] 