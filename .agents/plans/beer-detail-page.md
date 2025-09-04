# Beer Detail Page Implementation Plan

## Overview
Create a dedicated beer detail page that shows comprehensive information about a selected beer, accessible by clicking on beer cards in the home page and search results.

## Current State
- BeerCard component displays beer information but is not clickable
- Existing GraphQL queries return comprehensive beer data
- Routes: `/home` and `/search` are implemented
- React Router and Material UI are already configured

## Implementation Steps

### 1. Create GraphQL Query for Single Beer
**File**: `client/src/graphql/queries.ts`
- Add `GET_BEER` query to fetch single beer by ID
- Use same fields as existing queries for consistency
- Query should accept `$id: ID!` parameter

### 2. Create BeerDetail Route Component
**File**: `client/src/routes/BeerDetail.tsx`
- Use `useParams()` to get beer ID from URL
- Implement `useQuery()` with GET_BEER query
- Create detailed layout with enhanced presentation of beer information
- Include loading and error states
- Use Material UI components for consistent styling

### 3. Add Route Configuration
**File**: `client/src/index.tsx`
- Add new route: `<Route path="beer/:id" element={<BeerDetail />} />`
- Place within existing App routes structure

### 4. Make BeerCard Clickable
**File**: `client/src/components/BeerCard.tsx`
- Wrap Card component with Link or add onClick handler
- Navigate to `/beer/${beer.id}` route
- Add hover effects for better UX
- Ensure accessibility (proper link semantics)

### 5. Enhanced Detail Page Layout
Design considerations for BeerDetail component:
- Larger beer image with fallback
- Prominent beer name and brewery information
- Organized display of technical specs (ABV, IBU, style)
- Full description with better typography
- Enhanced rating display
- Better tag presentation
- Consistent Material UI theming

## Technical Decisions

### Navigation Approach
- Use React Router's `Link` component in BeerCard for proper client-side routing
- Maintain browser history and enable back button functionality

### Data Fetching
- Create dedicated GraphQL query for single beer to follow existing patterns
- Use Apollo Client's `useQuery` hook for consistency
- Handle loading and error states similar to existing routes

### Layout Design
- Use Material UI Grid system for responsive layout
- Employ Card, Typography, and other MUI components for consistency
- Maintain existing design language and spacing

## Testing Considerations
- Test navigation from both home and search pages
- Verify proper loading and error states
- Ensure responsive design on different screen sizes
- Test with beers that have missing optional data (e.g., no IBU)

## Success Criteria
- [ ] Users can click on any beer card to view detailed information
- [ ] Beer detail page displays all available information in an organized manner
- [ ] Navigation works correctly from both home and search pages
- [ ] Back button returns to previous page correctly
- [ ] Loading and error states are handled gracefully
- [ ] Design is consistent with existing application aesthetics
- [ ] Page is responsive across different screen sizes