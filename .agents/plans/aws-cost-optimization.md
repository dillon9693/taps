**Date created:** 2025-09-03
**Date updated:** 2025-09-03

# Description

Optimize AWS infrastructure costs for the Taps application by leveraging Free Tier resources and reducing resource sizes. This plan focuses on database optimization, compute scaling, and monitoring adjustments while maintaining application functionality.

# Changes required

## 1. Database Optimization (database-stack.ts)
- Change RDS instance type from `ec2.InstanceSize.SMALL` to `ec2.InstanceSize.MICRO` (line 90)
- Disable Multi-AZ deployment by changing `multiAz: true` to `false` (line 107)
- Reduce backup retention from 7 days to 1 day (line 102)
- **Impact**: Leverages Free Tier db.t3.micro (750 hours/month), saves ~$15-20/month

## 2. Compute Optimization (compute-stack.ts)
- Reduce Fargate memory from 1024 MiB to 512 MiB (line 104)
- Reduce Fargate CPU from 512 to 256 (line 105)
- Change auto-scaling minimum capacity from 2 to 1 (line 220)
- Change auto-scaling maximum capacity from 4 to 2 (line 221)
- Set initial desired count to 1 instead of 0 (line 211)
- **Impact**: Reduces compute costs and leverages more Free Tier Fargate hours

## 3. Storage & Monitoring Optimization
- Reduce CloudWatch log retention from ONE_MONTH to ONE_WEEK (compute-stack.ts line 95)
- Ensure RDS allocated storage stays at 20GB (already configured, line 99)
- **Impact**: Reduces log storage costs while maintaining operational visibility

## 4. Container Insights (Optional)
- Consider disabling ECS Container Insights to reduce CloudWatch costs (compute-stack.ts line 68)
- **Impact**: Additional cost savings on CloudWatch metrics

## Expected Cost Savings
- **Current estimated cost**: ~$80-100/month
- **Optimized cost**: ~$25-40/month (after Free Tier expires)
- **First 12 months**: ~$5-15/month (with Free Tier benefits)
- **Primary savings**: Database (~$20/month), Compute (~$15/month), Monitoring (~$5/month)

## Risks & Considerations
- **Performance impact**: Smaller database instance may have reduced performance for heavy workloads
- **Availability**: Single-AZ database reduces high availability
- **Scaling**: Lower compute resources may require more frequent auto-scaling events
- **Backup**: Reduced backup retention from 7 days to 1 day