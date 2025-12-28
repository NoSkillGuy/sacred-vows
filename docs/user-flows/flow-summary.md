# User Flow Summary

This document provides an overview of the complete user journeys through the Sacred Vows application.

## Unauthenticated User Journey

### Discovery Phase
1. **Landing:** User arrives on homepage
2. **Exploration:** User browses the hero section and value proposition
3. **Interest:** User reads about features and benefits

### Exploration Phase
4. **Layout Browsing:** User scrolls to or navigates to layouts section
5. **Search/Filter:** User may search or filter layouts by category
6. **Preview:** User clicks "View Demo" to see layout previews
7. **Decision:** User finds a layout they like

### Registration Phase
8. **Action:** User clicks "Customize This Design" or "Start with this layout"
9. **Redirect:** User is redirected to signup page
10. **Account Creation:** User creates account (email/password or Google OAuth)
11. **Authentication:** User is authenticated and session is created

### Onboarding Phase
12. **Redirect:** User is redirected via `/app` (SmartRedirect) to dashboard or layouts
13. **First Invitation:** User clicks "Create Your First Invitation" or "Choose layout"
14. **Layout Selection:** User browses layouts at `/layouts` and selects one
15. **Preset Selection:** User chooses preset or starts blank
16. **Invitation Created:** System creates invitation with "draft" status
17. **Editor:** User is redirected to `/builder/:invitationId`
18. **Customization:** User customizes invitation content and design
19. **Publishing:** User publishes invitation when ready

---

## Authenticated User Journey

### Access Phase
1. **Sign In:** User signs in with credentials or OAuth at `/login`
2. **Redirect:** User is redirected to `/dashboard` (or `/app` which redirects)
3. **Dashboard:** User sees welcome toast and invitation overview
4. **Overview:** User sees:
   - Quick start section with 3-step guide
   - Statistics (total, published, drafts) if invitations exist
   - Invitations grid or empty state

### Creation Phase
5. **New Invitation:** User clicks "Create New" card or "Choose layout" button
6. **Layout Gallery:** User navigates to `/layouts` (authenticated)
7. **Layout Selection:** User browses and filters layouts by category
8. **Preset Selection:** User selects layout, chooses preset or starts blank
9. **Invitation Created:** System creates invitation via API, status: "draft"
10. **Editor:** User is redirected to `/builder/:invitationId`
11. **Customization:** User customizes in split-pane editor:
    - Left sidebar: Form controls and editing fields
    - Right pane: Live preview with device mode switching
    - Text content (names, dates, locations)
    - Images and photos
    - Colors and fonts
    - Layout adjustments

### Management Phase
12. **Save:** Changes auto-save or user manually saves as draft
13. **Preview:** User toggles device modes (desktop, tablet, mobile)
14. **Edit Mode:** User toggles edit mode on/off
15. **Refinement:** User makes additional edits with real-time preview
16. **Publishing:** User publishes invitation when ready (status: "published")
17. **Sharing:** User shares invitation link with guests

### Profile Management
18. **Profile Access:** User clicks profile link in user dropdown
19. **Account Info:** User views account information
20. **Password Change:** User changes password with OTP verification:
    - Requests OTP via email
    - Enters 6-digit code
    - Verifies and updates password

### Ongoing Use
21. **Dashboard:** User returns to dashboard to manage invitations
22. **Editing:** User clicks "Edit" on invitation card to open builder
23. **Title Editing:** User edits invitation titles inline on dashboard
24. **Deletion:** User deletes invitations with confirmation modal
25. **New Invitations:** User creates additional invitations
26. **Management:** User manages multiple invitations with statistics

---

## Flow Diagrams

### Sign Up → Create Invitation Flow

```
Landing Page (/)
    ↓
[Click "Start Free" or "Customize This Design"]
    ↓
Sign Up Page (/signup)
    ↓
[Fill form / OAuth]
    ↓
Account Created
    ↓
Smart Redirect (/app)
    ↓
Dashboard (/dashboard) or Layout Gallery (/layouts)
    ↓
[Click "Create New" or "Choose layout"]
    ↓
Layout Gallery (/layouts)
    ↓
[Select layout]
    ↓
[Select preset or start blank]
    ↓
Invitation Created (API)
    ↓
Invitation Editor (/builder/:invitationId)
    ↓
Customization (Split-pane: Sidebar + Preview)
    ↓
Save / Publish
```

### Sign In → Edit Invitation Flow

```
Login Page (/login)
    ↓
[Enter credentials / OAuth]
    ↓
Authentication
    ↓
Dashboard (/dashboard)
    ↓
[Welcome toast shown]
    ↓
[View invitations grid]
    ↓
[Click "Edit" on invitation card]
    ↓
Invitation Editor (/builder/:invitationId)
    ↓
Edit & Customize (Sidebar controls + Live preview)
    ↓
[Toggle device modes: desktop/tablet/mobile]
    ↓
[Toggle edit mode on/off]
    ↓
Save Changes (Auto-save or manual)
```

