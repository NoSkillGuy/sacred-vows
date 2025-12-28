# Creating a New Invitation Flow

*Note: This flow is inferred based on the application structure and redirects observed. Direct exploration of authenticated flows requires a valid user account.*

## Entry Points

- After successful signup
- From dashboard "Create New" button
- Clicking "Customize This Design" while authenticated
- Clicking "Start with this layout" in demo modal while authenticated
- From layout browsing page while authenticated

## Expected Flow

1. **Layout Selection:**
   - User selects a layout (from landing page or dashboard)
   - Layout ID is passed to the creation flow

2. **Invitation Creation:**
   - System creates a new invitation record
   - User is redirected to invitation editor/customization page
   - Invitation is in "draft" status

3. **Initial Customization:**
   - User can customize the invitation:
     - Add photos
     - Edit text content (names, dates, locations, etc.)
     - Choose colors
     - Modify layout elements

4. **Preview:**
   - User can preview the invitation
   - See how it looks on different devices
   - Make adjustments as needed

5. **Save:**
   - User can save the invitation as draft
   - Changes are persisted
   - User can return to edit later

6. **Publish/Share:**
   - User can publish the invitation
   - Invitation becomes accessible via shareable link
   - User can share the invitation with guests

## URL Pattern

Likely one of the following:
- `/editor/:invitationId`
- `/create/:layoutId`
- `/invitations/new/:layoutId`
- `/editor/new/:layoutId`

## Expected Features

### Layout Selection
- Browse available layouts
- Filter by category
- Search for specific layouts
- Preview layouts before selection

### Invitation Setup
- Create invitation with selected layout
- Set invitation name/title
- Initialize with default content
- Set initial status as "draft"

### Quick Start
- Pre-filled template content
- Default color scheme
- Placeholder images
- Sample text that can be edited

## User Journey

1. User is authenticated
2. User selects a layout
3. System creates new invitation
4. User is taken to editor
5. User customizes invitation
6. User saves/publishes invitation

## Integration Points

- **Layout Selection:** Connects to layout browsing flow
- **Editor:** Connects to customizing invitation flow
- **Dashboard:** New invitation appears in user's dashboard
- **Publishing:** Connects to sharing/publishing flow

## Notes

- New invitations start as drafts
- Users can create multiple invitations
- Each invitation is independent
- Layout can be changed (if supported)
- Invitations can be deleted before publishing

