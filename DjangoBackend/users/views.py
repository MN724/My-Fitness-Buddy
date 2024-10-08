"""
Views for user registration, login, survey submission, and fitness plan generation.

This module contains Django views for handling user registration, login requests, interacting with Firebase for
authentication, and managing survey and fitness plan data.

The code is based on standard Django view practices and examples from the Django documentation,
with integration of Firebase authentication as described in Firebase's official documentation.

Based on Django and Firebase documentation:
- Django views documentation: https://docs.djangoproject.com/en/5.0/topics/http/views/
- Django Queries and Model fields: https://docs.djangoproject.com/en/5.0/topics/db/queries/
- Firebase Admin SDK documentation: https://firebase.google.com/docs/admin/setup
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import (User, Survey, FitnessPlan, Exercise, PlanDay, PlanDayExercise, Equipment, UserEquipment, BodyTypes,
                     FitnessGoal, Avatar, FitnessLevel)
from .middleware import FirebaseAuthenticationMiddleware
from django.db.models import Q
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def firebase_authenticated(view_func):
    def _wrapped_view_func(request, *args, **kwargs):
        """Function to install middleware instance"""
        middleware = FirebaseAuthenticationMiddleware(get_response=lambda req: None)

        # Process request through middleware
        response = middleware(request)
        if response:
            return response
        return view_func(request, *args, **kwargs)
    return _wrapped_view_func


@csrf_exempt
def register_user(request):
    """
    Handles user registration requests.
    Expects a POST request with JSON body containing 'email' and 'uid'.
    Stores the user information in the Django database.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            firebase_uid = data.get('uid')
            display_name = data.get('display_name')
            avatar_name = data.get('avatar_name')

            # Retrieve the avatar instance if the avatar_name is provided.
            avatar = None
            if avatar_name:
                try:
                    avatar = Avatar.objects.get(avatar_name=avatar_name)
                except Avatar.DoesNotExist:
                    return JsonResponse({'error': 'Avatar not found'}, status=400)

            # Store user information in Django database
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'firebase_uid': firebase_uid,
                    'display_name': display_name,
                    'avatar': avatar
                }
            )

            if not created:
                user.firebase_uid = firebase_uid
                user.display_name = display_name
                user.avatar = avatar
                user.save()

            response_data = {'message': 'User registered successfully', 'email': user.email}
            return JsonResponse(response_data, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception:
            return JsonResponse({'error': 'Unexpected error occurred'}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
@firebase_authenticated
def login_user(request):
    """
    Handles user login requests.
    Expects a POST request with JSON body containing 'email' and 'uid (the firebase uid)'.
    Verifies the Firebase token and user information in the Django database and returns user data.
    """

    if request.method == 'POST':
        try:
            user = User.objects.get(firebase_uid=request.user['uid'])

            response_data = {
                'message': 'Login successful',
                'email': user.email,
            }
            return JsonResponse(response_data, status=200)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
        except Exception:
            return JsonResponse({'error': 'Unexpected error occurred'}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
@firebase_authenticated
def submit_survey(request):
    """
    Handles survey submission requests.
    Expects a POST request with JSON body containing 'goal', 'type', 'level', and 'equipment'.
    Stores the survey information in the Django database for the authenticated user.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = User.objects.get(firebase_uid=request.user['uid'])  # Authenticated user from middleware
            available_equipment = data.get('equipment', [])
            body_type = BodyTypes.objects.filter(body_type_name=data['type']).first()
            fitness_goal = FitnessGoal.objects.filter(fitness_goal_name__iexact=data['goal']).first()
            fitness_level = FitnessLevel.objects.filter(fitness_level_name__iexact=data['level']).first()

            # Check if a survey already exists for this user
            survey, created = Survey.objects.update_or_create(
                user=user,
                defaults={
                    'fitness_goal': fitness_goal,
                    'body_type': body_type,
                    'fitness_level': fitness_level,
                    'equipment': ','.join(data['equipment'])
                }
            )

            # Store user's equipment availability in DB
            for equipment_name in available_equipment:
                equipment_list = Equipment.objects.filter(equipment_name=equipment_name)
                for equipment in equipment_list:
                    UserEquipment.objects.get_or_create(
                        user_id=user.user_id,
                        equipment_id=equipment.equipment_id,
                        defaults={'equip_available': True}
                    )

            # Set default start date to today if not provided
            start_date = datetime.strptime(data.get('start_date', str(datetime.today().date())), '%Y-%m-%d').date()
            # Set default end date to 30 days from start date if not provided
            end_date = datetime.strptime(data.get('end_date', str(start_date + timedelta(days=30))), '%Y-%m-%d').date()
            # Generate the fitness plan immediately after storing the survey
            plan_details = generate_plan(survey)
            print(plan_details)
            fitness_plan, created = FitnessPlan.objects.update_or_create(
                user=user,
                defaults={
                    'fitness_plan_name': f"Fitness Plan for {survey.fitness_goal}",
                    'fitness_plan_desc': f"This plan is tailored to help you {survey.fitness_goal} "
                                         f"with {survey.equipment}",
                    'start_date': start_date,
                    'end_date': end_date,
                }
            )

            # Delete existing PlanDay and PlanDayExercies associated with the fitness plan/user.
            PlanDay.objects.filter(plan=fitness_plan).delete()

            # Associate PlanDay and PlanDayExercise with the fitness plan
            for day, exercises in plan_details.items():
                plan_day = PlanDay.objects.create(plan=fitness_plan, day_of_week=day.split(' - ')[1])
                for exercise_detail in exercises:
                    exercise = Exercise.objects.filter(exercise_name=exercise_detail['exercise']).first()
                    if exercise:
                        PlanDayExercise.objects.create(
                            plan_day=plan_day,
                            exercise=exercise,
                            sets=exercise_detail.get('sets', 0),
                            reps=exercise_detail.get('reps', 0),
                            duration=exercise_detail.get('duration', 0)
                        )
                    else:
                        logger.error(f"Exercise {exercise_detail['exercise']} does not exist")
            logger.debug("Associated PlanDay and PlanDayExercise with the fitness plan")
            return JsonResponse({'message': 'Survey and fitness plan submitted successfully'}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}")
            return JsonResponse({'error': f"Unexpected error occurred: {str(e)}"}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)


def generate_plan(survey):
    """
    Generate a fitness plan based on the survey responses for 30 days.
    """
    # Get user's available equipment from the survey
    available_equipment = survey.equipment.split(',')

    # Remove any empty strings from the list
    available_equipment = [eq.strip() for eq in available_equipment if eq.strip()]

    # Fetch exercises available on available equipment
    exercises = Exercise.objects.filter(equipment__in=available_equipment)

    # If no equipment is available, make exercises body weight.
    if not available_equipment:
        exercises = Exercise.objects.filter(equipment='body weight')

    plan_details = {}

    # Workout days.
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    rest_day = ['Saturday', 'Sunday']

    # Reps based on difficulty.
    level_sets_reps = {
        'Beginner': {'sets': 2, 'reps': 8, 'cardio_duration': 10},
        'Intermediate': {'sets': 3, 'reps': 10, 'cardio_duration': 20},
        'Advanced': {'sets': 4, 'reps': 12, 'cardio_duration': 30}
    }

    goal_based_workout_days = {
        'lose-weight': {
            'workout_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'type': 'cardio'
        },
        'get-stronger': {
            'workout_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'type': 'strength'
        },
        'better-endurance': {
            'workout_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'type': 'endurance'
        },
        'build-muscle': {
            'workout_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'type': 'muscle'
        },
        'better-flexibility': {
            'workout_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'type': 'flexibility'
        },
        'not-sure': {
            'workout_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'type': 'cardio'
        }
    }
    # Extract the string attribute for the fitness goal name
    fitness_goal_name = survey.fitness_goal.fitness_goal_name.strip().lower()

    if fitness_goal_name in goal_based_workout_days:
        workout_goal = fitness_goal_name
    else:
        workout_goal = 'lose-weight'

    # Set the workout days and type based on the goal
    workout_type = goal_based_workout_days[workout_goal]['type']

    cardio_equipment = ['elliptical machine', 'stationary bike', 'stepmill machine',
                        'skierg machine', 'rope', 'body weight']

    # Stores last workout
    last_upper_body_group = None
    last_lower_body_group = None
    # Mapping the upper and lower body groups.
    upper_body_group = ['back', 'upper arms', 'shoulders', 'chest', 'lower arms']
    lower_body_group = ['waist', 'upper legs', 'lower legs']
    # Total number of days for the workout plan.
    num_days = 30
    for day_idx in range(num_days):
        day_of_week = days[day_idx % 7]  # Get the day of the week.
        day_key = f"Day {day_idx + 1} - {day_of_week}"
        if day_of_week in rest_day:
            plan_details[day_key] = []
            logger.debug(f"{day_key} is a rest day.")
            continue

        day_exercises = []

        if workout_type == 'cardio':
            # Filter exercises based on cardio equipment or on keywords.
            day_exercises = exercises.filter(
                Q(equipment__in=cardio_equipment)
                | Q(exercise_name__icontains='run')
                | Q(exercise_name__icontains='jump')
                | Q(exercise_name__icontains='cardio')
                | Q(exercise_name__icontains='aerobic')
                | Q(exercise_name__icontains='bike')
                | Q(exercise_name__icontains='cycle')
                | Q(exercise_name__icontains='row')
            ).order_by('?')[:5]
            # If no cardio equipment is available, then use bodyweight.
            if not day_exercises.exists():
                # Filter exercises on body weight.
                day_exercises = exercises.filter(equipment='body weight').filter(
                    Q(exercise_name__icontains='run')
                    | Q(exercise_name__icontains='jump')
                    | Q(exercise_name__icontains='cardio')
                    | Q(exercise_name__icontains='aerobic')
                ).order_by('?')[:5]

        elif workout_type == 'strength' or workout_type == 'muscle':
            upper_body_filter = Q(body_part__in=upper_body_group)
            lower_body_filter = Q(body_part__in=lower_body_group)
            # If body group is set, exclude it from filter.
            if last_upper_body_group:
                upper_body_filter &= ~Q(body_part=last_upper_body_group)
            if last_lower_body_group:
                lower_body_filter &= ~Q(body_part=last_lower_body_group)

            if day_idx % 2 == 0:  # Alternate between upper and lower body
                day_exercises = exercises.filter(upper_body_filter).order_by('?')[:5]
                if day_exercises.exists():
                    first_exercise = day_exercises.first()
                    if first_exercise:
                        last_upper_body_group = first_exercise.body_part
                    last_lower_body_group = None
            else:
                day_exercises = exercises.filter(lower_body_filter).order_by('?')[:5]
                if day_exercises.exists():
                    first_exercise = day_exercises.first()
                    if first_exercise:
                        last_lower_body_group = first_exercise.body_part
                    last_upper_body_group = None

        elif workout_type == 'flexibility':
            # Flexibility Equipment
            flexibility_equipment = [
                'resistance band', 'bosu ball', 'medicine ball', 'roller',
                'stability ball', 'wheel roller', 'body weight'
            ]

            user_flexibility_equipment = [equipment for equipment in available_equipment
                                          if equipment in flexibility_equipment]

            if user_flexibility_equipment:
                day_exercises = exercises.filter(equipment__in=user_flexibility_equipment).order_by('?')[:5]
            # if no flexibility equipment use bodyweight
            else:
                day_exercises = exercises.filter(equipment='body weight').order_by('?')[:5]

        elif workout_type == 'endurance':
            day_exercises = exercises.filter(body_part__in=['cardio', 'upper body', 'lower body']).order_by('?')[:5]
        else:
            day_exercises = exercises.order_by('?')[:5]

        plan_details[day_key] = []

        fitness_level_name = str(survey.fitness_level).strip()

        for exercise in day_exercises:
            if workout_type == 'cardio':
                plan_details[day_key].append({
                    'exercise': exercise.exercise_name,
                    'duration': level_sets_reps[fitness_level_name]['cardio_duration']
                })
            else:
                plan_details[day_key].append({
                    'exercise': exercise.exercise_name,
                    'sets': level_sets_reps[fitness_level_name]['sets'],
                    'reps': level_sets_reps[fitness_level_name]['reps']
                })
        logger.debug(f"Generated exercises for {day_key}: {plan_details[day_key]}")

    return plan_details


@csrf_exempt
@firebase_authenticated
def get_user_details(request):
    """
    Handles requests to retrieve the user's survey and fitness plan.
    Expects a GET request with the authenticated user.
    Returns the survey and fitness plan details in JSON format.
    """
    if request.method == 'GET':
        try:
            user = User.objects.get(firebase_uid=request.user['uid'])
            survey = Survey.objects.filter(user=user).first()
            fitness_plan = FitnessPlan.objects.filter(user=user).first()

            response_data = {
                'display_name': user.display_name,
                'avatar': {
                    'avatar_name': user.avatar.avatar_name if user.avatar else None,
                    'avatar_image_link': user.avatar.avatar_image_link if user.avatar else None
                } if user.avatar else None,
                'survey': {
                    'goal': survey.fitness_goal.fitness_goal_name if survey and survey.fitness_goal else None,
                    'type': survey.body_type.body_type_name if survey and survey.body_type else None,
                    'level': survey.fitness_level.fitness_level_name if survey and survey.fitness_level else None,
                    'equipment': survey.equipment if survey else None
                } if survey else None,
                'fitness_plan': {
                    'fitness_plan_name': fitness_plan.fitness_plan_name if fitness_plan else None,
                    'fitness_plan_desc': fitness_plan.fitness_plan_desc if fitness_plan else None,
                    'start_date': fitness_plan.start_date if fitness_plan else None,
                    'end_date': fitness_plan.end_date if fitness_plan else None,
                    'days': [
                        {   # Get day of the week.
                            'day_of_week': day.day_of_week,
                            'exercises': [
                                {
                                    'name': exercise.exercise.exercise_name,
                                    'sets': exercise.sets,
                                    'reps': exercise.reps,
                                    'duration': exercise.duration
                                }
                                # Cycles through the exercies per day.
                                for exercise in day.plan_day_exercises.all()
                            ]
                        }
                        # Cycles through the days in the fitness plan.
                        for day in fitness_plan.days.all().order_by('plan_day_id')
                    ] if fitness_plan else None
                } if fitness_plan else None
            }
            return JsonResponse(response_data, status=200)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
        except Exception as e:
            logger.error(f"Unexpected error occurred: {str(e)}")
            return JsonResponse({'error': 'Unexpected error occurred'}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
def delete_and_replace_exercise(request):
    """
    Delets an exercise from a specific day and automatically replaces it with a suitable exercise.
    Expects a DELETE request.
    """
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            plan_day_exercise_id = data.get('plan_day_exercise_id')

            # Fetch PlanDayExercise.
            plan_day_exercise = PlanDayExercise.objects.filter(id=plan_day_exercise_id).first()
            plan_day = plan_day_exercise.plan_day
            user = plan_day.plan.user

            # Fetch survey.
            survey = Survey.objects.filter(user=user).first()

            # Capture details before deletion.
            delete_exercise = plan_day_exercise.exercise
            sets = plan_day_exercise.sets
            reps = plan_day_exercise.reps
            duration = plan_day_exercise.duration

            # Delete the existing exercise
            plan_day_exercise.delete()

            # Fetch exercises based on original survey.
            available_exercises = Exercise.objects.filter(
                Q(equipment__in=survey.equipment.split(','))
                | Q(fitness_goal=survey.fitness_goal)
            ).exclude(id=delete_exercise.exercise_id).order_by('?')

            # Select the new exercise.
            if available_exercises.exists():
                new_exercise = available_exercises.first()

                # Add the new exercise
                PlanDayExercise.objects.create(
                    plan_day=plan_day,
                    exercise=new_exercise,
                    sets=sets,
                    reps=reps,
                    duration=duration
                )
                return JsonResponse({
                    'message': 'Exercise replaced successfully',
                    'new_exercise': {
                        'id': new_exercise.exercise_id,
                        'name': new_exercise.exercise_name
                    }
                }, status=201)
            else:
                return JsonResponse({'error': 'No suitable replacement exercise found'}, status=404)
        except PlanDayExercise.DoesNotExist:
            return JsonResponse({'error': 'PlanDayExercise not found'}, status=404)
        except Exception as e:
            logger.error(f"Error replacing exercise: {str(e)}")
            return JsonResponse({'error': f"Unexpected error occurred: {str(e)}"}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)
