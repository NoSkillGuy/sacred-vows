# Creating a New Invitation Flow

**URL:** `/layouts` (Layout Gallery - authenticated)

**Description:** Users browse and select layouts to create new wedding invitations.

## Entry Points

- After successful signup (redirected via `/app` smart redirect)
- From dashboard "Create New" card or "Choose layout" button
- Clicking "Customize This Design" while authenticated
- Clicking "Start with this layout" in demo modal while authenticated
- Direct navigation to `/layouts`

## Layout Gallery Features

### Header
- **Logo:** Sacred Vows logo (links to home)
- **Navigation:**
  - Dashboard link (if applicable)
  - User menu dropdown (same as dashboard)
    - Profile link
    - Sign Out button

### Layout Selection Interface
- **Category Filtering:**
  - Category tabs (All, Traditional, Modern, Minimal, Floral, etc.)
  - Filter by selected category
  - "All" shows all layouts

- **Layout Cards:**
  - Layout preview image
  - Layout name
  - Layout description
  - "Select" or "Use This Layout" button

- **Preset Selection Modal:**
  - Opens when user selects a layout
  - Shows available presets for the layout
  - Preset previews
  - "Start with this preset" button
  - "Start with blank" option
  - Can be closed with Escape key

## User Flow

1. **Layout Selection:**
   - User navigates to `/layouts` (authenticated)
   - User browses available layouts
   - User can filter by category
   - User clicks on a layout card

2. **Preset Selection (Optional):**
   - Preset selection modal opens
   - User can choose a preset or start blank
   - User selects preset or clicks "Start with blank"

3. **Invitation Creation:**
   - System creates new invitation via API:
     - `POST /api/invitations`
     - Includes selected `layoutId`
     - Includes preset data (if selected) converted to section configs
     - Initial status: "draft"
   - Loading state shown during creation

4. **Redirect to Builder:**
   - On success: User redirected to `/builder/:invitationId`
   - On error: Error message displayed, user can retry

## API Integration

### Create Invitation Request
```typescript
{
  layoutId: string,
  data?: UniversalWeddingData,  // From preset if selected
  title?: string,
  status?: "draft" | "published"
}
```

### Preset to Data Conversion
- Presets are converted to `UniversalWeddingData` format
- Section configs are generated from preset
- Data structure matches layout requirements

## Error Handling

- **Layout Loading Errors:**
  - Error message displayed
  - Retry option available
  - Fallback to default layouts

- **Creation Errors:**
  - Error toast notification
  - User can retry selection
  - Error details logged

- **Network Errors:**
  - Connection error messages
  - Retry mechanisms

## Layout Data Structure

Layouts include:
- `id`: Unique layout identifier
- `name`: Display name
- `description`: Layout description
- `category`: Category for filtering
- `previewImage`: Preview image URL
- `isAvailable`: Availability status
- `status`: Layout status

## Preset System

- **Preset Selection:**
  - Modal shows available presets for selected layout
  - Each preset has preview and description
  - "Start with blank" option always available

- **Preset Data:**
  - Presets contain pre-filled wedding data
  - Converted to `UniversalWeddingData` format
  - Includes couple info, dates, locations, etc.

## Integration Points

- **Dashboard:** "Create New" and "Choose layout" buttons navigate here
- **Builder:** After selection, redirects to `/builder/:invitationId`
- **Landing Page:** "Customize This Design" redirects here (if authenticated)
- **Demo Modal:** "Start with this layout" navigates here

## Loading States

- Layout gallery shows loading spinner while fetching layouts
- Creation shows loading state during API call
- Preset modal shows loading when fetching preset data

## Notes

- All layouts are fetched from API
- Categories are dynamically generated from layout data
- Preset selection is optional - users can start with blank
- New invitations are created with "draft" status
- Layout selection is required before creating invitation
- Error handling ensures users can retry failed operations

