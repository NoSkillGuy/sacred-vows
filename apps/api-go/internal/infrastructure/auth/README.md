# Authentication Infrastructure

## Purpose

Provides authentication service implementations including JWT token management and Google OAuth integration.

## Components

### JWT Service (`jwt.go`)

Handles JSON Web Token generation and validation.

**Features:**
- Token generation with claims
- Token validation
- Configurable expiration
- Secure token signing

**Methods:**
- `GenerateToken(userID, email)` - Creates JWT token
- `ValidateToken(tokenString)` - Validates and extracts claims

**Claims Structure:**
```go
type Claims struct {
    UserID string
    Email  string
    jwt.RegisteredClaims
}
```

**Configuration:**
- Secret key from environment
- Expiration time (default: 7 days)

### Google OAuth Service (`google.go`)

Handles Google OAuth 2.0 authentication flow.

**Features:**
- OAuth configuration
- Authorization URL generation
- Code exchange for tokens
- ID token verification
- User info retrieval

**Methods:**
- `GetAuthURL()` - Generate authorization URL
- `ExchangeCode(ctx, code)` - Exchange code for token
- `VerifyIDToken(ctx, idToken)` - Verify Google ID token
- `GetOAuthConfig()` - Get OAuth configuration
- `GetFrontendURL()` - Get frontend URL for redirects

**OAuth Flow:**
1. User clicks "Sign in with Google"
2. Redirect to `GetAuthURL()`
3. User authorizes on Google
4. Google redirects to callback with code
5. Exchange code for token
6. Get user info from Google
7. Create/find user in database

## Dependencies

- **golang.org/x/oauth2**: OAuth 2.0 client
- **google.golang.org/api/idtoken**: ID token verification
- **github.com/golang-jwt/jwt/v5**: JWT library

## Configuration

Required environment variables:
- `JWT_SECRET` - Secret for JWT signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth redirect URI
- `FRONTEND_URL` - Frontend URL for redirects

## Security Considerations

1. **JWT Secret**: Must be strong and kept secret
2. **Token Expiration**: Configured to 7 days (adjustable)
3. **HTTPS**: Required in production for OAuth
4. **Token Storage**: Tokens should be stored securely client-side
5. **ID Token Verification**: Always verify Google ID tokens

## Related Files

- Middleware: `internal/interfaces/http/middleware/auth_middleware.go`
- Use Cases: `internal/usecase/auth/`
- Configuration: `internal/infrastructure/config/config.go`

## Usage

**JWT:**
```go
jwtService := auth.NewJWTService(secret, expiration)
token, err := jwtService.GenerateToken(userID, email)
claims, err := jwtService.ValidateToken(tokenString)
```

**Google OAuth:**
```go
oauthService := auth.NewGoogleOAuthService(config)
authURL := oauthService.GetAuthURL()
userInfo, err := oauthService.VerifyIDToken(ctx, idToken)
```
