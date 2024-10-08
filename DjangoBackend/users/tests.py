"""Testing django functions and other models"""
import os
import firebase_admin
from django.test import TestCase
from users.models import User, Survey, Exercise
from users.views import generate_plan
from firebase_admin import credentials, exceptions as firebase_exceptions
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()


class FirebaseInitializationTest(TestCase):
    """Test class for Firebase Initialization"""

    def setUp(self):
        """Setup for Firebase initialization test"""
        # Path to your downloaded service account key from the environment variable
        service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')
        if not service_account_path:
            self.fail("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set")
        self.cred = credentials.Certificate(service_account_path)

    def tearDown(self):
        """Tear down Firebase app after test"""
        try:
            app = firebase_admin.get_app()
            firebase_admin.delete_app(app)
        except ValueError:
            pass  # App was not initialized, nothing to tear down

    def test_firebase_initialization(self):
        """Test Firebase initialization."""
        try:
            # Check if the default app is already initialized
            if not firebase_admin._apps:
                firebase_admin.initialize_app(self.cred)
            app = firebase_admin.get_app()
            self.assertEqual(app.name, '[DEFAULT]')
        except FileNotFoundError as e:
            self.fail(f"Service account key file not found: {e}")
        except ValueError as e:
            self.fail(f"Invalid credentials: {e}")
        except firebase_exceptions.FirebaseError as e:
            self.fail(f"Firebase initialization error: {e}")
        except Exception as e:
            self.fail(f"Unexpected error initializing Firebase: {e}")


class GeneratePlanTestCase(TestCase):
    def setUp(self):
        # Create a user
        self.user = User.objects.create(email='testuser@example.com', uid='testuid')

        # Create exercises
        Exercise.objects.create(name='Jump Rope', equipment='rope', body_part='cardio')
        Exercise.objects.create(name='Running', equipment='body weight', body_part='cardio')
        Exercise.objects.create(name='Push Up', equipment='body weight', body_part='upper arms')
        Exercise.objects.create(name='Squat', equipment='body weight', body_part='lower legs')
        Exercise.objects.create(name='Plank', equipment='body weight', body_part='core')

        # Create a survey for the user
        self.survey = Survey.objects.create(
            user=self.user,
            goal='lose-weight',
            type='cardio',
            level='Beginner',
            equipment='rope,body weight'
        )

    def test_generate_plan(self):
        # Generate the plan
        plan = generate_plan(self.survey)

        # Check if the plan has 30 days
        self.assertEqual(len(plan), 30)

        # Check if each day has exercises
        for day_key, exercises in plan.items():
            if 'Sunday' in day_key:
                self.assertEqual(len(exercises), 0)
            else:
                self.assertTrue(len(exercises) > 0)

        # Additional checks for specific days or exercise properties
        for day_key, exercises in plan.items():
            for exercise in exercises:
                self.assertIn('exercise', exercise)
                if 'cardio' in self.survey.type:
                    self.assertIn('duration', exercise)
                else:
                    self.assertIn('sets', exercise)
                    self.assertIn('reps', exercise)
