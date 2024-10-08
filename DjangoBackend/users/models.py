"""
Models for MyFitnessBuddyDjango app called users.

This module defines the data models used in the Django application.
It includes the structure and relationships of the database tables.

Based on standard Django ORM practices:
- Django models documentation: https://docs.djangoproject.com/en/5.0/topics/db/models/
Additional Documentation on created models based on existing DB:
# Documentation: https://docs.djangoproject.com/en/3.1/howto/legacy-databases/
"""
from django.db import models


class Avatar(models.Model):
    """Class to store avatars available to users."""
    avatar_id = models.AutoField(primary_key=True)
    avatar_name = models.CharField(max_length=25, blank=True, null=True)
    avatar_image_link = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Avatars'

    def __str__(self):
        return self.avatar_name


class BodyTypes(models.Model):
    """Class to store body type options available to user in survey."""
    body_type_id = models.AutoField(primary_key=True)
    body_type_name = models.CharField(max_length=25)

    class Meta:
        managed = False
        db_table = 'Body_Types'

    def __str__(self):
        return self.body_type_name


class FitnessGoal(models.Model):
    fitness_goal_id = models.AutoField(primary_key=True)
    fitness_goal_name = models.CharField(max_length=25)

    class Meta:
        managed = False
        db_table = 'Fitness_Goals'

    def __str__(self):
        return self.fitness_goal_name


class FitnessLevel(models.Model):
    fitness_level_id = models.AutoField(primary_key=True)
    fitness_level_name = models.CharField(max_length=25)

    class Meta:
        managed = False
        db_table = 'Fitness_Levels'

    def __str__(self):
        return self.fitness_level_name


class User(models.Model):
    """Class to store the user's authentication information."""
    user_id = models.AutoField(primary_key=True)
    display_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    firebase_uid = models.CharField(max_length=255)
    avatar = models.ForeignKey(Avatar, models.DO_NOTHING, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'Users'

    def __str__(self):
        return self.email


class Survey(models.Model):
    """Class to store the user's survey responses."""
    survey_id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='surveys')
    body_type = models.ForeignKey(BodyTypes, models.DO_NOTHING, blank=True, null=True)
    fitness_goal = models.ForeignKey(FitnessGoal, models.DO_NOTHING, blank=True, null=True)
    fitness_level = models.ForeignKey(FitnessLevel, models.DO_NOTHING, blank=True, null=True)
    equipment = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'Surveys'

    def __str__(self):
        return f"{self.user.email} - {self.fitness_goal}"


class Equipment(models.Model):
    """Class to store equipment for users to choose from in survey"""
    equipment_id = models.AutoField(primary_key=True)
    equipment_name = models.CharField(max_length=25)

    class Meta:
        managed = False
        db_table = 'Equipment'

    def __str__(self):
        return f"{self.equipment_name}"


class UserEquipment(models.Model):
    """Class to store equipment available to users"""
    user_equipment_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True)
    equipment = models.ForeignKey(Equipment, models.DO_NOTHING, blank=True, null=True)
    equip_available = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'User_Equipment'

    def __str__(self):
        return f"{self.user.email} - {self.equipment.equipment_name} - {self.equip_available}"


class FitnessPlan(models.Model):
    """Class to store the fitness plan for users."""
    fitness_plan_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fitness_plans')
    fitness_plan_name = models.CharField(max_length=100)
    fitness_plan_desc = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'Fitness_Plans'

    def __str__(self):
        return self.fitness_plan_name


class Exercise(models.Model):
    """Class to store exercises."""
    exercise_id = models.AutoField(primary_key=True)
    exercise_name = models.CharField(max_length=255)
    exercise_desc = models.TextField()
    body_part = models.CharField(max_length=255)
    target = models.CharField(max_length=255)
    primary_equipment = models.ForeignKey(Equipment, models.DO_NOTHING)
    equipment = models.CharField(max_length=255)    # known redundancy, large portion of algorith built off this field
    difficulty_level = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Exercises'

    def __str__(self):
        return self.exercise_name


class PlanDay(models.Model):
    """Class to store the exercises assigned to each day of the fitness plan."""
    plan_day_id = models.AutoField(primary_key=True)
    plan = models.ForeignKey(FitnessPlan, on_delete=models.CASCADE, related_name='days')
    day_of_week = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'Fitness_Plan_Workouts'

    def __str__(self):
        return f"{self.plan.fitness_plan_name} - {self.day_of_week}"


class PlanDayExercise(models.Model):
    """Class to store details of exercises in a PlanDay."""
    plan_day_exercise_id = models.AutoField(primary_key=True)
    plan_day = models.ForeignKey(PlanDay, on_delete=models.CASCADE, related_name='plan_day_exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='plan_exercises')
    sets = models.IntegerField(null=True, blank=True)
    reps = models.IntegerField(null=True, blank=True)
    duration = models.IntegerField(default=0)
    rest_time_sec = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Workout_Exercises'

    def __str__(self):
        return f"{self.exercise.exercise_name} on {self.plan_day.day_of_week}"


class Milestone(models.Model):
    """Class to store milestones."""
    milestone_id = models.AutoField(primary_key=True)
    milestone_name = models.CharField(max_length=200)
    milestone_value = models.IntegerField()
    milestone_attribute = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'Milestones'

    def __str__(self):
        return self.milestone_name


class UserMilestone(models.Model):
    """Class to store user's progress on milestones."""
    user_milestone_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = 'User_Milestones'

    def __str__(self):
        return f"{self.user.email} - {self.milestone.name}"


# class Workout(models.Model):
#     workout_id = models.AutoField(primary_key=True)
#     workout_name = models.CharField(max_length=200)
#
#     class Meta:
#         managed = False
#         db_table = 'Workouts'


class WorkoutHistory(models.Model):
    """Class to Store Completed Workouts"""
    workout_history_id = models.AutoField(primary_key=True)
    plan_day = models.ForeignKey(PlanDay, on_delete=models.CASCADE, related_name='workout_histories')
    user = models.ForeignKey(User, models.DO_NOTHING)
    completed_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Workout_Histories'

    def __str__(self):
        return f"{self.plan_day.plan.fitness_plan_name} - {self.completed_date}"


class ExerciseFeedback(models.Model):
    """Class to store feedback given after exercises completed in workout"""
    feedback_id = models.AutoField(primary_key=True)
    workout_history = models.ForeignKey(WorkoutHistory, models.DO_NOTHING, blank=True, null=True)
    exercise = models.ForeignKey(Exercise, models.DO_NOTHING, blank=True, null=True)
    rating = models.IntegerField(blank=True, null=True)
    feedback_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Exercise_Feedbacks'

    def __str__(self):
        return f"{self.feedback_date} - {self.exercise.exercise_name}"
