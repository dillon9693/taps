FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Below values only used for when running collectstatic during Docker build
# TODO figure out how to get rid of below? Might cause issues if we use static files
# ENV SECRET_KEY=fake
# ENV DJANGO_SETTINGS_MODULE=taps_backend.production_settings
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

# Install dependencies
RUN poetry install --no-dev --no-interaction --no-ansi

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run gunicorn
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "taps_backend.wsgi:application"]

CMD python manage.py migrate && gunicorn taps_backend.wsgi:application --bind 0.0.0.0:8000

# Health check
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:8000/taps/health/ || exit 1

# Expose port
# EXPOSE 8000
