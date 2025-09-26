**Date created:** 2025-09-26
**Date updated:** 2025-09-26

# Description

Migrate all Django model primary keys from auto-incrementing integers to UUID4 format. This will provide better scalability, security, and compatibility with distributed systems using Python's built-in UUID module.

**Github issue:** https://github.com/dillon9693/taps/issues/54

# Changes required

## Backend Changes

1. **Update Django models**
   - Modify `Beer`, `Brewery`, and `Tag` models in `taps/models.py`
   - Replace default auto-incrementing primary keys with UUIDField using Python's built-in uuid4
   - Ensure UUID generation happens automatically on model creation

2. **Create database migrations**
   - Generate new migration to convert existing integer PKs to UUID fields
   - Handle foreign key relationships (Beer.brewery_id, Beer.tags many-to-many)
   - Consider data migration approach - given note about being able to recreate DB

3. **Update sample data script**
   - Modify `add_sample_data.py` management command
   - Remove any hardcoded ID references
   - Ensure proper UUID generation and foreign key relationships

4. **Verify GraphQL compatibility**
   - Test that Graphene-Django correctly handles UUID primary keys
   - Ensure GraphQL ID fields serialize/deserialize UUIDs properly
   - Update any explicit ID-based queries in schema resolvers

## Frontend Changes

5. **Update TypeScript types**
   - Check if frontend Beer/Brewery types need UUID string format
   - Verify GraphQL queries handle UUID IDs correctly
   - Update any hardcoded ID references

## Testing & Validation

6. **Database testing**
   - Test migration process in development environment
   - Verify all foreign key relationships work with UUIDs
   - Confirm UUID4 generation and functionality

7. **Full application testing**
   - Test GraphQL API with UUID primary keys
   - Verify frontend can fetch and display data correctly
   - Test search, filtering, and detail views

8. **Performance validation**
   - Ensure UUID indexing performs adequately
   - Test query performance with UUID lookups

# Risks & Considerations

## Migration Complexity
- **Risk:** Converting existing integer PKs to UUIDs in production could be complex
- **Mitigation:** Issue notes that DB can be recreated and repopulated with dummy data since app isn't fully productionized

## UUID Size Impact
- **Risk:** UUIDs are 16 bytes vs 4/8 bytes for integers, increasing storage and index size
- **Consideration:** For this application scale, the impact should be minimal but worth monitoring

## Foreign Key References
- **Risk:** All foreign key fields need to be migrated to match new UUID primary keys
- **Mitigation:** Django migrations should handle this automatically, but needs careful testing

## GraphQL Compatibility
- **Risk:** Graphene-Django might have issues with UUID serialization
- **Mitigation:** Django's UUIDField should work seamlessly with Graphene, but needs verification

## Frontend Impact
- **Risk:** Frontend code might make assumptions about integer IDs
- **Mitigation:** UUIDs serialize as strings in GraphQL, so minimal frontend impact expected

# Alternatives

## Option 1: Fresh Migration (Recommended)
- **Approach:** Create new migrations that recreate tables with UUID PKs
- **Pros:** Cleanest approach, no complex data conversion
- **Cons:** Requires recreating production data
- **Why recommended:** Issue explicitly mentions this is acceptable

## Option 2: In-place Migration
- **Approach:** Write complex migration to convert existing integer PKs to UUIDs
- **Pros:** Preserves existing data
- **Cons:** More complex, potential for migration issues
- **Why not recommended:** Unnecessary complexity given current app state

## UUID Version Choice
- **UUID v4 (Random):** Standard random UUIDs, most commonly used
- **UUID v5 (Name-based SHA-1):** Deterministic UUIDs based on namespace and name
- **Chosen:** UUID v4 using Python's built-in uuid module, providing true randomness and avoiding external dependencies