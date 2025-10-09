**Date created:** 2025-10-09
**Date updated:** 2025-10-09

# Description

Add the ability to search for tags by name when adding tags to a beer. Currently, only the top 10 tags (ordered by name) are displayed when adding tags. This enhancement will allow users to search for specific tags as they type, with debouncing to avoid overloading the backend.

**Github issue:** https://github.com/dillon9693/taps/issues/108

# Changes required

## Backend (taps-backend/)

1. **Update GraphQL schema** (`taps/schema.py`)
   - Add `search` parameter to `new_tags_for_beer` query resolver
   - Modify `resolve_new_tags_for_beer` to filter tags by name when search parameter is provided
   - Use case-insensitive search with `name__icontains`

## Frontend (client/)

1. **Update GraphQL query** (`src/graphql/queries.ts`)
   - Add optional `search` parameter to `NEW_TAGS_FOR_BEER` query

2. **Update AddTagModal component** (`src/components/AddTagModal.tsx`)
   - Add `TextInput` component above the tag display area for search functionality
   - Implement debounced search using `useDebouncedValue` hook from Mantine
   - Pass search term to `NEW_TAGS_FOR_BEER` query
   - Display loading spinner when search is in progress (query is loading)
   - Maintain existing functionality for default top 10 tags when search is empty

# Risks & Considerations

1. **Performance**: Debouncing is essential to prevent excessive backend queries as users type. Using a 300ms debounce delay should provide a good balance between responsiveness and backend load.

2. **UX consistency**: The search box should be clearly visible above the tag list, and loading states should be obvious to users.

3. **Backend query efficiency**: The search query uses `name__icontains` which should be reasonably efficient for the Tag model, but we should monitor performance if the tag count grows significantly.

4. **Empty states**: Need to handle cases where:
   - No search term provided (show default top 10)
   - Search returns no results (show appropriate message)
   - All tags already added to beer (already handled)
