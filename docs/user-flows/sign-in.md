# Sign In Flow

**URL:** `/login`

**Description:** Existing users can sign in to access their account and invitations.

## Form Fields

### Email Address
- **Type:** Text input
- **Required:** Yes
- **Purpose:** User's registered email address for account identification

### Password
- **Type:** Password input
- **Required:** Yes
- **Purpose:** User's account password for authentication

### Remember me
- **Type:** Checkbox
- **Required:** No
- **Purpose:** Allows user to stay logged in across browser sessions
- **Behavior:** Extends session duration or uses persistent cookie

## Action Buttons

### Sign In
- **Type:** Primary button
- **Action:** Submits login credentials
- **Behavior:**
  - Button text changes to "Signing in..." during submission
  - Shows loading state
  - Authenticates user and redirects upon success

### Continue with Google
- **Type:** Secondary button
- **Action:** OAuth authentication
- **Features:**
  - Allows users to sign in using Google account
  - Includes Google logo/icon
  - Single-click authentication

## Additional Elements

- **Link to signup:** "Don't have an account? Create one for free"
- **Link to password reset:** "Forgot password?" (in password field section)
- **Legal notice:** "By signing in, you agree to our Terms of Service and Privacy Policy"
  - Links to Terms of Service and Privacy Policy pages

## User Flow

1. User arrives at login page (via "Sign In" button or direct navigation)
2. User enters email and password
3. Optionally checks "Remember me" checkbox
4. User clicks "Sign In" or "Continue with Google"
5. System validates credentials
6. Upon successful authentication, user is redirected (likely to dashboard)

## Error Handling

- **Invalid credentials:** Error message displayed for incorrect email/password combination
- **Form validation:** Errors shown for empty required fields
- **Account not found:** Error if email doesn't exist in system
- **Network errors:** Handling for connection issues

## Entry Points

- Clicking "Sign In" button in navigation
- Clicking "Sign In" link from signup page
- Direct navigation to `/login`
- Redirected from protected routes when not authenticated

## Success Flow

After successful authentication:
- User session is created
- Authentication tokens are stored
- User is redirected to dashboard or previously requested page
- User can now access protected features

## Security Features

- Password field is masked
- HTTPS encryption for credential transmission
- Session management
- OAuth option for secure third-party authentication

