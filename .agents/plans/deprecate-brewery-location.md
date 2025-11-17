**Date created:** 2025-11-17
**Date updated:** 2025-11-17

# Description

Deprecate the `location` field on the Brewery model in favor of separate address fields imported from OpenBreweryDB (OBDB). The location field will be maintained as a computed property in the GraphQL schema for backward compatibility, marked as deprecated, while the frontend migrates to use the new granular address fields.

**Github issue:** https://github.com/dillon9693/taps/issues/112

# Changes required

## Backend Changes

1. **GraphQL Schema** (`taps-backend/taps/schema.py`):
   - Keep `location` field in BreweryType but mark as deprecated with reason
   - Add resolver method for `location` that computes `f"{city}, {state_province}"`
   - Add new address fields to BreweryType: `city`, `state_province`, `address_1`, `address_2`, `postal_code`, `country`
   - Keep `location` parameter in `all_breweries` query but mark as deprecated
   - Update `resolve_all_breweries` to search across `city` and `state_province` when location parameter is used

2. **Tests** (`taps-backend/taps/tests.py`, `taps-backend/taps/test_queries.py`):
   - Update test fixtures to use `city` and `state_province` instead of `location`
   - Keep tests that verify computed location field works correctly
   - Update any assertions as needed

3. **Model** (`taps-backend/taps/models.py`):
   - Keep the location field as-is (already marked DEPRECATED)
   - No migration needed

## Frontend Changes

1. **TypeScript Types** (`client/src/types/index.ts`):
   - Keep `location` in BreweryInfo interface for now (will be computed by backend)
   - Add new address fields: `city`, `stateProvince`, `address1?`, `address2?`, `postalCode?`, `country`

2. **GraphQL Queries** (`client/src/graphql/queries.ts`):
   - Update `BREWERY_INFO_FRAGMENT` to request new address fields
   - Keep requesting `location` temporarily to verify it matches the computed value

3. **React Components**:
   - **BeerCard.tsx**: Replace `brewery.location` with `{brewery.city}, {brewery.stateProvince}`
   - **BeerDetail.tsx**: Replace both usages of `brewery.location` with formatted address
   - **BreweryDetail.tsx**: Replace both usages of `brewery.location` with formatted address

4. **Utility Function**:
   - Create `formatBreweryLocation` helper: `(city: string, stateProvince: string) => string`
   - Use this helper consistently across all components

## Testing

1. Run backend tests: `docker compose exec backend poetry run python manage.py test`
2. Run frontend tests: `cd client && npm test`
3. Verify locally using docker-compose that:
   - Brewery information displays correctly using new fields
   - Computed `location` field still returns expected format
   - GraphQL schema shows deprecation warning for location field
4. Test with sample data to ensure addresses show properly

# Risks & Considerations

1. **Backward compatibility maintained**: The `location` field remains in the GraphQL schema as a computed property, allowing any potential external consumers time to migrate. This is the safest approach.

2. **Deprecation visibility**: GraphQL deprecation annotations will be visible in GraphQL tools (GraphiQL, Apollo Studio), making the migration path clear.

3. **Data consistency**: The computed `location` field will always match the format `{city}, {state_province}`, ensuring consistency. The database field will remain but won't be used.

4. **Display format**: Using simple `{city}, {state_province}` format maintains current UX. Full address fields are available if needed later.

5. **Search functionality**: The backend brewery search/filter will be updated to search across `city` and `state_province` when the deprecated `location` parameter is used, maintaining backward compatibility.

6. **Testing coverage**: Tests need to be updated to use the new fields while still verifying the computed location works.

7. **Future cleanup**: In a future PR, we can remove the `location` field entirely from both GraphQL schema and database after confirming no usage.

# Rollout Strategy

This is a **backward-compatible** rollout:

1. **Backend**: Add new fields to schema, deprecate old field, make it computed
2. **Frontend**: Migrate to use new fields immediately
3. **Verification**: Confirm computed field matches expected behavior
4. **Future**: Remove deprecated field from schema and database in separate PR
