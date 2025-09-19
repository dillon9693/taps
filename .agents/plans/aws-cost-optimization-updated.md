**Date created:** 2025-09-19
**Date updated:** 2025-09-19

# Description

Comprehensive AWS cost optimization plan for the Taps application targeting the 6 main cost drivers: NAT Gateway, ELB, RDS, CloudWatch Metrics, VPC, and ECS. This updated plan includes aggressive cost reduction strategies while maintaining application functionality and exploring architectural alternatives.

# Current Cost Drivers Analysis

Based on the infrastructure code review:

1. **NAT Gateway (~$45-60/month)** - Single NAT Gateway in network-stack.ts:17
2. **Application Load Balancer (~$20-25/month)** - ALB in compute-stack.ts:161
3. **RDS (~$15-20/month)** - db.t3.micro PostgreSQL in database-stack.ts:87-90
4. **CloudWatch Metrics (~$15-30/month)** - $0.30 per metric-month for custom metrics
5. **VPC/Subnets (~$5-10/month)** - Multi-AZ VPC with 3 subnet types
6. **ECS/Fargate (~$10-15/month)** - 512MB/256CPU tasks with auto-scaling

**Total estimated cost: ~$110-160/month**

# Aggressive Cost Reduction Changes

## Phase 1: Immediate Infrastructure Optimizations

### A. Eliminate NAT Gateway (Save ~$45-60/month)
- **Change**: Remove NAT Gateway dependency by using VPC Endpoints for AWS services
- **Files**: network-stack.ts:17, compute-stack.ts:214
- **Implementation**:
  - Change subnet type from `PRIVATE_WITH_EGRESS` to `PRIVATE_ISOLATED`
  - Add VPC Endpoints for ECR, S3, CloudWatch Logs, Secrets Manager
  - Update ECS service to use isolated subnets with VPC endpoints

### B. Replace ALB with CloudFront + API Gateway (Save ~$15-20/month)
- **Change**: Replace expensive ALB with API Gateway + CloudFront distribution
- **Implementation**:
  - Remove ALB and target groups from compute-stack.ts:161-184
  - Create API Gateway with VPC Link to ECS
  - Add CloudFront distribution for caching and SSL termination
  - Use Route53 alias records pointing to CloudFront

### C. Further RDS Optimizations (Save ~$5/month)
- **Change**: Reduce allocated storage and optimize parameters
- **Files**: database-stack.ts:98-100
- **Implementation**:
  - Reduce allocatedStorage from 20GB to 10GB
  - Remove maxAllocatedStorage (disable auto-scaling)
  - Use gp3 storage type instead of gp2
  - Optimize PostgreSQL parameters for minimal resource usage

## Phase 2: ECS/Fargate Optimizations

### D. Reduce Fargate Resources (Save ~$5/month)
- **Files**: compute-stack.ts:104-105, 220-221
- **Changes**:
  - Memory: 512MB → 256MB
  - CPU: 256 → 128 (minimum for Fargate)
  - Auto-scaling: min 1 → 0, max 2 → 1
  - Set desired count to 0 for dev environments

### E. Optimize Container and Logging
- **Files**: compute-stack.ts:95, 119-122
- **Changes**:
  - Log retention: ONE_WEEK → THREE_DAYS
  - Enable log group auto-deletion
  - Optimize container image size

### F. CloudWatch Metrics Optimization (Save ~$10-25/month)
- **Target**: Reduce custom metrics from 50-100 to <10 essential metrics
- **Files**: compute-stack.ts:68 (Container Insights), auto-scaling configurations
- **Implementation**:
  - Disable ECS Container Insights (saves ~$10-15/month)
  - Remove unnecessary custom metrics from auto-scaling policies
  - Consolidate health check metrics
  - Use basic CloudWatch metrics instead of detailed monitoring
  - Implement metric filtering to reduce data points
  - Switch from 1-minute to 5-minute metric intervals where possible

# Architecture Alternative: Serverless Migration

