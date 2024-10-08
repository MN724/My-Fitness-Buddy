"""
Middleware for Firebase authentication for the MyfitnessBuddyDjango project.

This middleware authenticates incoming requests by veryifing the Firebase token sent from the front-end.
It checks the 'Authorization' header for a Bearer token and validates it using the Firebase Admin SDK.

This implementation is based on examples from the Firebase Admin SDK documentation
and best practices for Django middleware.
Based on Firebase and Django documentation:
- Firebase Admin SDK documentation: https://firebase.google.com/docs/admin/setup
- Django middleware documentation: https://docs.djangoproject.com/en/5.0/topics/http/middleware/
"""
import firebase_admin  # noqa: F401
from firebase_admin import auth as firebase_auth
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)


class FirebaseAuthenticationMiddleware:
    """Middleware to authenticate the backend to Firebase based on the token sent from the front-end."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.headers.get('Authorization')
        if request.path.startswith('/admin'):
            return self.get_response(request)

        if token:
            try:
                token = token.split(' ')[1]  # Remove 'Bearer ' prefix
                logger.debug(f"Token received: {token}")
            except IndexError:
                logger.error("Authorization header is malformed")
                return JsonResponse({'error': 'Authorization header is malformed'}, status=401)

            try:
                decoded_token = firebase_auth.verify_id_token(token)
                logger.debug(f"Decoded token: {decoded_token}")
                request.user = decoded_token
            except Exception as e:
                logger.error(f"Token verification failed: {str(e)}")
                return JsonResponse({'error': 'Invalid token', 'details': str(e)}, status=401)
        else:
            request.user = None
            logger.warning("No token provided in the request")

        response = self.get_response(request)
        return response
