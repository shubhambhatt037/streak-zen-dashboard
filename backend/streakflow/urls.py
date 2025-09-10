"""
URL configuration for streakflow project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from activities import health_views

# Schema view for API documentation
schema_view = get_schema_view(
    openapi.Info(
        title="StreakFlow API",
        default_version='v1',
        description="API for StreakFlow habit tracking application",
        terms_of_service="https://www.streakflow.com/terms/",
        contact=openapi.Contact(email="contact@streakflow.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Root health check endpoint for cron jobs
    path('', health_views.root_health, name='root_health'),
    
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/', include([
        path('users/', include('users.urls')),
        path('activities/', include('activities.urls')),
    ])),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api-docs/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]
