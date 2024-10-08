"""
Firebase integration for MyFitnessBuddyDjango project.

This module initializes the Firebase Admin SDK and handles authentication and other Firebase-related tasks.

Based on Firebase Admin SDK documentation:
- Firebase Admin SDK documentation: https://firebase.google.com/docs/admin/setup
"""

import os
import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials

# Load environment variables from .env file
load_dotenv()

# Path to your downloaded service account key
service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')

# Log the path for debugging purposes
print(f"Loaded FIREBASE_SERVICE_ACCOUNT_KEY_PATH: {service_account_path}")

if service_account_path is None:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set")

# Use the path to initalize Firebase
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred)
