# Sign Up Flow

**URL:** `/signup`

**Description:** New users can create an account to access the invitation builder.

## Form Fields

### Full Name
- **Type:** Text input
- **Required:** Yes
- **Purpose:** User's full name for account identification

### Email Address
- **Type:** Text input
- **Required:** Yes
- **Purpose:**
  - Account identification
  - Communication channel
  - Password reset functionality

### Password
- **Type:** Password input
- **Required:** Yes
- **Features:**
  - Password strength indicator (status element)
  - Validates password requirements
  - Real-time feedback on password strength

## Action Buttons

### Create Account
- **Type:** Primary button
- **Action:** Submits the registration form
- **Result:**
  - Creates new user account
  - Authenticates user
  - Redirects to dashboard or invitation creation flow upon success

### Continue with Google
- **Type:** Secondary button
- **Action:** OAuth authentication
- **Features:**
  - Allows users to sign up using Google account
  - Includes Google logo/icon
  - Streamlined registration process

## Additional Elements

- **Link to sign in:** "Already have an account? Sign in"
- **Legal notice:** "By creating an account, you agree to our Terms of Service and Privacy Policy"
  - Links to Terms of Service and Privacy Policy pages

## User Flow

1. User arrives at signup page (either directly or redirected from "Customize This Design")
2. User fills in Full Name, Email, and Password
3. Password strength indicator shows real-time feedback
4. User clicks "Create Account" or "Continue with Google"
5. Upon successful registration, user is authenticated and redirected (likely to dashboard or invitation creation)

## Error Handling

- Form validation errors displayed for empty required fields
- Duplicate email errors shown if email already exists
- Password requirements must be met (shown via strength indicator)
- Invalid email format validation
- Network error handling

## Entry Points

- Clicking "Start Free" or "Start Creating Free" buttons
- Clicking "Customize This Design" while not authenticated
- Clicking "Start with this layout" in demo modal while not authenticated
- Direct navigation to `/signup`

## Success Flow

After successful registration:
- User is authenticated
- Session is created
- User is redirected to dashboard or invitation creation flow
- Welcome message or onboarding may be shown

