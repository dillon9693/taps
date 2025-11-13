**Date created:** 2025-10-29
**Date updated:** 2025-10-29

# Description

Create a reusable authentication decorator for GraphQL mutations and queries to eliminate code duplication in authentication checks across the Django backend. Currently, 6 mutations and 1 query manually check `user.is_authenticated` with duplicated error handling logic.

**Github issue:** https://github.com/dillon9693/taps/issues/93

# Changes required

## Phase 1: Create decorator and utilities

1. **Create `taps/decorators.py`**
   - Implement `login_required` decorator that works for both mutations and queries
   - Decorator should check `info.context.user.is_authenticated`
   - For mutations: return mutation class with `success=False, errors=["Authentication required."]`
   - For queries: return a GraphQL error object with `success=False, errors=["Authentication required."]` (standardizing away from exceptions)
   - Handle both mutation and query resolver signatures
   - Include comprehensive docstring explaining usage

2. **Create tests for the decorator in `taps/tests.py`**
   - Test decorator on a sample mutation (authenticated and unauthenticated cases)
   - Test decorator on a sample query (authenticated and unauthenticated cases)
   - Test that authenticated requests pass through correctly
   - Test that the decorator preserves function signatures and arguments

## Phase 2: Add tests and update TagVoteMutation

3. **Add comprehensive tests for `TagVoteMutation` in `taps/tests.py`**
   - Test authenticated user can vote on tags (upvote and downvote)
   - Test unauthenticated user receives authentication error
   - Test voting on non-existent beer/tag
   - Test changing vote from upvote to downvote and vice versa
   - Test removing vote

4. **Update `TagVoteMutation` in `taps/schema.py`**
   - Apply `@login_required` decorator to the `mutate` method
   - Remove manual authentication check code (lines 450-453)
   - Verify decorator returns proper error structure

5. **Update `resolve_saved_beers` query in `taps/schema.py`**
   - Apply `@login_required` decorator
   - Remove exception-based auth check (lines 198-209)
   - Standardize to return error structure instead of raising exception
   - Note: This may require updating the query return type to support error returns

## Phase 3: Testing and validation

6. **Run backend tests locally using docker-compose** (per LD-1)
   - `docker compose up`
   - `docker compose exec backend poetry run python manage.py test`
   - Ensure all existing tests pass
   - Ensure new tests pass

7. **Manual testing via GraphQL interface**
   - Test TagVoteMutation with authenticated user
   - Test TagVoteMutation without authentication
   - Test savedBeers query with authenticated user
   - Test savedBeers query without authentication

## Phase 4: Documentation

8. **Update decorator docstring**
   - Include examples for both mutation and query usage
   - Document the error structure returned
   - Add notes about standardized error handling

## Future work (separate implementation)

The following mutations will be updated to use the decorator in a separate PR:
- `UpdateAccountDetailsMutation`
- `SaveBeerMutation`
- `UnsaveBeerMutation`
- `AddTagsForBeerMutation`

# Implementation Details

## Decorator Design

The decorator will need to handle two different resolver patterns:

### Mutation Pattern
```python
@login_required
def mutate(self, info, **kwargs):
    # mutation logic
    return MutationClass(success=True, ...)
```

### Query Pattern
```python
@login_required
def resolve_field_name(self, info, **kwargs):
    # query logic
    return result
```

## Key Considerations

1. **Return type detection**: The decorator needs to detect whether it's wrapping a mutation or query to return the appropriate error structure
2. **Mutation class detection**: For mutations, the decorator needs to determine the mutation class name to instantiate the error response
3. **Query error structure**: Queries may need a custom error type or we need to standardize on returning `None` with errors logged

## Error Message Standardization

All authentication errors will use the message: `"Authentication required."`

This maintains consistency with existing error messages in the codebase.

# Risks & Considerations

## Risk 1: Query error handling change

**Risk:** The `resolve_saved_beers` query currently raises an exception for unauthenticated users, but mutations return error objects. Changing this behavior may affect frontend error handling.

**Mitigation:**
- Review frontend code to see how savedBeers errors are handled
- If frontend expects exceptions, we may need to keep query decorator behavior different from mutations
- Alternative: Keep queries raising exceptions and create two decorators (`login_required_mutation` and `login_required_query`)

## Risk 2: Decorator complexity with return types

**Risk:** Creating a single decorator that handles both mutations and queries might introduce complexity in detecting the return type and instantiating the correct error structure.

**Mitigation:**
- If complexity is too high, split into two decorators: `@mutation_login_required` and `@query_login_required`
- Start with the simpler approach and refactor if needed
- User preference was for single decorator if code remains readable

## Risk 3: Breaking existing tests

**Risk:** Changing error handling in `resolve_saved_beers` from exception to error object may break existing tests or frontend code.

**Mitigation:**
- Check if any existing tests call savedBeers query (review tests.py)
- Search frontend for savedBeers usage and error handling
- Consider this change breaking and document in PR

## Risk 4: Incomplete test coverage

**Risk:** No existing tests for TagVoteMutation means we might miss edge cases when adding tests.

**Mitigation:**
- Review the mutation implementation carefully when writing tests
- Test all code paths: success, auth failure, validation failures
- Follow TDD: write failing test first, then ensure decorator makes it pass

# Alternatives

## Alternative 1: Separate decorators for mutations vs queries

Instead of one `@login_required` decorator, create two:
- `@mutation_login_required` - returns mutation class with success=False
- `@query_login_required` - raises exception or returns None

**Pros:**
- Simpler implementation for each decorator
- More explicit about behavior
- Easier to maintain different error handling patterns

**Cons:**
- More code duplication between decorators
- Two decorators to remember instead of one
- Doesn't align with user preference for unified approach

**Decision:** Start with unified decorator. If complexity is too high, refactor to separate decorators.

## Alternative 2: Keep query exception-based error handling

Instead of standardizing queries to return error objects, keep them raising exceptions.

**Pros:**
- No breaking changes to frontend
- Maintains existing behavior
- Less risk

**Cons:**
- Inconsistent error handling between mutations and queries
- Doesn't align with user's preference to standardize on success=False pattern

**Decision:** Standardize to success=False pattern, but verify frontend impact first.

## Alternative 3: Use GraphQL middleware for authentication

Instead of decorators, implement authentication checking in GraphQL middleware.

**Pros:**
- Centralized authentication logic
- Automatically applies to all resolvers
- No need to decorate individual methods

**Cons:**
- Harder to make exceptions for resolvers that don't need auth
- Less explicit - harder to see which resolvers require auth
- More complex setup
- Overkill for current needs

**Decision:** Decorator approach is more explicit and flexible for current requirements.

## Alternative 4: Update all mutations/queries in one PR

Instead of just updating TagVoteMutation, update all authenticated mutations/queries in this implementation.

**Pros:**
- Complete solution in one PR
- All duplication removed immediately
- Consistent authentication across entire API

**Cons:**
- Larger PR, harder to review
- Higher risk of introducing bugs
- No existing tests means we'd need to write tests for all 6 mutations
- User specified to update one instance first since no tests exist

**Decision:** Follow user guidance - update only TagVoteMutation initially, leave others for separate implementation once pattern is proven.
