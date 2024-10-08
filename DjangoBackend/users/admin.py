"""
Django admin configuration for MyFitnessBuddyDjango project.

This module registers the data models with the Django admin site to manage them through the admin interface.

Based on standard Django admin practices:
- Django admin documentation: https://docs.djangoproject.com/en/5.0/ref/contrib/admin/
"""
from django.contrib import admin
from .models import User, Survey, FitnessPlan, PlanDay, PlanDayExercise, Exercise


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """User class to display users information and related survey and fitness plan status."""
    list_display = ('email', 'firebase_uid', 'created_at', 'updated_at', 'survey_details', 'fitness_plan_details')

    @admin.display(description='Survey Details')
    def survey_details(self, obj: User) -> str:
        """Display survey details for the user."""
        survey = Survey.objects.filter(user=obj).first()
        if survey:
            return (f"Goal: {survey.fitness_goal}, Type: {survey.body_type}, Level: {survey.fitness_level}, "
                    f"Equipment: {survey.equipment}")
        return "No survey"

    @admin.display(description='Fitness Plan Details')
    def fitness_plan_details(self, obj: User) -> str:
        """Display fitness plan details for the user."""
        fitness_plan = FitnessPlan.objects.filter(user=obj).first()
        if fitness_plan:
            return (f"Title: {fitness_plan.fitness_plan_name}, Start: {fitness_plan.start_date}, "
                    f"End: {fitness_plan.end_date}")
        return "No fitness plan"


class PlanDayExerciseInline(admin.TabularInline):
    model = PlanDayExercise
    extra = 0
    fields = ['exercise', 'sets', 'reps', 'duration']


class PlanDayAdmin(admin.ModelAdmin):
    inlines = [PlanDayExerciseInline]
    list_display = ['day_of_week', 'get_user']

    @admin.display(description='User')
    def get_user(self, obj):
        return obj.plan.user.email


class PlanDayInline(admin.TabularInline):
    model = PlanDay
    extra = 0
    fields = ['day_of_week', 'get_user']
    readonly_fields = ['get_user']
    show_change_link = True

    @admin.display(description='User')
    def get_user(self, obj):
        return obj.plan.user.email


class FitnessPlanAdmin(admin.ModelAdmin):
    list_display = ['fitness_plan_name', 'fitness_plan_desc', 'start_date', 'end_date', 'user']
    inlines = [PlanDayInline]


# Register Survey, Exercise, and the customized FitnessPlan admin
admin.site.register(Survey)
admin.site.register(Exercise)
admin.site.register(FitnessPlan, FitnessPlanAdmin)
admin.site.register(PlanDay, PlanDayAdmin)
