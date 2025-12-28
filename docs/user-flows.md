# User Flows Documentation

This document has been reorganized into individual flow files for better maintainability and clarity.

## 📁 New Structure

All user flow documentation has been moved to the [`user-flows/`](./user-flows/) directory, with each flow documented in its own file.

**👉 [View the User Flows Documentation](./user-flows/README.md)**

## Quick Links

### Public Flows
- [Landing Page](./user-flows/landing-page.md)
- [Layout Browsing](./user-flows/layout-browsing.md)
- [View Demo](./user-flows/view-demo.md)

### Authentication Flows
- [Sign Up Flow](./user-flows/sign-up.md)
- [Sign In Flow](./user-flows/sign-in.md)
- [Password Reset Flow](./user-flows/password-reset.md)

### Authenticated Flows
- [Creating a New Invitation](./user-flows/creating-invitation.md)
- [Customizing an Invitation](./user-flows/customizing-invitation.md)
- [Dashboard Navigation](./user-flows/dashboard.md)

### Additional Resources
- [Flow Summary](./user-flows/flow-summary.md)

---

## Public Flows

### Landing Page

**URL:** `/`

**Description:** The main landing page serves as the entry point for all users.

**Key Elements:**
- **Navigation Bar:**
  - Logo/Brand name: "Sacred Vow" (links to home)
  - Navigation links: "Layout", "How It Work"
  - Action buttons: "Start Free", "Sign In"
  - Mobile menu toggle button

- **Hero Section:**
  - Tagline: "Digital Wedding Invitation"
  - Main heading: "Your Love Story Deserve A Beautiful Beginning"
  - Description text about creating personalized digital wedding invitations
  - Primary CTA: "Start Creating Free →" (redirects to `/signup`)
  - Secondary CTA: "View Layout" (scrolls to layouts section)
  - Trust indicator: "Private links, no spam. Live preview before sharing."

- **Layouts Showcase Section:**
  - Category tabs: "All" and "Popular"
  - Search bar: "Search layouts"
  - Layout cards with:
    - Layout preview image
    - "Customize This Design" button (redirects to `/signup` if not authenticated)
    - "View Demo" button (opens preview modal)

- **How It Works Section:**
  - Step 1: "Choose Your Layout" - Browse and select design
  - Step 2: "Customize Every Detail" - Add photos, edit text, choose colors
  - Step 3: "Share With Guests" - Send invitations with a click

- **Call-to-Action Section:**
  - Heading: "Ready to Begin Your Forever?"
  - Description text
  - CTA button: "Create Your Invitation →"
  - Trust indicator: "No spam. Private links, easy export, delete anytime."
  - "Back to top" button

- **Footer:**
  - Social media links: Instagram, Pinterest, Facebook, Twitter
  - Layout categories: All Layout, Traditional, Modern, Minimal, Floral
  - Company links: About Us, Blog, Career, Press, Contact
  - Support links: Help Center, FAQ, Pricing, Tutorial, API
  - Legal links: Privacy Policy, Terms of Service, Cookie Policy
  - Copyright notice

**User Actions:**
- Click "Start Free" or "Start Creating Free" → Redirects to signup page
- Click "Sign In" → Redirects to login page
- Click "Layout" link → Scrolls to layouts section (uses hash anchor `#layouts`)
- Click "View Demo" → Opens preview modal dialog
- Click "Customize This Design" → Redirects to signup page (if not authenticated)
- Click "Start with this layout" (in demo modal) → Redirects to signup page

---

### Layout Browsing

**URL:** `/` (with hash anchor `#layouts`)

**Description:** Users can browse available wedding invitation layouts on the landing page.

**Features:**
- **Category Filtering:**
  - Tab interface with "All" and "Popular" options
  - Allows users to filter layouts by popularity

- **Search Functionality:**
  - Search textbox labeled "Search layouts"
  - Enables users to search for specific layout designs

- **Layout Display:**
  - Layout cards showing preview images
  - Each layout has two action buttons:
    - "Customize This Design" - Starts customization flow (requires authentication)
    - "View Demo" - Opens preview modal

