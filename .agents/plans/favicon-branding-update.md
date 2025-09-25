**Date created:** 2025-01-25
**Date updated:** 2025-01-25

# Description

Update the Taps application favicon, page title, and social media branding to replace default React branding with custom Taps branding. This includes generating favicons from the existing TapsLogo, implementing dynamic page titles with beer emoji, and adding proper social media meta tags for rich link previews.

**Github issue:** https://github.com/dillon9693/taps/issues/57

# Changes required

## 1. Favicon Generation and Replacement

- Extract static version of existing TapsLogo SVG for favicon generation
- Generate multi-format favicons: `.ico`, `.png` (16x16, 32x32, 192x192, 512x512), and `.svg` formats
- Replace all default React favicon files in `/client/public/`
- Update `manifest.json` to reference new Taps-branded icons

## 2. Dynamic Page Title Implementation

- Create `usePageTitle` hook for dynamic title management with format: "🍺 Taps - [Page Name]"
- Implement page-specific titles:
  - Home: "🍺 Taps - Discover Great Beer"
  - Search: "🍺 Taps - Search Beers"
  - Beer Detail: "🍺 Taps - [Beer Name] by [Brewery]"
  - Brewery Detail: "🍺 Taps - [Brewery Name]"
- Update all route components to use the hook

## 3. Social Media Meta Tags Implementation

- Add comprehensive Open Graph and Twitter Card meta tags to `index.html`
- Include: og:title, og:description, og:image, og:url, twitter:card, etc.
- Create social media preview image from TapsLogo
- Update app description from generic React text to Taps-specific content

## 4. Progressive Web App Improvements

- Update `manifest.json` with proper Taps branding (name, short_name, description)
- Set theme colors to match app's accent color
- Ensure all PWA icon sizes are properly generated and referenced

## 5. Files to Create/Modify

**New Files:**

- `client/src/hooks/usePageTitle.ts` - Dynamic title management hook
- `client/public/favicon.svg` - SVG version of favicon
- `client/public/apple-touch-icon.png` - iOS-specific icon
- `client/public/taps-social.png` - Social media preview image (1200x630)

**Modified Files:**

- `client/public/index.html` - Update title, meta tags, favicon links, description
- `client/public/manifest.json` - Replace React branding with Taps brandingTWha
- `client/public/favicon.ico` - Replace with Taps-branded favicon
- `client/public/logo192.png` - Replace with Taps logo (192x192)
- `client/public/logo512.png` - Replace with Taps logo (512x512)
- `client/src/routes/Home.tsx` - Add usePageTitle hook
- `client/src/routes/Search.tsx` - Add usePageTitle hook with dynamic search terms
- `client/src/routes/BeerDetail.tsx` - Add usePageTitle with beer name and brewery
- `client/src/routes/BreweryDetail.tsx` - Add usePageTitle with brewery name

# Risks & Considerations

## Technical Risks

- **Browser caching**: Old favicons may be cached; users might need to clear cache or hard refresh
- **Icon generation quality**: Converting SVG to various bitmap sizes may lose quality or detail
- **Performance impact**: Dynamic title updates should have minimal performance overhead
- **SEO implications**: Title changes could affect search engine indexing (positive impact expected)

## User Experience Considerations

- **Title length**: Long beer names might create very long titles; need graceful truncation
- **Loading states**: Need to handle cases where beer/brewery data is still loading
- **Accessibility**: Ensure emoji in titles don't interfere with screen readers

## Development Considerations

- **Asset management**: Multiple favicon formats need to be kept in sync
- **Testing complexity**: Need to verify branding across different browsers and devices
- **Social media testing**: Preview cards need testing across platforms (Twitter, Facebook, iMessage, etc.)

# Alternatives

## Alternative Title Formats

- **Option 1** (Selected): "🍺 Taps - [Page Name]" - Clear hierarchy with emoji
- **Option 2**: "Taps | [Page Name] 🍺" - Traditional separator with trailing emoji
- **Option 3**: "[Page Name] - Taps Beer Discovery" - Page-first with descriptive suffix

## Alternative Favicon Approaches

- **Option 1** (Selected): Use existing TapsLogo design - Maintains brand consistency
- **Option 2**: Create simplified monochrome version - Better at small sizes but less distinctive
- **Option 3**: Use just "T" letter mark - Simpler but loses beer theme

## Alternative Meta Tag Implementation

- **Option 1** (Selected): Static meta tags in index.html with dynamic title only
- **Option 2**: Full React Helmet Async integration - More complex but allows per-page meta customization
- **Option 3**: Server-side rendering for meta tags - Requires architecture changes
