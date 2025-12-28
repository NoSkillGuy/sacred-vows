# Dashboard Flow

**URL:** `/dashboard`

**Description:** The main dashboard for authenticated users to view and manage their wedding invitations.

## Key Features

### Header
- **Logo:** Sacred Vows logo (links to home)
- **User Menu Dropdown:**
  - User avatar with initials
  - User name and email display
  - Profile link (to `/profile`)
  - Sign Out button

### Quick Start Section
- **Section Label:** "Quick start"
- **Heading:** "Launch your invitation in 3 steps"
- **Subtitle:** "Pick a layout, add details, share your link."
- **Action Buttons:**
  - "Choose layout" (primary) - navigates to `/layouts`
  - "Preview later" (secondary) - stays on dashboard
  - "See examples" (ghost) - navigates to `/layouts`

### Statistics Cards (when invitations exist)
- **Total Invitations:** Count of all invitations
- **Published:** Count of published invitations
- **Drafts:** Count of draft invitations

### Invitations Display

#### Empty State (No Invitations)
- Heart icon
- Heading: "No Invitations Yet"
- Description: "Start creating your beautiful wedding invitation. Choose from our premium layouts."
- CTA Button: "Create Your First Invitation" (links to `/layouts`)

#### Invitations Grid (When invitations exist)
- **Create New Card:**
  - Plus icon
  - "Create New" text
  - "Start from a layout" subtext
  - Links to `/layouts`

- **Invitation Cards:**
  - **Preview Section:**
    - Layout preview placeholder with rings icon
    - Status badge (Draft/Published)
  - **Info Section:**
    - **Editable Title:** Click to edit invitation name inline
    - **Wedding Date:** Calendar icon with formatted date (falls back to creation date)
    - **Layout Name:** Shows layout ID (e.g., "Classic Scroll")
    - **Action Buttons:**
      - "Edit" (primary) - navigates to `/builder/:invitationId`
      - "Preview" (secondary) - navigates to `/builder/:invitationId`
      - "Delete" (icon button) - opens delete confirmation modal

### Delete Confirmation Modal
- Shows when user clicks delete button
- Displays invitation details
- Confirmation and cancel buttons
- Toast notification on successful deletion

### Welcome Toast
- Shown once per user session
- Message: "Welcome back, [FirstName] — Everything you need to wow your guests."
- Auto-dismisses after 5-6 seconds
- Stored in sessionStorage to prevent repeat display

## User Flow

1. User signs in successfully
2. User is redirected to `/dashboard` (or `/app` which redirects to dashboard)
3. Dashboard loads user's invitations:
   - Loading state shown while fetching
   - If new user: Shows empty state with "Create Your First Invitation" CTA
   - If existing user: Shows quick start section, stats, and invitations grid
4. Welcome toast appears (once per session)
5. User can perform actions:
   - Click "Create New" card or "Choose layout" to start new invitation
   - Click on invitation card "Edit" or "Preview" to open builder
   - Click on invitation title to edit inline
   - Click delete icon to remove invitation (with confirmation)
   - Click user avatar to access profile or sign out

## Invitation Card Details

Each invitation card displays:
- **Preview Section:**
  - Layout preview placeholder (rings icon)
  - Status badge (Draft/Published) in top-right corner
- **Info Section:**
  - **Editable Title:** Inline editable text field
    - Placeholder: "Click to name your invitation"
    - Auto-saves on blur
    - Falls back to couple names or "Untitled Invitation"
  - **Wedding Date:** Calendar icon with formatted date
    - Format: "DD MMM YYYY" (e.g., "15 Dec 2024")
    - Falls back to creation date if wedding date not set
  - **Layout Name:** Shows layout ID (e.g., "Layout: Classic Scroll")
  - **Action Buttons:**
    - "Edit" (primary) - navigates to `/builder/:invitationId`
    - "Preview" (secondary) - navigates to `/builder/:invitationId`
    - Delete icon button - opens confirmation modal

## Title Editing

- Click on invitation title to edit inline
- Uses `EditableText` component
- Auto-saves on blur or Enter key
- Shows toast notification on success/failure
- Trims whitespace and defaults to "Untitled Invitation" if empty

## Delete Flow

1. User clicks delete icon on invitation card
2. Delete confirmation modal opens
3. Modal shows invitation details
4. User confirms or cancels
5. On confirm:
   - Invitation is deleted via API
   - Toast notification shown: "Invitation Deleted"
   - Modal closes
   - Invitation removed from grid
6. On error: Toast shows "Delete Failed" message

## Statistics Calculation

- **Total Invitations:** Count of all invitations
- **Published:** Count where `status === "published"`
- **Drafts:** Count where `status === "draft"` or `status` is undefined/null

## Integration Points

- **Layout Gallery:** "Create New" and "Choose layout" navigate to `/layouts`
- **Invitation Builder:** Edit/Preview buttons navigate to `/builder/:invitationId`
- **Profile:** User dropdown links to `/profile`
- **Logout:** Sign out button in user dropdown
- **Home:** Logo links to `/` (landing page)

## Loading States

- Initial load shows spinner with "Loading your invitations..." message
- Uses React Query for data fetching
- Handles loading and error states gracefully

## Notes

- Dashboard is the central hub for authenticated users
- All user invitations are accessible from dashboard
- Quick start section provides guidance for new users
- Statistics provide overview of invitation status
- Inline editing improves UX for quick title changes
- Delete confirmation prevents accidental deletions
- Welcome toast provides friendly greeting (once per session)