**User Flow:**
1. User lands on homepage
2. User can scroll to layouts section or click "Layout" in navigation
3. User can filter by category (All/Popular)
4. User can search for specific layouts
5. User clicks "View Demo" to preview a layout
6. User clicks "Customize This Design" to start creating (redirects to signup if not logged in)

---

### View Demo

**Description:** A modal dialog that allows users to preview a layout before committing to it.

**Modal Elements:**
- **Preview Content:**
  - Full preview of the selected layout design
  - Interactive preview (likely showing how the invitation would look)

- **Action Buttons:**
  - "Start with this layout" - Redirects to signup page (if not authenticated) or starts customization
  - "Close" - Closes the modal
  - "Close preview" button (X) in the header

**User Flow:**
1. User clicks "View Demo" on any layout card
2. Modal opens showing the layout preview
3. User can:
   - Click "Start with this layout" to begin customization (requires authentication)
   - Click "Close" or "Close preview" to dismiss the modal

**Note:** If user is not authenticated, clicking "Start with this layout" redirects to the signup page.

---

## Authentication Flows

### Sign Up Flow

**URL:** `/signup`

**Description:** New users can create an account to access the invitation builder.

**Form Fields:**
- **Full Name** (text input)
  - Required field for user's full name

- **Email Address** (text input)
  - Required field for user's email
  - Used for account identification and communication

- **Password** (password input)
  - Required field
  - Includes password strength indicator (status element)
  - Validates password requirements

**Action Buttons:**
- **Create Account** (primary button)
  - Submits the registration form
  - Creates new user account
  - Likely redirects to dashboard or invitation creation flow upon success

- **Continue with Google** (secondary button)
  - OAuth authentication option
  - Allows users to sign up using Google account
  - Includes Google logo/icon

**Additional Elements:**
- Link to sign in page: "Already have an account? Sign in"
- Legal notice: "By creating an account, you agree to our Terms of Service and Privacy Policy"
  - Links to Terms of Service and Privacy Policy pages

**User Flow:**
1. User arrives at signup page (either directly or redirected from "Customize This Design")
2. User fills in Full Name, Email, and Password
3. Password strength indicator shows feedback
4. User clicks "Create Account" or "Continue with Google"
5. Upon successful registration, user is authenticated and redirected (likely to dashboard or invitation creation)

**Error Handling:**
- Form validation errors (if any) would be displayed
- Duplicate email errors would be shown
- Password requirements must be met

---

### Sign In Flow

**URL:** `/login`

**Description:** Existing users can sign in to access their account and invitations.

**Form Fields:**
- **Email Address** (text input)
  - Required field
  - User's registered email address

- **Password** (password input)
  - Required field
  - User's account password

- **Remember me** (checkbox)
  - Optional
  - Allows user to stay logged in across sessions

**Action Buttons:**
- **Sign In** (primary button)
  - Submits login credentials
  - Button text changes to "Signing in..." during submission
  - Authenticates user and redirects upon success

- **Continue with Google** (secondary button)
  - OAuth authentication option
  - Allows users to sign in using Google account
  - Includes Google logo/icon

**Additional Elements:**
- Link to signup page: "Don't have an account? Create one for free"
- Link to password reset: "Forgot password?" (in password field section)
- Legal notice: "By signing in, you agree to our Terms of Service and Privacy Policy"
  - Links to Terms of Service and Privacy Policy pages

**User Flow:**
1. User arrives at login page (via "Sign In" button or direct navigation)
2. User enters email and password
3. Optionally checks "Remember me"
4. User clicks "Sign In" or "Continue with Google"
5. Upon successful authentication, user is redirected (likely to dashboard)

**Error Handling:**
- Invalid credentials error would be displayed
- Form validation errors for empty fields

---

### Password Reset Flow

**URL:** `/forgot-password`

**Description:** Users who have forgotten their password can request a reset link.

**Form Fields:**
- **Email Address** (text input)
  - Required field
  - Email address associated with the account
  - Reset link will be sent to this email

**Action Buttons:**
- **Send Reset Link** (primary button)
  - Submits the email address
  - Sends password reset email to the provided address
  - Likely shows a confirmation message upon success

**Additional Elements:**
- Link back to sign in: "Remember your password? Sign in"
- Legal notice: "By using this service, you agree to our Terms of Service and Privacy Policy"
  - Links to Terms of Service and Privacy Policy pages

