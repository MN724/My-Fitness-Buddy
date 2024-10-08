# MyFitnessBuddy Django Backend

This project is the backend for the MyFitnessBuddy cross-platform personal trainer app. The backend is built using Django and provides APIs for user authentication, fitness plan management, workout tracking, and more. Firebase is used for authentication.

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

DjangoBackend/
├── MyFitnessBuddyDjango/
│   ├── init.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
├── db.sqlite3
├── manage.py
├── venv/
├── users/
│   ├── init.py
│   ├── admin.py
│   ├── apps.py
│   ├── firebase.py
│   ├── firebase_helper.py
│   ├── models.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
└── .env

## Setup

1. **Create and activate a virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate

2. Install the required packages:
pip install -r requirements.txt

3. Set up the enviornment variables:
Create a .env file in the DjangoBackend directory and add the following: FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/path/to/your/firebase_service_account.json

4. Run migrations:
python manage.py makemigrations
python manage.py migrate

5. Create a superuser:
python manage.py createsuperuser

Environment Variables

The project uses the following environment variables:

	•	FIREBASE_SERVICE_ACCOUNT_KEY_PATH: Path to your Firebase service account key JSON file.

Running the Project

	1.	Activate the virtual environment:
    source venv/bin/activate

    2.	Start the development server:
    python manage.py runserver
    The server will start at http://127.0.0.1:8000/.

API Endpoints

	•	User Registration: POST /users/register/
	•	User Login: POST /users/login/

Example Request for User Registration

Using Postman or any other API client:

	•	Method: POST
	•	URL: http://127.0.0.1:8000/users/register/
	•	Body:
    {
        "email": "test@example.com",
        "password": "test"
    }

Example Request for User Login

Using Postman or any other API client:

	•	Method: POST
	•	URL: http://127.0.0.1:8000/users/login/
	•	Body:
    {
        "email": "test@example.com",
        "password": "test"
    }

Testing

To run tests, use the following command:
python manage.py test

License

This project is licensed under the MIT LICENSE: https://opensource.org/license/mit.
