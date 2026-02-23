**Date created:** 2026-02-23
**Date updated:** 2026-02-23

# Description

Disable the save button on the beer detail page when the user is not authenticated. Currently the button is always enabled but the save action fails for unauthenticated users, creating a confusing experience.

**Github issue:** https://github.com/dillon9693/taps/issues/121

# Changes required

- `client/src/routes/BeerDetail.tsx`
  - Wrap the save `<Button>` in a Mantine `<Tooltip>` with `label="Sign in to save beers"` and `disabled={isAuthenticated}` (tooltip only visible when not authenticated)
  - Add `disabled={!isAuthenticated}` to the save `<Button>`
- `client/src/routes/BeerDetail.test.tsx` (new file)
  - Test: save button is visible but disabled when not authenticated
  - Test: save button is enabled when authenticated

# Risks & Considerations

- No backend changes required — this is a pure frontend UX fix
- `isAuthenticated` is already consumed in `BeerDetail` for the "Add Tag" button, so no new auth wiring is needed
- Tooltip pattern is identical to the existing "Add Tag" tooltip in the same file, keeping the implementation consistent
- If a user is logged out while viewing a beer they previously saved, the button will be disabled regardless of `isSaved` state
