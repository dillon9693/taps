**Date created:** 2025-09-03
**Date updated:** 2025-09-03

# Description

Optimize AWS infrastructure costs for the Taps application by leveraging Free Tier resources and reducing resource sizes. This plan focuses on database optimization, compute scaling, and monitoring adjustments while maintaining application functionality.

# Changes required

- Change RDS instance type from `ec2.InstanceSize.SMALL` to `ec2.InstanceSize.MICRO` (database-stack.ts:90)
- Disable Multi-AZ deployment by changing `multiAz: true` to `false` (database-stack.ts:107)
- Reduce backup retention from 7 days to 1 day (database-stack.ts:102)
- Reduce Fargate memory from 1024 MiB to 512 MiB (compute-stack.ts:104)
- Reduce Fargate CPU from 512 to 256 (compute-stack.ts:105)
- Change auto-scaling minimum capacity from 2 to 1 (compute-stack.ts:220)
- Change auto-scaling maximum capacity from 4 to 2 (compute-stack.ts:221)
- Set initial desired count to 1 instead of 0 (compute-stack.ts:211)
- Reduce CloudWatch log retention from ONE_MONTH to ONE_WEEK (compute-stack.ts:95)

# Risks & Considerations

- **Performance impact**: Smaller database instance may have reduced performance for heavy workloads
- **Availability**: Single-AZ database reduces high availability
- **Scaling**: Lower compute resources may require more frequent auto-scaling events
- **Backup**: Reduced backup retention from 7 days to 1 day
- **Cost savings**: Database (~$20/month), Compute (~$15/month), Monitoring (~$5/month)
- **Free Tier benefits**: db.t3.micro eligible for 750 hours/month for first 12 months

# Alternatives

## Alternative 1: Single EC2 Instance
Replace ECS/Fargate with a single t3.micro EC2 instance running Docker containers directly. Would eliminate ALB costs but reduce scalability and availability.

## Alternative 2: Serverless Architecture
Replace ECS with Lambda + API Gateway for the backend. Would significantly reduce costs for low-traffic scenarios but require architectural changes.