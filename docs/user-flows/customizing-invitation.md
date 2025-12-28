# Customizing an Invitation Flow

**URL:** `/builder/:invitationId`

**Description:** The invitation builder/editor where users customize their wedding invitations with a split-pane interface.

## Entry Points

- From dashboard (clicking "Edit" or "Preview" on invitation card)
- After creating new invitation (redirected from layout gallery)
- Direct navigation to `/builder/:invitationId`
- From invitation management page

## Builder Interface

### Layout Structure
- **Split-Pane Design:**
  - **Left Sidebar:** Editing controls and form fields (`BuilderSidebar`)
  - **Right Main Area:** Live preview pane (`PreviewPane`)

### Sidebar Features (`BuilderSidebar`)
- **Edit Mode Toggle:**
  - Toggle between edit and preview-only mode
  - Controls whether sidebar is visible

- **Device Mode Selector:**
  - Desktop view
  - Tablet view
  - Mobile view
  - Switches preview device size

- **Form Sections:**
  - Organized editing controls
  - Form fields for invitation data
  - Real-time updates to preview

### Preview Pane Features (`PreviewPane`)
- **Live Preview:**
  - Real-time rendering of invitation
  - Updates as user edits in sidebar
  - Uses layout engine for rendering

- **Device Modes:**
  - Desktop: Full-width preview
  - Tablet: Medium-width preview
  - Mobile: Narrow-width preview

- **Edit Mode:**
  - When edit mode is ON: Shows preview with editing context
  - When edit mode is OFF: Preview-only view

## Data Flow

### Invitation Loading
1. Component receives `invitationId` from URL params
2. Fetches invitation data via `useInvitationQuery`
3. Fetches layout manifest via `useLayoutManifestQuery`
4. Loads data into builder store
5. Renders sidebar and preview

### State Management
- Uses `useBuilderStore` (Zustand store)
- Stores current invitation data
- Stores layout manifest
- Manages preview state

### Real-Time Updates
- Sidebar form changes update store
- Store updates trigger preview re-render
- Preview shows changes immediately

## Features

### Content Editing
- **Text Fields:**
  - Names (bride, groom, families)
  - Dates and times
  - Locations (ceremony, reception)
  - Additional details
  - RSVP information

- **Rich Text Editing:**
  - Text formatting options
  - Font selection
  - Text alignment
  - Text styling (bold, italic, etc.)

### Media Management
- **Photo Upload:**
  - Upload from device
  - Drag and drop interface
  - Multiple image support

- **Image Gallery:**
  - View uploaded images
  - Select images for use
  - Organize image library

- **Image Editing:**
  - Image cropping tools
  - Image resizing
  - Image filters/effects
  - Image positioning

### Design Customization
- **Color Picker:**
  - Primary color selection
  - Secondary color selection
  - Accent colors
  - Color scheme presets

- **Font Selection:**
  - Font family choices
  - Font size controls
  - Font weight options

- **Layout Adjustments:**
  - Element positioning
  - Spacing controls
  - Alignment options
  - Responsive adjustments

### Preview
- **Live Preview:**
  - Real-time preview of changes
  - Instant visual feedback
  - Side-by-side editing and preview

- **Device Views:**
  - Mobile view toggle
  - Desktop view toggle
  - Tablet view (if available)
  - Full-screen preview

### Actions
- **Save Draft:**
  - Save current progress
  - Auto-save functionality
  - Version history (if available)

- **Publish Invitation:**
  - Make invitation live
  - Generate shareable link
  - Set publication date

- **Share Invitation:**
  - Copy shareable link
  - Share via email
  - Share via social media
  - QR code generation (if available)

- **Delete Invitation:**
  - Remove invitation
  - Confirmation dialog
  - Permanent deletion

## User Flow

1. User opens invitation in editor
2. User sees current invitation state
3. User makes customization changes:
   - Edits text content
   - Uploads/replaces images
   - Adjusts colors and fonts
   - Modifies layout
4. User sees live preview of changes
5. User saves draft (auto-save may occur)
6. User continues editing or publishes
7. User publishes invitation when ready
8. User shares invitation link

## Loading States

### Initial Load
- Shows loading spinner with rings icon
- Message: "Loading your invitation..."
- Gradient background (rose tones)
- Animated pulse effect

### Error Handling
- If invitation not found: Error message displayed
- Auto-redirects to dashboard after 2 seconds
- Error message: "Failed to load invitation"

### Missing Data
- If no `invitationId`: Redirects to dashboard
- If layout not found: Error state shown
- Graceful degradation

## Builder Store Integration

The builder uses a Zustand store (`builderStore`) that manages:
- Current invitation data
- Layout manifest
- Preview state
- Form state

### Store Methods
- `setCurrentInvitation`: Updates current invitation
- `loadLayoutManifest`: Loads layout configuration
- Other state management methods

## Layout System

### Layout Manifest
- Fetched from API or local registry
- Contains layout configuration
- Defines available sections
- Specifies customization options

### Layout Registry
- `getLayoutManifest`: Gets layout manifest
- `hasLayout`: Checks if layout exists
- Supports multiple layout types

## Preview System

### Real-Time Rendering
- Preview updates as user edits
- Uses layout engine for rendering
- Merges user data with layout template

### Device Responsiveness
- Desktop: Full preview
- Tablet: Scaled preview
- Mobile: Narrow preview
- Accurate device simulation

### Edit Mode
- Edit mode ON: Full editing interface
- Edit mode OFF: Preview-only (sidebar hidden)

## Customization Options

### Text Customization
- Edit all text fields
- Change fonts
- Adjust text sizes
- Modify text colors
- Change text alignment

### Image Customization
- Upload new images
- Replace existing images
- Crop and resize images
- Position images
- Apply image effects

### Color Customization
- Change color scheme
- Custom color selection
- Color palette presets
- Background colors
- Text colors

### Layout Customization
- Adjust spacing
- Change element positions
- Modify layout structure
- Responsive adjustments

## Notes

- Changes are saved automatically or manually
- Preview updates in real-time
- Multiple customization options available
- User can undo/redo changes
- Invitation can be saved as draft multiple times
- Publishing makes invitation publicly accessible

