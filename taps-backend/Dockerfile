# Base stage with common setup
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ARG SECRET_KEY
ARG DJANGO_SETTINGS_MODULE
ARG DATABASE_URL

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry==1.7.1

# Copy poetry configuration files
COPY pyproject.toml poetry.lock ./

# Configure poetry to not use a virtual environment
ENV POETRY_VIRTUALENVS_CREATE=false

# Development stage
FROM base AS dev

# Install dependencies including dev dependencies
RUN poetry install --no-interaction --no-ansi

# Copy project (though volume mount will override in docker-compose)
COPY . .

# Run migrations and Django dev server with auto-reload
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000

# Production stage
FROM base AS prod

# Install dependencies
RUN poetry install --no-dev --no-interaction --no-ansi

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and web server
CMD python manage.py migrate && gunicorn taps_backend.wsgi:application --bind 0.0.0.0:8000
