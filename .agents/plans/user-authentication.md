**Date created:** 2025-09-30
**Date updated:** 2025-09-30

# Description

Implement core user authentication system for the Taps application, supporting both email/password and social authentication (Google and GitHub). This change focuses on the authentication infrastructure; auth-restricted features (upvoting, favorites) will be implemented separately.

**Github issue:** https://github.com/dillon9693/taps/issues/66

# Changes required

## Backend (taps-backend/)

### 1. Dependencies & Configuration

- Add `django-allauth` to pyproject.toml dependencies
- Configure allauth in settings.py with email and social providers (Google, GitHub)
- Add allauth to INSTALLED_APPS and configure authentication backends
- Set up email backend for verification emails (console backend for dev, SMTP for production)
- Configure social app credentials via environment variables

### 2. Database Models & Migrations

- Extend Django User model with custom UserProfile model if additional fields needed
- Generate and apply migrations for allauth models

### 3. GraphQL Schema Updates

- Create UserType in schema.py with fields (id, username, email, dateJoined)
- Add authentication mutations:
  - registerUser (email, password, username) → UserType
  - loginUser (email, password) → UserType
  - logoutUser → success boolean
  - requestPasswordReset (email) → success boolean
  - resetPassword (token, newPassword) → success boolean
- Add queries:
  - currentUser → UserType (returns authenticated user or null)

### 4. URL Configuration

- Add allauth URLs to urlpatterns for social auth callbacks
- Ensure GraphQL endpoint remains at /graphql

### 5. Tests

- Write tests for authentication mutations (register, login, logout)
- Write tests for password reset flow
- Write tests for currentUser query

## Frontend (client/)

### 1. Apollo Client Configuration

- Update Apollo Client to include credentials in requests (credentials: 'include')
- Configure cache to handle user authentication state

### 2. GraphQL Queries & Mutations

- Add authentication mutations to src/graphql/queries.ts
- Add currentUser query to check auth status on app load

### 3. Auth Context & State Management

- Create AuthContext to manage user authentication state
- Implement useAuth hook for accessing auth state and functions
- Load current user on app initialization

### 4. UI Components

- Create LoginModal component with tabs for email/password and social auth
- Create RegisterModal component
- Create PasswordResetModal component
- Add AuthButton component to navigation (shows login/register when logged out, user menu when logged in)

### 5. Types

- Add User type to src/types/

## Docker & Environment

### 1. Docker Compose Updates

- Add environment variables for social auth credentials (Google/GitHub OAuth)
- Configure email backend settings

### 2. Environment Variables Documentation

- Document required environment variables:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - GITHUB_CLIENT_ID
  - GITHUB_CLIENT_SECRET
  - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD (for production)

## Documentation

### 1. CLAUDE.md Updates

- Add authentication commands to development section
- Document how to set up social auth credentials for local development

# Risks & Considerations

## Security

- **Session Management:** Django sessions with HTTP-only cookies provide CSRF protection. Ensure CORS is properly configured for production domains.
- **Password Storage:** Django's default password hashers are secure (PBKDF2). django-allauth uses these by default.
- **Social Auth Secrets:** OAuth credentials must be stored securely in environment variables, never committed to git.
- **Email Verification:** Consider requiring email verification before allowing protected actions to prevent spam accounts.

## User Experience

- **Optional Auth:** Ensure unauthenticated users can still browse and search beers without friction.
- **Social Auth Redirects:** Social auth requires redirects. Frontend must handle OAuth callback routes.
- **Session Persistence:** Users should remain logged in across browser sessions (adjust SESSION_COOKIE_AGE if needed).

## Deployment

- **CORS Configuration:** Update CORS_ALLOWED_ORIGINS in production settings to include production frontend domain.
- **Social Auth Callback URLs:** Register correct callback URLs with Google/GitHub OAuth apps for production domains.
- **Email Sending:** Production needs proper SMTP configuration for password reset emails.

## Testing in Docker

- **Local Development:** Developers need to create OAuth apps for local testing (localhost:3000 callbacks).
- **Test Accounts:** Consider providing test OAuth credentials or using email/password for local development.

# Alternatives

## Alternative 1: JWT Tokens Instead of Sessions

**Description:** Use JSON Web Tokens (JWT) for stateless authentication instead of Django sessions.

**Pros:**

- Stateless authentication (no server-side session storage)
- Better for microservices architecture
- Can be used across multiple domains easily

**Cons:**

- More complex to implement securely (token refresh, revocation)
- Tokens stored in localStorage are vulnerable to XSS attacks
- HTTP-only cookies with JWTs don't provide significant benefits over Django sessions
- django-allauth is built for session-based auth; JWT would require additional libraries

**Decision:** Rejected. Django sessions with HTTP-only cookies are simpler, more secure by default, and well-supported by django-allauth.

## Alternative 2: Third-Party Hosted Auth (Auth0, Clerk, Supabase)

**Description:** Use a hosted authentication service instead of self-hosted django-allauth.

**Pros:**

- Managed service (less maintenance burden)
- Advanced features out of the box (2FA, SSO, etc.)
- Dashboard for user management

**Cons:**

- Additional cost as app scales
- Vendor lock-in
- External dependency (service outage affects auth)
- More complex integration with existing Django backend
- User data stored externally

**Decision:** Rejected. django-allauth provides sufficient features, keeps user data in our database, has zero cost, and integrates seamlessly with Django.

## Alternative 3: Social Auth Only (No Email/Password)

**Description:** Support only Google and GitHub authentication, no email/password option.

**Pros:**

- Simpler implementation (no password reset flows, email verification)
- Better security (no password management)
- Faster user onboarding

**Cons:**

- Excludes users without social accounts or who prefer email/password
- Creates dependency on social providers
- Privacy concerns for some users

**Decision:** Rejected. Supporting both email/password and social auth provides better user choice with minimal additional complexity using django-allauth.