**User Flow:**
1. User clicks "Forgot password?" link on login page
2. User arrives at password reset page
3. User enters their email address
4. User clicks "Send Reset Link"
5. System sends password reset email (if email exists in system)
6. User receives email with reset link
7. User clicks link in email (likely redirects to `/reset-password/:token`)
8. User sets new password
9. User is redirected to login page or automatically signed in

**Note:** The actual password reset form (step 7-8) was not observed in this exploration, but is a standard part of password reset flows.

---

## Authenticated Flows

*Note: The following flows are inferred based on the application structure and redirects observed. Direct exploration of authenticated flows requires a valid user account.*

### Creating a New Invitation

**Entry Points:**
- After successful signup
- From dashboard "Create New" button
- Clicking "Customize This Design" while authenticated
- Clicking "Start with this layout" in demo modal while authenticated

**Expected Flow:**
1. User selects a layout (from landing page or dashboard)
2. User is redirected to invitation editor/customization page
3. User can customize the invitation:
   - Add photos
   - Edit text content
   - Choose colors
   - Modify layout elements
4. User can preview the invitation
5. User can save the invitation
6. User can publish/share the invitation

**URL Pattern:** Likely `/editor/:invitationId` or `/create/:layoutId`

---

### Customizing an Invitation

**Entry Points:**
- From dashboard (clicking on existing invitation)
- Direct link to invitation editor

**Expected Features:**
- **Content Editing:**
  - Text fields for names, dates, locations, etc.
  - Rich text editing capabilities

- **Media Management:**
  - Photo upload functionality
  - Image gallery
  - Image cropping/editing tools

- **Design Customization:**
  - Color picker
  - Font selection
  - Layout adjustments

- **Preview:**
  - Live preview of changes
  - Mobile/desktop view toggle

- **Actions:**
  - Save draft
  - Publish invitation
  - Share invitation
  - Delete invitation

**URL Pattern:** Likely `/editor/:invitationId` or `/customize/:invitationId`

---

### Dashboard Navigation

**Expected URL:** `/dashboard` or `/`

**Expected Features:**
- **Invitation List:**
  - Grid or list view of user's invitations
  - Each invitation card showing:
    - Preview thumbnail
    - Invitation name/title
    - Status (draft, published)
    - Last modified date
    - Action buttons (edit, delete, share, publish)

- **Navigation:**
  - User profile/settings
  - Logout option
  - Create new invitation button

- **Quick Actions:**
  - Create new invitation
  - Browse layouts
  - View published invitations
  - Manage account settings

**User Flow:**
1. User signs in successfully
2. User is redirected to dashboard
3. User sees list of their invitations (or empty state if new user)
4. User can:
   - Click "Create New" to start a new invitation
   - Click on existing invitation to edit
   - Delete invitations
   - Share/publish invitations
   - Access account settings

---

## Flow Summary

### Unauthenticated User Journey

1. **Discovery:** User lands on homepage
2. **Exploration:** User browses layouts, views demos
3. **Interest:** User wants to customize a design
4. **Registration:** User is redirected to signup
5. **Account Creation:** User creates account or signs in
6. **Onboarding:** User is redirected to dashboard or invitation creation

### Authenticated User Journey

1. **Access:** User signs in
2. **Dashboard:** User sees their invitations
3. **Creation:** User creates new invitation or edits existing
4. **Customization:** User customizes invitation content and design
5. **Publishing:** User publishes invitation
6. **Sharing:** User shares invitation link with guests

---

## Authentication Gate Points

The following actions require authentication and redirect to signup if user is not logged in:

- Clicking "Customize This Design" on any layout
- Clicking "Start with this layout" in demo modal
- Clicking "Create Your Invitation" buttons
- Direct navigation to editor/dashboard routes

---

## Notes

- All authentication flows include OAuth option ("Continue with Google")
- Password strength validation is present during signup
- "Remember me" option available during login
- Password reset flow is accessible from login page
- Demo previews are available without authentication
- Layout browsing and searching are public features
- All flows include links to Terms of Service and Privacy Policy

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

*Document generated through browser-based exploration of the application interface.*

