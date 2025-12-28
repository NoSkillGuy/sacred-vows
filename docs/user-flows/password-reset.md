# Password Reset Flow

**URL:** `/forgot-password`

**Description:** Users who have forgotten their password can request a reset link.

## Form Fields

### Email Address
- **Type:** Text input
- **Required:** Yes
- **Purpose:**
  - Email address associated with the account
  - Reset link will be sent to this email
  - Used to identify the account for password reset

## Action Buttons

### Send Reset Link
- **Type:** Primary button
- **Action:** Submits the email address
- **Result:**
  - Sends password reset email to the provided address
  - Shows confirmation message upon success (even if email doesn't exist, for security)
  - Prevents email enumeration attacks

## Additional Elements

- **Link back to sign in:** "Remember your password? Sign in"
- **Legal notice:** "By using this service, you agree to our Terms of Service and Privacy Policy"
  - Links to Terms of Service and Privacy Policy pages

## User Flow

1. User clicks "Forgot password?" link on login page
2. User arrives at password reset request page
3. User enters their email address
4. User clicks "Send Reset Link"
5. System processes the request:
   - If email exists: Sends password reset email
   - If email doesn't exist: Shows same success message (security best practice)
6. User receives email with reset link (if email exists)
7. User clicks link in email (likely redirects to `/reset-password/:token`)
8. User is shown password reset form
9. User enters new password
10. User confirms new password
11. User submits new password
12. System validates and updates password
13. User is redirected to login page or automatically signed in

## Security Considerations

- **Email Enumeration Prevention:** Same success message shown regardless of whether email exists
- **Token Expiration:** Reset tokens expire after a set time period
- **Single Use Tokens:** Reset tokens can only be used once
- **Secure Token Generation:** Cryptographically secure tokens

## Email Content (Expected)

The password reset email likely contains:
- Subject line indicating password reset request
- Clear instructions
- Reset link with secure token
- Expiration time information
- Security warning if user didn't request reset

## Reset Password Form (Not Observed)

The actual password reset form (step 7-9) was not observed in this exploration, but typically includes:

- New password field
- Confirm password field
- Password strength requirements
- Submit button
- Link back to login

**URL Pattern:** Likely `/reset-password/:token` or `/reset-password?token=:token`

## Entry Points

- Clicking "Forgot password?" link on login page
- Direct navigation to `/forgot-password`

## Notes

- The password reset flow follows security best practices
- Users receive clear feedback at each step
- The flow prevents unauthorized password changes
- Token-based approach ensures secure password reset

