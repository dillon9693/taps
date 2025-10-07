# Rate Limiting Implementation Plan

## Overview
Add rate limiting to the Django GraphQL API to protect against abuse, DoS attacks, and excessive resource consumption. This will implement tiered rate limits for different types of operations (queries vs mutations, authenticated vs anonymous users).

## Context
- **Current State**: No rate limiting exists on the GraphQL API
- **API Structure**: Single GraphQL endpoint at `/graphql` with queries and mutations
- **Authentication**: Session-based auth with both authenticated and anonymous users
- **Deployment**: Railway (production), Docker Compose (development)

## Goals
1. Prevent API abuse and DoS attacks
2. Implement different rate limits for:
   - Anonymous vs authenticated users
   - Read operations (queries) vs write operations (mutations)
   - Security-sensitive operations (auth mutations)
3. Provide clear error messages when rate limits are exceeded
4. Ensure minimal performance impact
5. Make limits configurable per environment

## Approach

### 1. Library Selection
**Selected: `django-ratelimit`**

**Rationale:**
- Mature, well-maintained library specifically for Django
- Simple decorator-based API that works well with function-based views
- Supports multiple backends (cache, in-memory)
- Can distinguish between authenticated/anonymous users
- Good for medium-scale applications

**Alternatives Considered:**
- `django-throttle-requests`: Less actively maintained
- `django-rest-framework` throttling: Overkill for GraphQL-only API
- Custom Redis-based solution: More complex, harder to maintain

### 2. Storage Backend
**Selected: Django Cache Framework with Redis (all environments)**

**Rationale:**
- Centralized Redis ensures consistent behavior across environments
- Production-like setup in development via Docker Compose
- Django cache framework provides abstraction
- Redis provides persistence and better rate limit accuracy

### 3. Rate Limiting Strategy

#### Rate Limit Tiers

| User Type | Operation Type | Rate Limit | Window |
|-----------|---------------|------------|---------|
| Anonymous | Queries | 100 requests | 15 min |
| Anonymous | Mutations | 20 requests | 15 min |
| Anonymous | Auth Mutations | 5 requests | 15 min |
| Authenticated | Queries | 500 requests | 15 min |
| Authenticated | Mutations | 100 requests | 15 min |
| Authenticated | Auth Mutations | N/A | N/A |

**Notes:**
- Auth mutations: `loginUser`, `registerUser`, `requestPasswordReset`, `resetPassword`
- Conservative limits initially; can be adjusted based on usage patterns
- 15-minute window balances protection vs user experience

#### Implementation Approach
Since GraphQL uses a single endpoint, we'll implement rate limiting at the resolver level rather than the view level. This allows granular control over different query/mutation types.

**Options:**
1. **View-level wrapper**: Apply rate limiting to the GraphQLView
2. **Resolver-level decorators**: Apply to individual resolvers
3. **Middleware approach**: Custom GraphQL middleware

**Selected: Custom GraphQL Middleware + Resolver Decorators (Hybrid)**
- Middleware for global query/mutation detection
- Decorators for specific mutation rate limits
- Most flexible and maintainable

## Implementation Steps

### Step 1: Add Dependencies & Infrastructure
- Add `django-ratelimit` via Poetry
- Add Redis service to `docker-compose.yml`
- Provision Redis in Railway (separate service)
- Configure Redis cache backend for all environments

### Step 2: Create Rate Limiting Utilities
Create `taps/rate_limit.py`:
- Custom rate limit key functions (user-specific, IP-based)
- Rate limit decorators for GraphQL resolvers
- Helper to determine if operation is query vs mutation
- Configuration constants for rate limits

### Step 3: Create GraphQL Middleware
Create middleware to:
- Extract GraphQL operation type (query vs mutation)
- Apply base rate limits per operation type
- Handle rate limit exceptions and return GraphQL-friendly errors

### Step 4: Apply Rate Limiting to Resolvers
- Apply decorators to mutation resolvers in `schema.py`
- Stricter limits on auth-related mutations
- Standard limits on other mutations
- Query resolvers get base rate limiting from middleware

### Step 5: Environment Configuration
- Add Redis cache configuration to `production_settings.py`
- Add Redis cache configuration to `development_settings.py`
- Add `REDIS_URL` environment variable support
- Add environment variables for rate limit values (optional override)

