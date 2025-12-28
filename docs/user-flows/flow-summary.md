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
12. **Redirect:** User is redirected to dashboard or invitation creation
13. **First Invitation:** User starts creating their first invitation
14. **Customization:** User customizes invitation content and design
15. **Publishing:** User publishes their first invitation

---

## Authenticated User Journey

### Access Phase
1. **Sign In:** User signs in with credentials or OAuth
2. **Dashboard:** User is redirected to dashboard
3. **Overview:** User sees their invitations (or empty state)

### Creation Phase
4. **New Invitation:** User clicks "Create New" or selects layout
5. **Layout Selection:** User chooses a layout template
6. **Editor:** User is taken to invitation editor
7. **Customization:** User customizes:
   - Text content (names, dates, locations)
   - Images and photos
   - Colors and fonts
   - Layout adjustments

### Management Phase
8. **Save:** User saves invitation as draft
9. **Preview:** User previews invitation on different devices
10. **Refinement:** User makes additional edits
11. **Publishing:** User publishes invitation when ready
12. **Sharing:** User shares invitation link with guests

### Ongoing Use
13. **Dashboard:** User returns to dashboard to manage invitations
14. **Editing:** User can edit existing invitations
15. **New Invitations:** User creates additional invitations
16. **Management:** User manages multiple invitations

---

## Flow Diagrams

### Sign Up → Create Invitation Flow

```
Landing Page
    ↓
[Click "Start Free" or "Customize This Design"]
    ↓
Sign Up Page
    ↓
[Fill form / OAuth]
    ↓
Account Created
    ↓
Dashboard / Invitation Creation
    ↓
Layout Selection
    ↓
Invitation Editor
    ↓
Customization
    ↓
Save / Publish
```

### Sign In → Edit Invitation Flow

```
Login Page
    ↓
[Enter credentials / OAuth]
    ↓
Authentication
    ↓
Dashboard
    ↓
[Click on invitation]
    ↓
Invitation Editor
    ↓
Edit & Customize
    ↓
Save Changes
```

### Browse → Preview → Create Flow

```
Landing Page
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
Invitation Editor
    ↓
[If not authenticated]
    ↓
Sign Up Page
    ↓
Account Creation
    ↓
Invitation Editor
```

---

## Authentication Gate Points

The following actions require authentication and redirect to signup if user is not logged in:

- Clicking "Customize This Design" on any layout
- Clicking "Start with this layout" in demo modal
- Clicking "Create Your Invitation" buttons
- Direct navigation to editor/dashboard routes
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

## Future Exploration Needed

To complete this documentation, the following authenticated flows should be explored:

1. **Invitation Editor:**
   - Full customization interface
   - Save/publish workflow
   - Preview functionality

2. **Dashboard:**
   - Invitation management
   - Settings/account management
   - Analytics/statistics (if available)

3. **Published Invitation View:**
   - Guest-facing invitation page
   - RSVP functionality (if available)
   - Sharing options

4. **Account Settings:**
   - Profile management
   - Password change
   - Account deletion
   - Subscription/billing (if applicable)

---

*This summary provides a high-level overview of user flows. For detailed information about each flow, refer to the individual flow documentation files.*

