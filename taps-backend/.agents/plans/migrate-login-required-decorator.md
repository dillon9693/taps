# Plan: Migrate Remaining Mutations to @login_required Decorator

## Goal
Migrate mutations that currently have manual authentication checks to use the `@login_required` decorator, and add comprehensive unit tests for these mutations.

## Background
A previous PR added the `@login_required` decorator (in `taps/decorators.py`) to standardize authentication checks across GraphQL queries and mutations. Currently, only `TagVoteMutation` and `resolve_saved_beers` use this decorator. Four mutations still have manual authentication checks that should be migrated.

## Mutations to Migrate

### 1. UpdateAccountDetailsMutation
- **Location**: `taps/schema.py:494-518`
- **Current Auth**: Manual check at line 504-507
- **Action**: Replace with `@login_required` decorator

### 2. SaveBeerMutation
- **Location**: `taps/schema.py:521-555`
- **Current Auth**: Manual check at line 530-531
- **Action**: Replace with `@login_required` decorator

### 3. UnsaveBeerMutation
- **Location**: `taps/schema.py:558-594`
- **Current Auth**: Manual check at line 567-570
- **Action**: Replace with `@login_required` decorator

### 4. AddTagsForBeerMutation
- **Location**: `taps/schema.py:597-639`
- **Current Auth**: Manual check at line 607-610
- **Action**: Replace with `@login_required` decorator

## Test Coverage
None of these mutations currently have unit tests. Tests will be added to `taps/tests.py` following the pattern established for `TagVoteMutation` and `SavedBeersResolver`.

### Test Cases Per Mutation
Each mutation will have tests for:
1. **Authenticated user success case** - Verify mutation works correctly for authenticated users
2. **Unauthenticated user** - Verify decorator returns authentication error
3. **Edge cases** - Test specific error conditions (e.g., invalid IDs, duplicate operations)

## Implementation Steps

### Phase 1: Add Unit Tests (TDD Approach)
1. Add `UpdateAccountDetailsMutationTestCase` to `taps/tests.py`
   - Test authenticated user can update account details
   - Test unauthenticated user receives auth error
   - Test validation errors

2. Add `SaveBeerMutationTestCase` to `taps/tests.py`
   - Test authenticated user can save beer
   - Test unauthenticated user receives auth error
   - Test duplicate save error
   - Test invalid beer ID error

3. Add `UnsaveBeerMutationTestCase` to `taps/tests.py`
   - Test authenticated user can unsave beer
   - Test unauthenticated user receives auth error
   - Test beer not saved error
   - Test invalid beer ID error

4. Add `AddTagsForBeerMutationTestCase` to `taps/tests.py`
   - Test authenticated user can add tags
   - Test unauthenticated user receives auth error
   - Test empty tag list error
   - Test invalid tag IDs error
   - Test invalid beer ID error

### Phase 2: Apply @login_required Decorator
For each mutation:
1. Import `login_required` from `taps.decorators` (if not already imported)
2. Add `@login_required` decorator to the `mutate` method
3. Remove manual authentication check (lines checking `user.is_authenticated`)
4. Remove the early return statement for unauthenticated users

### Phase 3: Verification
1. Run tests locally using Docker: `docker compose exec backend poetry run python manage.py test`
2. Verify all new tests pass
3. Verify existing tests still pass
4. Run linting: `docker compose exec backend poetry run ruff check .`
5. Run formatting: `docker compose exec backend poetry run ruff format .`

## Expected Outcome
- All 4 mutations will use the `@login_required` decorator consistently
- Comprehensive unit tests will be in place for all 4 mutations
- Authentication error handling will be standardized across all mutations
- Code will be cleaner with less duplication

## Notes
- The decorator automatically handles authentication checks and returns appropriate error messages
- For mutations, the decorator returns `success=False` with error message
- This maintains backward compatibility with existing frontend code
