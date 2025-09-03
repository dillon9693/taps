**Date created:** 2025-09-03
**Date updated:** 2025-09-03

# Description

Consolidate the staging (`deploy-staging.yml`) and production (`deploy.yml`) deployment scripts to reduce duplication and improve maintainability. The current scripts share ~90% of their logic with only environment-specific differences.

# Changes required

1. **Create reusable deployment workflow**
   - Create `.github/workflows/deploy-reusable.yml` as a reusable workflow
   - Parameterize environment-specific values:
     - ECR repository name (`taps-backend-production` vs `taps-backend-staging`)
     - CDK deployment target (`taps-production-*` vs `taps-staging-*`)
     - ECS cluster/service names 
     - Docker image tagging strategy
     - Vercel environment (`production` vs `preview`)
     - Vercel build flags (`--prod` flag presence)
     - Frontend API URL configuration

2. **Update production deploy script**
   - Replace job definitions with calls to reusable workflow
   - Pass production-specific parameters
   - Maintain existing triggers (push to main, workflow_dispatch)
   - Maintain existing conditional logic (`github.ref == 'refs/heads/main'`)

3. **Update staging deploy script**
   - Replace job definitions with calls to reusable workflow  
   - Pass staging-specific parameters
   - Maintain existing triggers (PR with labels, workflow_dispatch)
   - Maintain existing conditional logic (`contains(github.event.pull_request.labels.*.name, 'deploy-staging')`)

4. **Environment parameter mapping**
   - `environment`: `production` | `staging`
   - `ecr_repository`: Derived from environment
   - `cdk_target`: Derived from environment  
   - `image_tag_strategy`: Different logic for staging (includes PR number)
   - `vercel_environment`: `production` | `preview`
   - `api_url`: Environment-specific API endpoints

# Risks & Considerations

- **Deployment safety**: Must ensure environment isolation is maintained
- **Conditional logic complexity**: Staging has PR-based conditionals that need careful handling
- **Image tagging**: Staging uses PR-specific tags that need to be preserved
- **Testing**: Both workflows need thorough testing after consolidation
- **Rollback plan**: Keep original workflows as backup until new approach is validated

# Alternatives

## Alternative 1: Single workflow with environment detection
Merge both workflows into one file with environment detection logic.
- **Pros**: Single file to maintain
- **Cons**: More complex conditionals, harder to read, mixing of concerns

## Alternative 2: Composite actions only  
Extract common steps into composite actions while keeping separate workflow files.
- **Pros**: Preserves existing structure, incremental improvement
- **Cons**: Still maintains two similar workflow files, partial solution

## Alternative 3: Template-based approach
Use a template engine or build tool to generate workflows from a template.
- **Pros**: Very DRY approach
- **Cons**: Adds complexity, non-standard GitHub Actions pattern