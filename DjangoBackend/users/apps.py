"""
App configuration for the users app in MyFitnessBuddyDjango project.

This module defines the configuration for the users app, including app name and ready method.

Based on standard Django app configuration practices:
- Django apps documentation: https://docs.djangoproject.com/en/5.0/ref/applications/
"""
from django.apps import AppConfig


class UsersConfig(AppConfig):
    """
    Configuration for the Users app.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        """Import users.firebase to ensure Firebase is initialized
        when the app is ready."""
        import users.firebase   # noqa: F401
