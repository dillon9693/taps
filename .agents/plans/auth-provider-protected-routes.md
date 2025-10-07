**Date created:** 2025-10-06
**Date updated:** 2025-10-06

# Description

Implement AuthProvider context following React Router's recommended pattern to centralize authentication state management, and create protected route guards to redirect authenticated users away from auth routes (login, register, password reset flows).

**Github issue:** N/A

**Reference:** This implementation follows the official React Router authentication example: https://github.com/remix-run/react-router/tree/dev/examples/auth

# Changes required

## 1. Create AuthContext with Provider and Hook

**File:** `client/src/contexts/AuthContext.tsx` (new file)

- Create `AuthContext` using React Context API
- Implement `AuthProvider` component that:
  - Queries `GET_CURRENT_USER` with `errorPolicy: "all"`
  - Exposes `isAuthenticated`, `currentUser`, and `loading` state
  - Provides these values via context
- Export `useAuth()` hook for consuming auth state
- Handle loading and error states appropriately

## 2. Wrap Application with AuthProvider

**File:** `client/src/index.tsx`

- Import and wrap the app with `<AuthProvider>` at the root level
- Place it inside `<ApolloProvider>` but outside `<BrowserRouter>`

## 3. Update App.tsx to Use AuthContext

**File:** `client/src/App.tsx`

- Replace `useQuery(GET_CURRENT_USER)` with `useAuth()` hook
- Remove direct query imports
- Use `const { isAuthenticated, loading: loadingCurrentUser } = useAuth()`
- Keep existing logout mutation logic

## 4. Update Tag.tsx to Use AuthContext

**File:** `client/src/components/Tag.tsx`

- Replace `useQuery(GET_CURRENT_USER)` with `useAuth()` hook
- Remove direct query and error handling
- Use `const { isAuthenticated } = useAuth()`
- Simplify authentication check (no need for error handling)

## 5. Create RequireUnauthenticated Component

**File:** `client/src/components/RequireUnauthenticated.tsx` (new file)

- Accept `children` as props
- Use `useAuth()` to check authentication state
- If `loading`: render `<Loader />` centered
- If `isAuthenticated`: return `<Navigate to="/home" replace />`
- Otherwise: return `{children}`

## 6. Wrap Auth Routes with RequireUnauthenticated

**File:** `client/src/index.tsx`

- Wrap the `element` prop of these 4 routes:
  - `/login` → `<RequireUnauthenticated><Login /></RequireUnauthenticated>`
  - `/register` → `<RequireUnauthenticated><Register /></RequireUnauthenticated>`
  - `/request-password-reset` → `<RequireUnauthenticated><RequestPasswordReset /></RequireUnauthenticated>`
  - `/reset-password` → `<RequireUnauthenticated><ResetPassword /></RequireUnauthenticated>`

## 7. Verify Login/Register Refetch Behavior

**Files:** `client/src/routes/Login.tsx`, `client/src/routes/Register.tsx`

- No code changes needed
- Existing `refetchQueries: [{ query: GET_CURRENT_USER }]` will still work
- Apollo Client will update the cache, triggering AuthProvider to re-render with new data

# Risks & Considerations

## 1. Query Caching and Refetch Behavior

**Risk:** Apollo Client's cache may not automatically update AuthProvider when Login/Register refetch queries complete

**Mitigation:**
- Apollo Client should automatically trigger re-renders when cached data changes
- If issues arise, can add `notifyOnNetworkStatusChange: true` to AuthProvider's useQuery
- Test login/register flows thoroughly

## 2. Loading State Flash

**Risk:** Brief flash of auth route content before redirect while checking authentication

**Mitigation:**
- RequireUnauthenticated shows `<Loader />` during loading state
- AuthProvider caches result, so subsequent navigations are instant

## 3. Context Provider Placement

**Consideration:** AuthProvider must be inside ApolloProvider (needs Apollo Client) but outside BrowserRouter (auth state shouldn't reset on navigation)

**Solution:** Nesting order: `ApolloProvider > AuthProvider > BrowserRouter`

## 4. Reset Password Edge Cases

**Decision:** Block all auth routes for authenticated users, including reset-password with valid tokens
- Rationale: Future "Change Password" feature will be the proper way for authenticated users to change passwords
- User can log out if they need to use a reset link

## 5. Multiple Tag Components

**Consideration:** Multiple Tag components rendering on a page (e.g., Beer detail with many tags)

**Benefit:** With AuthProvider, all Tag components share same auth state from context instead of each making a query
- Current: N tags = N queries (cached but still checked)
- After: N tags = 0 additional queries (read from context)

# Testing Checklist

- [ ] Unauthenticated user can access all 4 auth routes
- [ ] Authenticated user redirected to `/home` from all 4 auth routes
- [ ] Login flow updates auth state and navigates correctly
- [ ] Register flow updates auth state and navigates correctly
- [ ] Logout clears auth state correctly
- [ ] App header shows correct Login/Logout button based on auth
- [ ] Tag voting buttons enable/disable based on auth
- [ ] No console errors about missing providers or context
- [ ] No flash of auth content before redirect
- [ ] Apollo cache properly updates across all components
