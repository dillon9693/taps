# Brewery Detail Page Implementation Plan

## Overview

Create a brewery detail page that displays comprehensive brewery information and links from existing brewery name displays throughout the app.

## Requirements (from GitHub Issue #25)

1. New route created for a brewery detail page
2. Brewery detail page route displays details from the brewery model in an organized way
3. Any existing displays of a brewery name should link to the brewery detail page

## Current State Analysis

### Existing Backend Support

- ✅ GraphQL schema already has `BreweryType` with full brewery fields (taps-backend/taps/schema.py:8-25)
- ✅ Brewery model has all needed fields: name, location, description, year_founded, website, beers relationship (taps-backend/taps/models.py:4-15)

### Current Frontend Architecture

- ✅ React Router setup with nested routes pattern (client/src/index.tsx:28-34)
- ✅ Existing detail page pattern in BeerDetail.tsx to follow
- ✅ Mantine components and styling patterns established
- ✅ Apollo Client setup with type-safe GraphQL queries

### Current Brewery Name Display Locations

- BeerCard component (client/src/components/BeerCard.tsx:74) - shows brewery name and location
- BeerDetail page (client/src/routes/BeerDetail.tsx:93, 186-189) - shows brewery info in two places

## Implementation Plan

### Phase 1: Backend GraphQL Enhancement

**Files:** `taps-backend/taps/schema.py` and `client/src/graphql/queries.ts`

**Backend Changes Required:**

- Add `brewery_by_id` field to Query class (following existing `beer_by_id` pattern)
- Add `resolve_brewery_by_id` method (similar to `resolve_beer_by_id`)

**Frontend Changes:**

- Update existing brewery queries to include `id` field in brewery objects
- Add `GET_BREWERY_BY_ID` query for fetching brewery details

### Phase 2: TypeScript Types

**File:** `client/src/types/beer.ts`

- Add comprehensive `Brewery` interface with all fields from backend model
- Update existing `Beer` interface to reference the full `Brewery` type instead of inline brewery object

### Phase 3: Brewery Detail Component

**File:** `client/src/routes/BreweryDetail.tsx` (new)

- Create brewery detail page component following BeerDetail.tsx pattern
- Display brewery information in organized layout:
  - Hero section with brewery name and basic info
  - Description section
  - Founded year and website (if available)
  - List of beers from this brewery
- Include error handling and loading states
- Use consistent Mantine styling with existing pages

### Phase 4: Routing Configuration

**File:** `client/src/index.tsx`

- Add new route for brewery detail page: `/brewery/:id`
- Import and register BreweryDetail component

### Phase 5: Update Brewery Name Links

**Files to modify:**

- `client/src/components/BeerCard.tsx:74` - Make brewery name clickable
- `client/src/routes/BeerDetail.tsx:93` - Make brewery name in hero section clickable
- `client/src/routes/BeerDetail.tsx:186` - Make brewery name in info panel clickable

### Phase 6: Testing and Validation

- Test routing navigation
- Verify all brewery links work correctly
- Test error states (brewery not found)
- Validate responsive design on mobile/desktop
- Run frontend and backend linting and type checking

## Technical Decisions

### URL Structure

**Decision:** Use `/brewery/:id` pattern to match existing `/beer/:id` pattern

- ✅ Consistent with existing beer detail URLs
- ✅ More reliable than name-based URLs
- ✅ Requires brewery ID which we'll add to existing queries

### Data Fetching Strategy

**Decision:** Add brewery ID to existing queries and create brewery_by_id resolver

- ✅ Backend BreweryType already includes "id" field in Meta.fields
- ✅ Follow existing `beer_by_id` pattern for consistency
- ✅ Update existing brewery fragments to include ID for linking

### Component Structure

**Decision:** Follow BeerDetail.tsx layout patterns

- Hero section with main info
- Grid layout for organized information display
- Responsive design with Mantine Grid system
- Consistent Paper/Card components for content sections

## Risk Assessment

### Low Risk

- Frontend component creation (following existing patterns)
- Routing configuration (standard React Router)
- Basic styling and layout (established Mantine patterns)
- Backend resolver addition (following existing `beer_by_id` pattern)

### Medium Risk

- Query updates across frontend without breaking existing functionality
- Ensuring brewery ID is correctly propagated through all data flows

### Dependencies

- ✅ Backend BreweryType supports all needed fields including ID
- ✅ Existing `beer_by_id` pattern provides template for `brewery_by_id`
- ✅ GraphQL and Apollo Client infrastructure already established

## Definition of Done

- [x] New `/brewery/:id` route created and functional
- [x] Brewery detail page displays all available brewery information in organized layout
- [x] All existing brewery name displays are converted to clickable links
- [x] Error handling for missing/invalid breweries
- [x] Responsive design works on mobile and desktop
- [x] All tests pass and code passes linting
- [x] No breaking changes to existing functionality

## Estimated Effort

**Total: 3.5-5.5 hours**

- GraphQL query and types: 1 hour
- Brewery detail component: 2-3 hours
- Link updates: 1 hour
- Testing and refinement: 1-1.5 hours
