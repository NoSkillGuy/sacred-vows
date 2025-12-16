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
- `GenerateAccessToken(userID, email)` - Creates short-lived access token
- `GenerateRefreshToken(userID, email)` - Creates long-lived refresh token
- `ValidateAccessToken(tokenString)` - Validates and extracts claims from access token

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
- Access token expiration (default: 15 minutes)
- Refresh token expiration (default: 30 days)
- Issuer and audience claims
- Clock skew tolerance (default: 60 seconds)

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
2. **Access Token Expiration**: Short-lived (default: 15 minutes) for security
3. **Refresh Token Expiration**: Long-lived (default: 30 days) for UX
4. **Token Rotation**: Refresh tokens are rotated on each use
5. **HTTPS**: Required in production for OAuth and secure cookies
6. **Token Storage**: Access tokens in memory, refresh tokens in HttpOnly cookies
7. **ID Token Verification**: Always verify Google ID tokens

## Related Files

- Middleware: `internal/interfaces/http/middleware/auth_middleware.go`
- Use Cases: `internal/usecase/auth/`
- Configuration: `internal/infrastructure/config/config.go`

## Usage

**JWT:**
```go
jwtService := auth.NewJWTService(secret, accessExpiration, refreshExpiration, issuer, audience, clockSkewTolerance)
accessToken, err := jwtService.GenerateAccessToken(userID, email)
tokenID, refreshToken, err := jwtService.GenerateRefreshToken(userID, email)
claims, err := jwtService.ValidateAccessToken(tokenString)
```

**Google OAuth:**
```go
oauthService := auth.NewGoogleOAuthService(config)
authURL := oauthService.GetAuthURL()
userInfo, err := oauthService.VerifyIDToken(ctx, idToken)
```
