# View Demo Flow

**Description:** A modal dialog that allows users to preview a layout before committing to it.

## Modal Elements

### Preview Content
- Full preview of the selected layout design
- Interactive preview (likely showing how the invitation would look)
- Responsive preview showing how it appears on different devices

### Action Buttons
- **"Start with this layout"** - Redirects to signup page (if not authenticated) or starts customization
- **"Close"** - Closes the modal
- **"Close preview"** button (X) in the header

## User Flow

1. User clicks "View Demo" on any layout card
2. Modal opens showing the layout preview
3. User can:
   - Click "Start with this layout" to begin customization (requires authentication)
   - Click "Close" or "Close preview" to dismiss the modal

## Entry Points

- Clicking "View Demo" button on any layout card from the landing page
- Accessible from the layout browsing section

## Authentication Behavior

- **Unauthenticated users:** Clicking "Start with this layout" redirects to the signup page
- **Authenticated users:** Clicking "Start with this layout" likely redirects to the invitation editor with the selected layout

## Notes

- Demo previews are available without authentication
- Users can explore multiple layouts before deciding
- The preview gives users a clear understanding of the layout before committing
- Modal can be closed without any commitment

