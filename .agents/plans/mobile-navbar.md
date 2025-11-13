**Date created:** 2025-11-13
**Date updated:** 2025-11-13

# Description

Add mobile-friendly navigation with a burger menu that appears on small screen sizes (< 768px). On larger screens, the existing horizontal navigation layout will remain unchanged.

**Github issue:** N/A

# Changes required

1. **Add burger menu toggle button**
   - Create a burger icon button that's only visible on screens < 768px (Mantine's 'sm' breakpoint)
   - Position it in the header next to the logo
   - Add state management for menu open/closed

2. **Create mobile navigation dropdown**
   - Build a dropdown menu that appears below the fixed header when burger is clicked
   - Include all navigation links (Home, Search, Account, Login/Logout)
   - Stack links vertically for mobile layout
   - Match the accent color scheme of the header

3. **Implement responsive visibility**
   - Hide burger menu on medium+ screens (>= 768px)
   - Hide standard horizontal nav links on small screens (< 768px)
   - Use Mantine's `visibleFrom` and `hiddenFrom` utilities

4. **Add close behavior**
   - Close menu when clicking outside the dropdown
   - Close menu when clicking any navigation link
   - Close menu when toggling the burger icon

5. **Testing**
   - Write tests for burger menu toggle functionality
   - Test responsive behavior at different breakpoints
   - Test close behaviors (outside click, link click)
   - Verify navigation links work correctly in both modes

# Risks & Considerations

- **Fixed header height**: The current header has a fixed height of 64px. Need to ensure the dropdown doesn't affect layout or cause content jump
- **Authentication state**: The navbar shows conditional content based on authentication (Account, Login/Logout). Need to ensure mobile menu updates correctly when auth state changes
- **Accessibility**: Burger menu should be keyboard accessible and have proper ARIA labels
- **Z-index layering**: Dropdown needs appropriate z-index to appear above page content
- **Click outside detection**: Need to properly handle click events to avoid conflicts with link navigation
