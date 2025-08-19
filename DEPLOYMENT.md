# Taps Deployment Guide

This document outlines the deployment process for the Taps beer discovery application. The application consists of a React frontend and a Django backend, deployed to Vercel and AWS respectively.

## Architecture Overview

The Taps application is deployed using the following architecture:

- **Frontend**: React application deployed to Vercel at `taps.dillonkerr.com`
- **Backend**: Django application deployed to AWS ECS Fargate at `api.taps.dillonkerr.com`
- **Database**: PostgreSQL database on AWS RDS
- **Infrastructure**: AWS CDK for infrastructure as code

## Infrastructure Components

### Network Infrastructure

- VPC with public and private subnets across 2 AZs
- NAT Gateway for private subnet internet access
- Security groups for ECS, RDS, and ALB

### Database Infrastructure

- RDS PostgreSQL instance in private subnet
- Automated backups and snapshots
- Secrets Manager for database credentials

### Compute Infrastructure

- ECS Fargate for containerized Django application
- ECR repository for Docker images
- Application Load Balancer for traffic distribution
- Auto-scaling based on CPU and memory utilization

### Domain Infrastructure

- ACM certificate for HTTPS
- Route 53 for DNS management
- Custom domain configuration

## Deployment Process

The deployment process is fully automated using GitHub Actions. The workflow is defined in `.github/workflows/deploy.yml` and consists of the following steps:

1. **Test**: Run tests for both frontend and backend
2. **Deploy Infrastructure**: Deploy AWS infrastructure using CDK
3. **Deploy Backend**: Build and push Docker image to ECR, update ECS service
4. **Deploy Frontend**: Deploy React application to Vercel

## Required Secrets

The following secrets need to be configured in GitHub Actions:

- `AWS_ROLE_TO_ASSUME`: ARN of the IAM role to assume for AWS deployments
- `VERCEL_TOKEN`: Vercel API token

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

- CloudWatch for logs and metrics
- CloudWatch Alarms for monitoring
- RDS automated backups
- ECR lifecycle policies for image management

## Scaling Considerations

- ECS service auto-scaling based on CPU and memory utilization
- RDS instance can be scaled vertically (instance size) or horizontally (read replicas)
- ALB can handle increased traffic automatically

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- RDS instance sizing based on actual usage
- NAT Gateway sharing across multiple subnets
- CloudWatch Logs retention policies

## Security Considerations

- All resources in private subnets where possible
- Security groups with least privilege access
- Secrets Manager for sensitive information
- HTTPS everywhere
- IAM roles with minimal permissions
