# Layout Browsing Flow

**URL:** `/` (with hash anchor `#layouts`)

**Description:** Users can browse available wedding invitation layouts on the landing page.

## Features

### Category Filtering
- Tab interface with "All" and "Popular" options
- Allows users to filter layouts by popularity
- Easy switching between all layouts and popular ones

### Search Functionality
- Search textbox labeled "Search layouts"
- Enables users to search for specific layout designs
- Real-time filtering of layout results

### Layout Display
- Layout cards showing preview images
- Each layout has two action buttons:
  - "Customize This Design" - Starts customization flow (requires authentication)
  - "View Demo" - Opens preview modal

## User Flow

1. User lands on homepage
2. User can scroll to layouts section or click "Layout" in navigation
3. User can filter by category (All/Popular)
4. User can search for specific layouts using search
5. User clicks "View Demo" to preview a layout
6. User clicks "Customize This Design" to start creating (redirects to signup if not logged in)

## Interaction Points

- **Category Tabs:** Click to filter layouts by category
- **Search Box:** Type to search for specific layouts
- **Layout Cards:** Hover/click to see more details
- **Action Buttons:**
  - "View Demo" - Opens modal preview (no auth required)
  - "Customize This Design" - Requires authentication

## Notes

- Layout browsing is a public feature (no authentication required)
- Search functionality helps users find specific design styles
- Category filtering helps users discover popular designs
- Both actions (View Demo and Customize) are accessible from layout cards