### Step 6: Error Handling
- Return proper GraphQL errors when rate limited
- Include retry-after information
- Log rate limit violations for monitoring

### Step 7: Testing
- Unit tests for rate limit utilities
- Integration tests for GraphQL operations
- Test authenticated vs anonymous limits
- Test rate limit reset behavior

### Step 8: Documentation
- Update CLAUDE.md with rate limiting info
- Document environment variables
- Add comments explaining rate limit choices

## Files to Create
- `taps-backend/taps/rate_limit.py` - Rate limiting utilities and decorators
- `taps-backend/taps/tests/test_rate_limit.py` - Rate limiting tests

## Files to Modify
- `taps-backend/pyproject.toml` - Add django-ratelimit dependency
- `taps-backend/taps/schema.py` - Apply rate limit decorators to mutations
- `taps-backend/taps_backend/settings.py` - Add cache framework settings
- `taps-backend/taps_backend/production_settings.py` - Add Redis cache config
- `taps-backend/taps_backend/development_settings.py` - Add Redis cache config
- `taps-backend/taps_backend/middleware.py` - Add GraphQL rate limiting middleware
- `docker-compose.yml` - Add Redis service
- `.env.example` (if exists) - Add REDIS_URL example
- `CLAUDE.md` - Document rate limiting behavior

## Configuration Details

### Environment Variables
```bash
# Development (docker-compose)
REDIS_URL=redis://redis:6379/0

# Production (Railway)
REDIS_URL=redis://default:password@redis.railway.internal:6379

# Optional rate limit overrides (both environments)
RATE_LIMIT_ANON_QUERY=100/15m
RATE_LIMIT_ANON_MUTATION=20/15m
RATE_LIMIT_ANON_AUTH=5/15m
RATE_LIMIT_AUTH_QUERY=500/15m
RATE_LIMIT_AUTH_MUTATION=100/15m
```

### Docker Compose Redis Service
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  redis_data:
```

### Cache Configuration
```python
# production_settings.py & development_settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': env.str('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'taps_rate_limit',
    }
}
```

## Testing Strategy

### Unit Tests
- Test rate limit key generation
- Test limit calculations
- Test cache storage/retrieval

### Integration Tests
- Test anonymous query rate limiting
- Test authenticated query rate limiting
- Test mutation rate limiting
- Test auth mutation stricter limits
- Test rate limit resets after window
- Test error messages and format

### Manual Testing
- Use GraphiQL to trigger rate limits
- Verify different limits for auth/anon
- Check error responses

## Success Criteria
- ✅ Rate limits successfully block excessive requests
- ✅ Different limits apply for anonymous vs authenticated users
- ✅ Auth mutations have stricter limits
- ✅ Clear error messages returned when rate limited
- ✅ All tests pass
- ✅ No performance degradation on normal usage
- ✅ Limits configurable via environment variables

## Risks & Mitigations

### Risk: False Positives (Legitimate Users Blocked)
**Mitigation**:
- Start with generous limits
- Monitor and adjust based on real usage
- Provide clear error messages with retry timing

### Risk: Performance Impact
**Mitigation**:
- Use Redis with connection pooling
- Cache rate limit checks
- Middleware runs early to fail fast

### Risk: Distributed Deployment Issues
**Mitigation**:
- Use centralized Redis in all environments
- Railway Redis service needs to be provisioned and connected
- Docker Compose Redis provides consistent development environment

### Risk: IP-Based Limits with Proxies
**Mitigation**:
- Primarily use session/user-based keys
- Use IP as fallback for anonymous users
- Trust X-Forwarded-For headers in production

## Future Enhancements
- Per-user override capability (admin can increase limits)
- Rate limit dashboard/monitoring
- Dynamic rate limiting based on system load
- Cost-based rate limiting (expensive queries count more)
- GraphQL query complexity analysis

## References
- django-ratelimit docs: https://django-ratelimit.readthedocs.io/
- Django cache framework: https://docs.djangoproject.com/en/5.1/topics/cache/
- GraphQL rate limiting patterns: https://www.apollographql.com/blog/graphql/security/securing-your-graphql-api-from-malicious-queries/
