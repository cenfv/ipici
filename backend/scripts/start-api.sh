#!/bin/sh

# Apply database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start runserver
python manage.py runserver 0.0.0.0:8000