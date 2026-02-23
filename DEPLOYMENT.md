# Taps Deployment Guide

This document outlines the deployment process for the Taps beer discovery application. The application consists of a React frontend and a Django backend, deployed to Vercel and Railway respectively.

## Architecture Overview

The Taps application is deployed using the following architecture:

- **Frontend**: React application deployed to Vercel at `taps.dillonkerr.com`
- **Backend**: Django application deployed to Railway at `https://tapsapi.dillonkerr.com`
- **Database**: PostgreSQL database managed by Railway

## Infrastructure Components

### Frontend (Vercel)

- Automatic deployments from GitHub repository
- Custom domain configuration (`taps.dillonkerr.com`)
- Built-in CDN and SSL certificate management
- Preview deployments for pull requests

### Backend (Railway)

- Automatic deployments from GitHub repository (`main` branch)
- Containerized Django application
- Built-in SSL certificate and HTTPS support
- Automatic health checks and monitoring

### Database (Railway)

- Fully managed PostgreSQL database
- Automatic backups
- Database credentials managed by Railway
- Private network connection to backend service

## Deployment Process

### Production Deployment

The production deployment process is fully automated through GitHub integrations:

#### Frontend (Vercel)

- **Automatic**: Pushes to `main` branch trigger production deployments
- **Preview**: Pull requests automatically generate preview deployments
- **Configuration**: Managed through Vercel dashboard and `vercel.json`

#### Backend (Railway)

- **Automatic**: Pushes to `main` branch trigger production deployments
- **Build**: Railway automatically detects and builds the Django application
- **Configuration**: Managed through Railway dashboard and `railway.json` (if present)
- **Environment Variables**: Configured in Railway dashboard

### Staging Deployment

Staging deployments are planned for future implementation and will likely use Railway's PR deployment features.

## Manual Deployment Steps

### Frontend (Vercel)

Use Vercel dashboard

### Backend (Railway)

Use Railway dashboard

## Monitoring and Maintenance

### Vercel

- Built-in analytics and performance monitoring
- Deployment logs available in dashboard
- Automatic SSL certificate renewal

### Railway

- Application logs available in Railway dashboard
- Built-in metrics (CPU, memory, network usage)
- Automatic database backups
- Deployment history and rollback capabilities

## Database Seeding

### One-time Production Seed

Run the following commands via the Railway console or `docker compose exec backend`:

```bash
# 1. Import all US breweries (~11,000 records; takes 30–60+ minutes due to website validation)
python manage.py import_all_breweries

# 2. Download craft-cans.csv from Kaggle (https://www.kaggle.com/datasets/nickhould/craft-cans)
#    then import beers (matches beers to already-imported breweries)
python manage.py import_beer_data --file /path/to/craft-cans.csv
```

### Monthly Brewery Refresh (Railway Cron)

A Railway cron service re-imports OpenBreweryDB data monthly so newly added breweries
are picked up automatically. To configure it:

1. In the Railway project dashboard, create a new **Cron** service.
2. Point it at the same GitHub repository (`taps-backend/` root).
3. Set the cron schedule to `0 2 1 * *` (first of the month at 02:00 UTC).
4. Set the start command to `python manage.py import_all_breweries`.
5. Add the same environment variables as the main backend service
   (`DATABASE_URL`, `SECRET_KEY`, `DJANGO_SETTINGS_MODULE`, etc.).

The command is idempotent — existing breweries are skipped on repeat runs.

## Scaling Considerations

### Frontend (Vercel)

- Automatic scaling via CDN
- No manual configuration needed

### Backend (Railway)

- Vertical scaling by adjusting service resources in Railway dashboard
- Horizontal scaling planned for future implementation

### Database (Railway)

- Vertical scaling by upgrading database plan
- Automated connection pooling

## Cost Optimization

- Railway offers usage-based pricing
- Monitor resource usage through Railway dashboard
- Optimize Docker image size to reduce build times
- Database size monitoring and cleanup strategies

## Security Considerations

- HTTPS enforced on all services (Vercel and Railway)
- Database credentials managed by Railway
- Private network connection between backend and database
- Environment variables stored securely in Railway dashboard
- Vercel environment variables configured per environment
