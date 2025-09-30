# Taps Deployment Guide

This document outlines the deployment process for the Taps beer discovery application. The application consists of a React frontend and a Django backend, deployed to Vercel and Railway respectively.

## Architecture Overview

The Taps application is deployed using the following architecture:

- **Frontend**: React application deployed to Vercel at `taps.dillonkerr.com`
- **Backend**: Django application deployed to Railway at `https://taps-production.up.railway.app`
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

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to the client directory: `cd client`
3. Login to Vercel: `vercel login`
4. Deploy to production: `vercel --prod`
5. Configure custom domain: `vercel domains add taps.dillonkerr.com`

### Backend (AWS)

1. Deploy infrastructure: `cd infrastructure && cdk deploy --all`
2. Build Docker image: `cd taps-backend && docker build -t taps-backend .`
3. Push to ECR: `docker push <ecr-repository-uri>:latest`
4. Update ECS service: `aws ecs update-service --cluster taps-production-cluster --service taps-production-service --force-new-deployment`

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
