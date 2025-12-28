# Customizing an Invitation Flow

*Note: This flow is inferred based on the application structure and redirects observed. Direct exploration of authenticated flows requires a valid user account.*

## Entry Points

- From dashboard (clicking on existing invitation)
- Direct link to invitation editor
- After creating new invitation
- From invitation management page

## Expected Features

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

## URL Pattern

Likely one of the following:
- `/editor/:invitationId`
- `/customize/:invitationId`
- `/invitations/:invitationId/edit`
- `/edit/:invitationId`

## Editor Interface (Expected)

### Layout
- **Left Panel:** Editing controls and options
- **Center Panel:** Live preview
- **Right Panel:** Properties panel (if applicable)
- **Top Bar:** Save, publish, share actions

### Toolbar
- Undo/Redo buttons
- Save button
- Preview toggle
- Publish button
- Share button
- Settings/options menu

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

