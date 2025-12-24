# Authentication Use Cases

## Purpose

Handles all authentication-related business logic including user registration, login, and OAuth flows.

## Use Cases

### RegisterUseCase (`register.go`)

Creates a new user account.

**Input:**
- `Email`: User email
- `Password`: Plain text password
- `Name`: Optional user name

**Output:**
- `User`: User DTO (without password)

**Process:**
1. Check if user already exists
2. Hash password using bcrypt
3. Create user entity
4. Save to repository
5. Return user data

### LoginUseCase (`login.go`)

Authenticates a user with email and password.

**Input:**
- `Email`: User email
- `Password`: Plain text password

**Output:**
- `User`: User DTO

**Process:**
1. Find user by email
2. Verify password hash
3. Return user data (token generation handled by handler)

### GetCurrentUserUseCase (`get_current_user.go`)

Retrieves the current authenticated user.

**Input:**
- `UserID`: From JWT token

**Output:**
- `User`: User DTO

**Process:**
1. Find user by ID
2. Return user data

### GoogleOAuthUseCase (`google_oauth.go`)

Handles Google OAuth authentication flow.

**Input:**
- `Code`: OAuth authorization code

**Output:**
- `User`: User DTO

**Process:**
1. Exchange code for access token
2. Get user info from Google
3. Find or create user
4. Return user data

**Note:** Token generation is handled by the HTTP handler after use case execution.

### RequestPasswordChangeOTPUseCase (`request_password_change_otp.go`)

Sends a 6-digit OTP to the user's email for password change verification.

**Input:**
- `UserID`: User ID from JWT token
- `Email`: User email

**Output:**
- `Success`: Boolean indicating success

**Process:**
1. Find user by ID
2. Check 30-second cooldown (prevents spam)
3. Invalidate any existing OTPs for the user
4. Generate 6-digit numeric OTP
5. Hash OTP with SHA-256
6. Create OTP entity (5-minute expiry)
7. Send OTP email
8. Return success

**Security Features:**
- 30-second cooldown between requests
- OTP expires in 5 minutes
- OTP is hashed before storage
- Old OTPs are invalidated when new one is requested

### VerifyPasswordChangeOTPUseCase (`verify_password_change_otp.go`)

Verifies the OTP and updates the user's password.

**Input:**
- `UserID`: User ID from JWT token
- `OTP`: 6-digit OTP code
- `NewPassword`: New password

**Output:**
- `Success`: Boolean indicating success

**Process:**
1. Validate password strength
2. Find OTP by user ID
3. Check if OTP is expired
4. Check if OTP is already used
5. Check if max attempts (5) reached
6. Hash provided OTP and compare with stored hash
7. If match: mark OTP as used, update password (bcrypt), return success
8. If mismatch: increment attempt count, return error

**Security Features:**
- Max 5 attempts per OTP
- Single-use OTP (marked as used after successful verification)
- OTP expiry enforced
- Password validation

## DTOs (`dto.go`)

- `UserDTO`: Public user representation (no password)

## Dependencies

- `repository.UserRepository`: User data operations
- `domain.User`: User entity
- `golang.org/x/crypto/bcrypt`: Password hashing
- `golang.org/x/oauth2`: OAuth flow

## Related Files

- Handler: `internal/interfaces/http/handlers/auth_handler.go`
- Domain: `internal/domain/user.go`
- Repository: `internal/interfaces/repository/user_repository.go`
