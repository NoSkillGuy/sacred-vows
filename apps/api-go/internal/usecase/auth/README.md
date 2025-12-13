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