### Browse → Preview → Create Flow

```
Landing Page (/)
    ↓
Layout Browsing Section
    ↓
[Search / Filter layouts]
    ↓
[Click "View Demo"]
    ↓
Preview Modal
    ↓
[If authenticated]
    ↓
[Click "Start with this layout"]
    ↓
Layout Gallery (/layouts)
    ↓
[Select preset or start blank]
    ↓
Invitation Created
    ↓
Invitation Editor (/builder/:invitationId)
    ↓
[If not authenticated]
    ↓
Sign Up Page (/signup)
    ↓
Account Creation
    ↓
Smart Redirect (/app)
    ↓
Layout Gallery (/layouts)
    ↓
Invitation Created
    ↓
Invitation Editor (/builder/:invitationId)
```

---

## Authentication Gate Points

The following actions require authentication and redirect to `/signup` if user is not logged in:

- Clicking "Customize This Design" on any layout
- Clicking "Start with this layout" in demo modal
- Clicking "Create Your Invitation" buttons
- Direct navigation to protected routes:
  - `/dashboard` - User dashboard
  - `/layouts` - Authenticated layout gallery
  - `/builder/:invitationId` - Invitation editor
  - `/profile` - User profile and settings
  - `/app` - Smart redirect
- Accessing user account settings

---

## Key User Decision Points

### 1. Initial Interest
- **Trigger:** User sees value proposition on landing page
- **Decision:** Continue exploring or leave
- **Next Step:** Browse layouts or sign up

### 2. Layout Selection
- **Trigger:** User views available layouts
- **Decision:** Choose a layout or continue browsing
- **Next Step:** View demo or customize

### 3. Preview Decision
- **Trigger:** User views layout demo
- **Decision:** Use this layout or browse more
- **Next Step:** Start customizing or close preview

### 4. Registration Decision
- **Trigger:** User wants to customize a layout
- **Decision:** Create account or sign in
- **Next Step:** Complete registration or authentication

### 5. Customization Completion
- **Trigger:** User finishes customizing invitation
- **Decision:** Save as draft, publish, or continue editing
- **Next Step:** Publish and share or save for later

---

## Conversion Funnel

```
All Visitors
    ↓
Landing Page Visitors
    ↓
Layout Browsers
    ↓
Demo Viewers
    ↓
Sign Up Initiators
    ↓
Account Creators
    ↓
First Invitation Creators
    ↓
Published Invitations
```

---

## User Retention Points

### First-Time Users
- Welcome message on dashboard
- Empty state with clear CTAs
- Onboarding tips or tutorial
- Quick start guide

### Returning Users
- Dashboard with existing invitations
- Quick access to create new invitations
- Easy editing of existing invitations
- Sharing and management tools

---

## Error Recovery Flows

### Authentication Errors
- Invalid credentials → Show error, allow retry
- Session expired → Redirect to login
- Account locked → Show message and support contact

### Invitation Errors
- Save failed → Show error, allow retry
- Publish failed → Show error, allow retry
- Network error → Show message, allow retry

---

## Additional Flows

### Profile Settings Flow
1. **Access:** User clicks profile link in user dropdown
2. **View Info:** User sees account information (email, name)
3. **Password Change:** User changes password with OTP:
   - Enters new password and confirmation
   - Requests OTP via email
   - Receives 6-digit code
   - Enters code to verify
   - Password updated successfully

### Layout Gallery Flow (Authenticated)
1. **Access:** User navigates to `/layouts`
2. **Browse:** User sees available layouts with category filtering
3. **Select:** User clicks on layout card
4. **Preset:** User chooses preset or starts blank
5. **Create:** System creates invitation and redirects to builder

### Static Pages
- **Support:** `/pricing`, `/faqs`, `/help`, `/tutorials`, `/api-docs`
- **Company:** `/about`, `/contact`, `/blog`, `/careers`, `/press`
- **Legal:** `/privacy`, `/terms`, `/cookies`
- **Layouts:** `/layouts-gallery`, `/layouts/:category`

All static pages are publicly accessible without authentication.

## Key Implementation Details

### Routes
- **Public:** `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, static pages
- **Protected:** `/dashboard`, `/layouts`, `/builder/:invitationId`, `/profile`, `/app`

### Smart Redirect (`/app`)
- Redirects authenticated users based on state
- Typically redirects to `/dashboard` or `/layouts`

### Builder Interface
- Split-pane layout: Sidebar (controls) + Preview pane
- Device modes: Desktop, Tablet, Mobile
- Edit mode toggle: Show/hide sidebar
- Real-time preview updates

### Dashboard Features
- Statistics: Total, Published, Drafts
- Inline title editing
- Delete confirmation modal
- Welcome toast (once per session)
- Empty state for new users

### Password Change
- OTP-based verification
- 5-minute expiry
- 5 attempt limit
- 30-second cooldown
- Email-based delivery

---

*This summary provides a high-level overview of user flows based on the actual codebase implementation. For detailed information about each flow, refer to the individual flow documentation files.*