## Option 1: Full Serverless (Save ~$70-90/month)
**Target monthly cost: ~$5-15/month for low traffic**

### Components:
- **API Gateway REST API** instead of ALB + ECS
- **Lambda functions** for Django backend (using Mangum adapter)
- **RDS Proxy** for connection pooling
- **CloudFront** for caching and SSL
- **S3** for static files

### Changes Required:
1. Containerize Django app for Lambda deployment
2. Implement Mangum ASGI adapter for Lambda
3. Add RDS Proxy for connection management
4. Migrate static files to S3 + CloudFront
5. Update CI/CD to deploy Lambda functions

### Benefits:
- Pay only for actual usage
- Automatic scaling
- No idle costs
- Reduced operational overhead

### Risks:
- Cold start latency (~1-3 seconds)
- Lambda timeout limits (15 minutes)
- Requires code modifications
- Learning curve for serverless patterns

## Option 2: Hybrid Approach (Save ~$40-50/month)
**Target monthly cost: ~$45-60/month**

### Components:
- **Fargate Spot instances** (70% cost reduction)
- **Application Load Balancer** with target-based auto-scaling
- **Aurora Serverless v2** instead of RDS instance
- **VPC Endpoints** instead of NAT Gateway

### Benefits:
- Significant cost reduction with minimal code changes
- Maintains container-based architecture
- Aurora Serverless scales to zero during idle periods
- Spot pricing for non-critical workloads

## Option 3: Single EC2 Instance (Save ~$60-80/month)
**Target monthly cost: ~$15-25/month**

### Components:
- **t3.micro EC2 instance** with Docker Compose
- **Elastic IP** instead of ALB
- **RDS t3.micro** (Free Tier eligible)
- **CloudFront** for SSL and caching

### Implementation:
- Deploy entire stack on single EC2 instance
- Use nginx reverse proxy
- Docker Compose for container orchestration
- Automated backups with snapshots

### Benefits:
- Maximum cost savings
- Simplified architecture
- Free Tier eligible components
- Predictable costs

### Risks:
- Single point of failure
- Limited scalability
- Manual scaling required
- Reduced high availability

# Implementation Priority

## Immediate (Week 1):
1. ✅ Disable ECS Container Insights (containerInsights: false)
2. ✅ Remove unnecessary custom metrics and detailed monitoring
3. ✅ Reduce Fargate resources (256MB/128CPU)
4. ✅ Reduce log retention periods (THREE_DAYS)
5. ✅ Remove NAT Gateway → VPC Endpoints migration

**Expected savings: ~$60-75/month**

## Short-term (Week 2-3):
1. 🔄 Replace ALB with API Gateway + CloudFront
2. 🔄 Optimize RDS storage settings (gp3, reduced allocation)
3. 🔄 Implement Fargate Spot instances
4. 🔄 Optimize auto-scaling policies

**Additional savings: ~$20-30/month**

## Long-term (Month 2-3):
1. 🎯 Evaluate serverless migration feasibility
2. 🎯 Consider Aurora Serverless v2 migration
3. 🎯 Implement comprehensive monitoring and cost alerts

**Potential additional savings: ~$20-40/month**

# Risk Mitigation

## Performance Risks:
- Monitor application performance after resource reductions
- Implement comprehensive health checks
- Set up CloudWatch alarms for key metrics

## Availability Risks:
- Test failover scenarios with reduced resources
- Implement circuit breakers and retries
- Consider blue-green deployments for critical changes

## Cost Monitoring:
- Set up AWS Cost Explorer alerts
- Implement resource tagging for cost allocation
- Regular cost optimization reviews

# Expected Total Savings

- **Conservative estimate**: $75-95/month (50-65% reduction)
- **Aggressive estimate**: $95-125/month (70-85% reduction)
- **Target monthly cost**: $15-35/month (down from $110-160/month)

# Success Metrics

1. **Monthly AWS bill reduction** by target percentage
2. **Application performance** maintains current SLAs
3. **Zero production downtime** during optimizations
4. **Monitoring coverage** for all cost-optimized resources