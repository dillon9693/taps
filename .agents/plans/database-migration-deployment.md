**Date created:** 2025-09-03
**Date updated:** 2025-09-03

# Description

Implement automated database migration execution as part of the deployment process for the Taps Django backend. Currently, the application deploys without running migrations, causing database table errors in production. This plan establishes a robust migration strategy using ECS tasks that run before the main application deployment.

# Changes required

## Infrastructure Changes (CDK)

- Create a new ECS task definition specifically for running migrations (compute-stack.ts)
- Add migration task definition with same image but different command: `poetry run python manage.py migrate`
- Create IAM role and policies for migration task execution
- Add migration task to ECS cluster configuration
- Create CloudWatch log group for migration task logs

## Deployment Process Changes

- Modify deployment workflow to run migration task before updating main service
- Add pre-deployment step that executes migration ECS task using AWS CLI/CDK
- Wait for migration task completion before proceeding with service update
- Implement rollback strategy if migrations fail
- Add migration status monitoring and alerting

## Application Configuration

- Ensure Django settings support running migrations in containerized environment
- Verify database connection settings work for both migration and application containers
- Add migration logging and error handling for better debugging
- Consider adding migration pre-checks (database connectivity, backup status)

## Monitoring & Logging

- Set up CloudWatch monitoring for migration task success/failure
- Create alerts for migration failures that block deployments
- Add detailed migration logging with timing information
- Track migration execution history and performance

# Risks & Considerations

## Database Safety
- **Migration failures**: Failed migrations could leave database in inconsistent state
- **Long-running migrations**: Large table alterations could cause downtime
- **Data loss risk**: Destructive migrations require careful review and backup strategy
- **Concurrent access**: Ensure migrations don't conflict with running application instances

## Deployment Complexity
- **Dependency management**: Migration task must complete before service deployment
- **Error handling**: Failed migrations should prevent application deployment
- **Rollback scenarios**: Complex rollback situations if migrations succeed but deployment fails
- **Environment consistency**: Ensure migrations work across staging/production environments

## Performance Impact
- **Migration timing**: Large migrations could extend deployment time significantly
- **Database locks**: Some migrations may lock tables affecting application availability
- **Resource usage**: Migration task requires additional ECS capacity during deployment

## Security Considerations
- **Database credentials**: Migration task needs same database access as application
- **Network access**: Ensure migration task can reach RDS instance from ECS subnets
- **Audit logging**: Migration activities should be logged for compliance

# Alternatives

## Alternative 1: Application Startup Migrations
Run migrations automatically when Django application starts up using management command in container entrypoint.

**Pros**: Simple implementation, no infrastructure changes required
**Cons**: Potential race conditions with multiple containers, service startup delays, no rollback capability

## Alternative 2: AWS Lambda Migration Function
Create Lambda function that runs Django migrations using Lambda container images.

**Pros**: Serverless approach, automatic scaling, cost-effective for infrequent operations
**Cons**: Container cold starts, timeout limitations (15 min max), complexity of Django/DB setup in Lambda

## Alternative 3: GitHub Actions Migration Step
Run migrations directly from GitHub Actions using database connection tunneling or bastion host.

**Pros**: Direct control in CI/CD pipeline, easy integration with deployment workflow
**Cons**: Network complexity, requires secure database access from GitHub runners, potential security risks

## Alternative 4: ECS Scheduled Task
Set up recurring ECS scheduled task that checks for and runs pending migrations.

**Pros**: Automatic migration detection, doesn't block deployments, can handle missed migrations
**Cons**: Delayed migration execution, complexity of detecting when migrations are needed, potential race conditions

## Recommended Approach: Pre-deployment ECS Task

The recommended approach is **Alternative 1** modified with proper orchestration - using a dedicated ECS task definition for migrations that runs as a required pre-deployment step. This provides:

- Consistent environment between migrations and application
- Proper database access and networking
- Clear separation of concerns
- Robust error handling and monitoring
- Integration with existing ECS infrastructure
- Scalable approach that works for both staging and production