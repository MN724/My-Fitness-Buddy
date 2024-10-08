"""
URL configuration for MyFitnessBuddyDjango project.

This module defines the URL patterns for the Django application.
It routes URLs to views for user registration, login, survey submission, and fitness plan generation.

Based on standard Django URL routing practices:
- Django URL dispatcher documentation: https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""

from django.urls import path
from .views import register_user, login_user, submit_survey, get_user_details, delete_and_replace_exercise

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('survey/', submit_survey, name='submit_survey'),
    path('details/', get_user_details, name='get_user_details'),
    path('delete/', delete_and_replace_exercise, name='delete_and_replace_exercise')
]
