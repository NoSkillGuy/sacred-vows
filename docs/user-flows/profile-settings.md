# Profile Settings Flow

**URL:** `/profile`

**Description:** User profile page for managing account information and changing password.

## Entry Points

- From dashboard user dropdown menu (Profile link)
- Direct navigation to `/profile`
- From user menu in other authenticated pages

## Page Structure

### Header
- **Logo:** Sacred Vows logo (links to home)
- **Navigation:**
  - "My Invitations" button (links to `/dashboard`)
  - User menu dropdown (same as dashboard)
    - Profile link (current page)
    - Sign Out button

### Main Content

#### Page Header
- **Title:** "Profile Settings"

#### Account Information Section
- **Heading:** "Account Information"
- **Display Fields:**
  - **Email:** User's email address (read-only)
  - **Name:** User's full name (read-only)
  - Shows "N/A" or "Not set" if data unavailable

#### Change Password Section
- **Heading:** "Change Password"
- Multi-step password change flow with OTP verification

## Password Change Flow

### Step 1: Request OTP (Initial State)
- **Form Fields:**
  - New Password (required, min 8 characters)
  - Confirm Password (required, min 8 characters)
- **Validation:**
  - Passwords must match
  - Minimum 8 characters required
  - Real-time validation feedback
- **Action Button:**
  - "Request Verification Code" (primary)
  - Submits form to request OTP

### Step 2: OTP Sent (Loading State)
- **State:** "requesting"
- **Display:** "Sending verification code..."
- **Behavior:**
  - API call to `requestPasswordChangeOTP(user.email)`
  - Shows loading message

### Step 3: Enter OTP
- **State:** "otp-sent"
- **OTP Information:**
  - Message: "We've sent a 6-digit verification code to [email]"
  - Expiry timer: Shows time remaining (5 minutes)
  - Attempts remaining: Shows count (starts at 5)
- **Form Fields:**
  - Verification Code (6-digit OTP)
    - Type: text input
    - Pattern: `[0-9]{6}`
    - Max length: 6
    - Auto-complete: "one-time-code"
    - Placeholder: "000000"
- **Action Buttons:**
  - "Verify & Update Password" (primary)
    - Disabled during verification
    - Shows "Verifying..." when processing
  - "Resend Code" (secondary)
    - Disabled during 30-second cooldown
    - Shows countdown: "Resend (Xs)"

### Step 4: Verifying OTP
- **State:** "verifying"
- **Display:** "Verifying code..."
- **Behavior:**
  - API call to `verifyPasswordChangeOTP(otp, newPassword)`
  - Validates OTP format (6 digits)
  - Processes password change

### Step 5: Success
- **State:** "success"
- **Display:** "✓ Password updated successfully!"
- **Behavior:**
  - Form fields cleared
  - Timers reset
  - Auto-returns to idle state after 3 seconds

### Step 6: Error Handling
- **State:** "error" or returns to previous state
- **Error Messages:**
  - Invalid OTP format
  - OTP verification failed
  - Attempt count from error message
  - Maximum attempts reached
  - OTP expired
- **Behavior:**
  - Error displayed in alert
  - User can retry or resend
  - Attempts tracked and displayed

## OTP System Details

### Request OTP
- **API:** `requestPasswordChangeOTP(email)`
- **Cooldown:** 30 seconds between requests
- **Expiry:** 5 minutes (300 seconds)
- **Max Attempts:** 5 attempts per OTP

### Verify OTP
- **API:** `verifyPasswordChangeOTP(otp, newPassword)`
- **Validation:**
  - 6-digit numeric code
  - Must match sent OTP
  - Not expired
  - Within attempt limit

### Resend OTP
- **Cooldown:** 30 seconds
- **Validation:** Same as initial request
- **Behavior:** Resets expiry and attempts

## Timer System

### Cooldown Timer
- **Duration:** 30 seconds
- **Purpose:** Prevents spam OTP requests
- **Display:** "Resend (Xs)" button text
- **Behavior:** Button disabled during cooldown

### Expiry Timer
- **Duration:** 5 minutes (300 seconds)
- **Purpose:** OTP validity period
- **Display:** "Code expires in: MM:SS"
- **Behavior:**
  - Counts down in real-time
  - Auto-expires and resets to idle when time runs out
  - Shows expiry message

### Attempt Counter
- **Initial:** 5 attempts
- **Decrements:** On failed verification
- **Display:** "Attempts remaining: X"
- **Behavior:**
  - Extracted from error messages
  - Resets on new OTP request
  - Locks out when reaches 0

## User Flow

1. User navigates to `/profile`
2. User views account information
3. User enters new password and confirmation
4. User clicks "Request Verification Code"
5. System sends OTP to user's email
6. User receives email with 6-digit code
7. User enters OTP in form
8. User clicks "Verify & Update Password"
9. System verifies OTP and updates password
10. Success message displayed
11. Form resets after 3 seconds

## Error Scenarios

### Password Mismatch
- Error: "Passwords do not match. Please try again."
- State: Returns to idle
- Action: User corrects passwords

### Weak Password
- Error: "Password must be at least 8 characters long."
- State: Returns to idle
- Action: User enters longer password

### Invalid OTP Format
- Error: "Please enter a valid 6-digit OTP code."
- State: Returns to otp-sent
- Action: User enters correct format

### OTP Verification Failed
- Error: Error message from API
- State: Returns to otp-sent
- Action: User can retry or resend

### Maximum Attempts Reached
- Error: "Maximum attempts reached"
- State: Returns to idle
- Action: User must request new OTP

### OTP Expired
- Error: "OTP has expired. Please request a new one."
- State: Returns to idle
- Action: User requests new OTP

## Loading States

### Initial Load
- Shows "Loading..." spinner
- Fetches user data from API
- Redirects to login if unauthorized

### Password Change States
- "requesting": Sending OTP
- "verifying": Verifying OTP
- Both show loading messages

## Integration Points

- **Dashboard:** "My Invitations" button links back
- **User Menu:** Accessible from all authenticated pages
- **Logout:** Sign out from user dropdown
- **Home:** Logo links to landing page

## Security Features

- **OTP-Based Verification:** Secure password change
- **Attempt Limiting:** Prevents brute force
- **Time-Limited OTP:** 5-minute expiry
- **Cooldown Period:** Prevents spam
- **Email Verification:** OTP sent to registered email
- **Password Validation:** Minimum 8 characters

## Notes

- Account information is read-only (email and name)
- Password change requires OTP verification
- OTP system includes security measures (expiry, attempts, cooldown)
- User-friendly error messages guide users
- Timer displays provide clear feedback
- Form resets automatically after success
- All states are clearly communicated to user

