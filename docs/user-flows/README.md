# User Flows Documentation

This document describes all user flows available in the Sacred Vows application, based on the actual codebase implementation.

## Table of Contents

### Public Flows
1. [Landing Page](./landing-page.md)
2. [Layout Browsing](./layout-browsing.md)
3. [View Demo](./view-demo.md)
4. [Public Layout Gallery](./layout-browsing.md#public-layout-gallery) - `/layouts-gallery`
5. [Layout Category Pages](./layout-browsing.md#category-pages) - `/layouts/:category`

### Authentication Flows
6. [Sign Up Flow](./sign-up.md) - `/signup`
7. [Sign In Flow](./sign-in.md) - `/login`
8. [Password Reset Flow](./password-reset.md) - `/forgot-password`, `/reset-password`

### Authenticated Flows
9. [Dashboard](./dashboard.md) - `/dashboard`
10. [Layout Gallery (Authenticated)](./creating-invitation.md) - `/layouts`
11. [Creating a New Invitation](./creating-invitation.md)
12. [Customizing an Invitation](./customizing-invitation.md) - `/builder/:invitationId`
13. [Profile Settings](./profile-settings.md) - `/profile` (NEW)

### Static Pages
14. **Support Pages:**
    - Pricing - `/pricing`
    - FAQs - `/faqs`
    - Help Center - `/help`
    - Tutorials - `/tutorials`
    - API Documentation - `/api-docs`

15. **Company Pages:**
    - About Us - `/about`
    - Contact - `/contact`
    - Blog - `/blog`
    - Careers - `/careers`
    - Press - `/press`

16. **Legal Pages:**
    - Privacy Policy - `/privacy`
    - Terms of Service - `/terms`
    - Cookie Policy - `/cookies`

### Additional Resources
17. [Flow Summary](./flow-summary.md)

---

## Quick Reference

### Authentication Gate Points

The following actions require authentication and redirect to signup if user is not logged in:

- Clicking "Customize This Design" on any layout
- Clicking "Start with this layout" in demo modal
- Clicking "Create Your Invitation" buttons
- Direct navigation to `/dashboard`, `/layouts`, `/builder/*`, `/profile`, or `/app`

### Protected Routes

All of these routes require authentication:
- `/dashboard` - User's invitation dashboard
- `/layouts` - Authenticated layout gallery
- `/builder/:invitationId` - Invitation editor
- `/profile` - User profile and settings
- `/app` - Smart redirect (redirects to dashboard or layouts based on user state)

### Key Features

- **Authentication:**
  - OAuth option ("Continue with Google") available on signup and login
  - Password strength validation during signup
  - "Remember me" option during login
  - Password reset flow with email verification
  - Profile password change with OTP verification

- **Invitation Management:**
  - Dashboard shows all invitations with stats (total, published, drafts)
  - Inline title editing on invitation cards
  - Edit, preview, and delete actions per invitation
  - Delete confirmation modal
  - Status indicators (draft/published)

- **Layout Selection:**
  - Public layout gallery (`/layouts-gallery`)
  - Category-based browsing (`/layouts/:category`)
  - Authenticated layout gallery with preset selection
  - Layout previews before selection

- **Builder Features:**
  - Split-pane layout (sidebar controls + live preview)
  - Edit mode toggle
  - Device mode switching (desktop, tablet, mobile)
  - Real-time preview updates

- **Profile Management:**
  - Account information display
  - Password change with OTP verification
  - Email-based OTP with expiry and attempt limits

- **Public Features:**
  - Demo previews available without authentication
  - Layout browsing and searching
  - All static pages accessible without authentication

- **Legal & Support:**
  - All flows include links to Terms of Service and Privacy Policy
  - Comprehensive support pages (help, FAQs, tutorials, API docs)
  - Company information pages

---

*Documentation based on codebase analysis of the Sacred Vows application.*

