**Date created:** 2025-09-03
**Date updated:** 2025-09-03

# Description

Fix Vercel deployment conflicts where production deploys overwrite staging domains and staging becomes inaccessible after production deployments. Currently both environments use the same Vercel project with different flags, causing domain conflicts.

# Changes required

## Option 1: Separate Vercel Projects (Selected Implementation)

1. **Create two distinct Vercel projects:**
   - `taps-production` → deploys to `taps.dillonkerr.com`
   - `taps-staging` → deploys to `taps-staging.dillonkerr.com`

2. **Update GitHub Secrets:**
   - Add `VERCEL_TOKEN_PRODUCTION` for production project
   - Add `VERCEL_TOKEN_STAGING` for staging project
   - Keep existing `VERCEL_TOKEN` as fallback during transition

3. **Modify deployment workflow (.github/workflows/deploy-reusable.yml):**
   - Update Vercel pull command to use appropriate token per environment
   - Update build command to use appropriate token per environment  
   - Update deploy command to use appropriate token per environment
   - Remove environment flag logic (--prod vs --preview) as projects are separate

4. **Configure Vercel project domains:**
   - Production project: `taps.dillonkerr.com` domain
   - Staging project: `taps-staging.dillonkerr.com` domain
   - Both projects connected to same GitHub repo

# Risks & Considerations

- **Deployment complexity:** Two projects to manage instead of one
- **Secret management:** Additional tokens to maintain and rotate
- **Migration risk:** Temporary downtime during transition if not coordinated properly
- **Domain configuration:** Need to ensure DNS and domain ownership is properly configured for both projects
- **Environment variables:** Need to verify both projects have correct environment variables configured

# Alternatives

## Option 2: Domain-based Branch Deployments
Keep single Vercel project but assign domains to different branches:
- `main` branch → `taps.dillonkerr.com`
- `develop` branch → `taps-staging.dillonkerr.com`

**Pros:** Single project to manage, simpler setup
**Cons:** Requires persistent staging branch, doesn't work well with PR-based staging workflow

## Option 3: Use Preview URLs Directly
Skip custom staging domain, use Vercel's auto-generated preview URLs for PR reviews.

**Pros:** No domain conflicts, automatic PR URLs
**Cons:** Requires Django CORS allowlist for `*.vercel.app`, unpredictable URLs for QA

## Option 4: PR-specific Subdomains
Programmatically create subdomains like `pr-123.staging.taps.dillonkerr.com` using Vercel API.

**Pros:** Multiple concurrent staging environments, predictable URLs
**Cons:** High complexity, requires custom GitHub Actions logic, overkill for single developer

**Selected Option 1** because:
- Clean separation of concerns
- Works with existing PR-based staging workflow
- No CORS complications 
- Appropriate complexity for team size
- Can extend to Option 4 later if needed