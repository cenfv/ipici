#!/bin/sh

# Apply database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Load data for initial development
# python manage.py loaddata fixtures/initial_data.json

# Start runserver
python manage.py runserver 0.0.0.0:8000
