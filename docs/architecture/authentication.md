# Authentication System Documentation

## Overview

The Sacred Vows application implements a comprehensive authentication system using JWT (JSON Web Tokens) with refresh token rotation, supporting both traditional email/password authentication and Google OAuth 2.0. The system follows security best practices including token rotation, HttpOnly cookies, and secure token storage.

## Architecture

### Backend Architecture

The backend authentication system is built using Go with a clean architecture pattern:

```
apps/api-go/
├── internal/
│   ├── domain/                    # Domain entities
│   │   ├── user.go               # User entity
│   │   └── refresh_token.go      # Refresh token entity
│   ├── infrastructure/
│   │   └── auth/                  # Authentication infrastructure
│   │       ├── jwt.go            # JWT service (token generation/validation)
│   │       └── google.go          # Google OAuth service
│   ├── usecase/
│   │   └── auth/                  # Authentication use cases
│   │       ├── register.go       # User registration
│   │       ├── login.go          # User login
│   │       ├── refresh_token.go  # Token refresh with rotation
│   │       ├── get_current_user.go
│   │       └── google_oauth.go   # Google OAuth flow
│   └── interfaces/
│       ├── http/
│       │   ├── handlers/
│       │   │   └── auth_handler.go  # HTTP handlers
│       │   └── middleware/
│       │       └── auth_middleware.go  # Authentication middleware
│       └── repository/            # Repository interfaces
```

### Frontend Architecture

The frontend authentication system is built using React:

```
apps/builder/src/
├── services/
│   ├── authService.js        # Authentication service
│   ├── tokenStorage.js      # In-memory token storage
│   └── apiClient.js         # API client with auto-refresh
└── components/
    └── Auth/
        ├── LoginPage.jsx
        ├── SignupPage.jsx
        └── ProtectedRoute.jsx  # Route protection
```

## Token System

### Access Tokens

**Type:** JWT (JSON Web Token)  
**Storage:** In-memory (JavaScript variable)  
**Lifetime:** 15 minutes (configurable)  
**Purpose:** Short-lived token for API authentication  
**Format:** `Bearer <token>` in Authorization header

**Claims Structure:**
```json
{
  "userId": "string",
  "email": "string",
  "jti": "token-id",
  "exp": 1234567890,
  "iat": 1234567890,
  "nbf": 1234567890,
  "iss": "sacred-vows-api",
  "aud": ["sacred-vows-client"]
}
```

### Refresh Tokens

**Type:** Secure random string (base64-encoded)  
**Storage:** HttpOnly cookie (not accessible via JavaScript)  
**Lifetime:** 30 days (configurable)  
**Purpose:** Long-lived token for obtaining new access tokens  
**Security:** 
- Stored as bcrypt hash in database
- HttpOnly, Secure, SameSite cookie
- Token rotation on each use
- Revocable

**Cookie Configuration:**
- Name: `refresh_token`
- Path: `/` (so it is sent to all API endpoints)
- HttpOnly: `true` (prevents XSS attacks)
- Secure: `true` on HTTPS, `false` on HTTP (local development)
- SameSite: `Lax`

## Authentication Flows

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Flow:**
1. User submits email, password, and optional name
2. Backend validates input
3. Checks if user already exists (409 Conflict if exists)
4. Hashes password using bcrypt (cost: 10)
5. Creates user entity with KSUID
6. Generates access token (JWT, 15min expiry)
7. Generates refresh token (random string, 30 days)
8. Hashes refresh token with bcrypt
9. Stores refresh token hash in database
10. Sets refresh token in HttpOnly cookie
11. Returns access token and user data

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"  // optional
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Frontend Handling:**
- Stores access token in memory via `tokenStorage.setAccessToken()`
- Stores user data in localStorage (for display purposes)
- Refresh token automatically stored in HttpOnly cookie

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Flow:**
1. User submits email and password
2. Backend finds user by email
3. Verifies password using bcrypt comparison
4. Generates access token (JWT, 15min expiry)
5. Generates refresh token (random string, 30 days)
6. Hashes refresh token with bcrypt
7. Stores refresh token hash in database
8. Sets refresh token in HttpOnly cookie
9. Returns access token and user data

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing email or password

### 3. Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Flow (Token Rotation):**
1. Frontend sends refresh token from HttpOnly cookie
2. Backend finds the stored token by comparing the provided token against stored bcrypt hashes
3. Checks token is not revoked
4. Checks token is not expired
5. Verifies user still exists
6. **Token Rotation:**
   - Generates NEW refresh token
   - Hashes new refresh token
   - Stores new refresh token in database
   - Revokes old refresh token
7. Generates new access token
8. Sets new refresh token in HttpOnly cookie
9. Returns new access token

**Request:**
- No body required
- Refresh token sent automatically via HttpOnly cookie

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Frontend Handling:**
- `apiClient.js` automatically intercepts 401 responses
- Attempts token refresh before retrying original request
- Prevents multiple simultaneous refresh requests
- Redirects to login if refresh fails

**Token Rotation Benefits:**
- Prevents token reuse attacks
- Limits damage from token theft
- Enables token revocation tracking

### 4. Google OAuth Authentication

The application supports two Google OAuth flows:

#### Flow A: Server-Side OAuth (Redirect Flow)

**Endpoints:**
- `GET /api/auth/google` - Initiates OAuth flow
- `GET /api/auth/google/callback` - Handles OAuth callback

**Flow:**
1. User clicks "Sign in with Google"
2. Frontend redirects to `/api/auth/google`
3. Backend redirects to Google OAuth consent screen
4. User authorizes on Google
5. Google redirects to `/api/auth/google/callback?code=...`
6. Backend exchanges code for access token
7. Backend fetches user info from Google
8. Backend finds or creates user
9. Generates access token (JWT)
10. Generates refresh token
11. Sets refresh token in HttpOnly cookie
12. Redirects to frontend with access token in URL: `/builder?token=...`
13. Frontend extracts token from URL and stores in memory

#### Flow B: Client-Side OAuth (ID Token Verification)

**Endpoint:** `POST /api/auth/google/verify`

**Flow:**
1. User clicks "Sign in with Google" button (Google Sign-In JavaScript library)
2. Google returns ID token (credential)
3. Frontend sends ID token to `/api/auth/google/verify`
4. Backend verifies ID token using Google's ID token verifier
5. Extracts user info from verified token
6. Finds or creates user
7. Generates access token (JWT)
8. Generates refresh token
9. Sets refresh token in HttpOnly cookie
10. Returns access token and user data

**Request:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1234567890",
    "email": "user@gmail.com",
    "name": "John Doe"
  }
}
```

**OAuth User Creation:**
- OAuth users have no password (empty string)
- User ID is generated using KSUID
- Email is used as unique identifier
- Name is populated from Google profile if available

### 5. Get Current User

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required (Bearer token)

**Flow:**
1. Middleware extracts userID from JWT claims
2. Use case fetches user from database
3. Returns user DTO (without password)

**Response:**
```json
{
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Frontend Usage:**
- Used to verify token validity
- Used to fetch updated user information
- Automatically refreshes token if expired (via `apiClient`)

### 6. User Logout

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Required (Bearer token)

**Flow:**
1. Middleware extracts userID from JWT claims
2. Backend revokes ALL refresh tokens for the user
3. Clears refresh token cookie
4. Returns success message

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Frontend Handling:**
- Clears access token from memory
- Clears user data from localStorage
- Redirects to login page

## Middleware

### AuthenticateToken

**Location:** `internal/interfaces/http/middleware/auth_middleware.go`

**Purpose:** Protects routes requiring authentication

**Flow:**
1. Extracts `Authorization` header
2. Validates format: `Bearer <token>`
3. Validates JWT token (signature, expiration, issuer, audience)
4. Extracts claims (userID, email)
5. Sets `userID` and `email` in Gin context
6. Continues to next handler

**Error Responses:**
- `401 Unauthorized`: Missing or invalid Authorization header
- `403 Forbidden`: Invalid or expired token

**Usage:**
```go
auth.GET("/me", middleware.AuthenticateToken(jwtService), handler.GetCurrentUser)
```

### OptionalAuth

**Location:** `internal/interfaces/http/middleware/auth_middleware.go`

**Purpose:** Allows routes to work with or without authentication

**Flow:**
1. Checks for `Authorization` header
2. If present and valid, sets `userID` and `email` in context
3. If absent or invalid, continues without setting context
4. Never aborts the request

**Usage:**
```go
invitations.POST("", middleware.OptionalAuth(jwtService), handler.Create)
```

## Frontend Token Management

### Token Storage

**File:** `src/services/tokenStorage.js`

**Implementation:**
- Access tokens stored in JavaScript memory (module-level variable)
- **NOT** stored in localStorage or sessionStorage
- Cleared on page refresh (intentional for security)

**Methods:**
- `setAccessToken(token)` - Store token in memory
- `getAccessToken()` - Retrieve token from memory
- `clearAccessToken()` - Remove token from memory
- `hasAccessToken()` - Check if token exists

**Security Rationale:**
- Prevents XSS attacks from stealing tokens
- Tokens automatically cleared on page refresh
- Refresh tokens handle session persistence

### API Client

**File:** `src/services/apiClient.js`

**Features:**
- Automatic token injection in Authorization header
- Automatic token refresh on 401 responses
- Prevents multiple simultaneous refresh requests
- Handles FormData (doesn't set Content-Type)

**Flow:**
1. Adds `Authorization: Bearer <token>` header if token exists
2. Makes API request
3. If 401 response:
   - Attempts token refresh
   - Retries original request with new token
   - Redirects to login if refresh fails

**Usage:**
```javascript
import { apiRequest } from './apiClient';

const response = await apiRequest('/invitations', {
  method: 'GET',
});
```

### Protected Routes

**File:** `src/components/Auth/ProtectedRoute.jsx`

**Purpose:** Protects React routes requiring authentication

**Flow:**
1. Checks for OAuth callback token in URL
2. If no access token, attempts refresh using refresh token cookie
3. Verifies token by calling `/api/auth/me`
4. Shows loading spinner during check
5. Redirects to login if authentication fails
6. Renders children if authenticated

**Features:**
- Handles OAuth callback tokens
- Automatic token refresh
- Token validation
- Loading state

## Database Schema

### Users Table

```sql
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,  -- NULL for OAuth users
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table

```sql
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL UNIQUE,
    "token_fingerprint" BYTEA NOT NULL UNIQUE,
    "hmac_key_id" SMALLINT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("user_id") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE UNIQUE INDEX "refresh_tokens_token_fingerprint_key" ON "refresh_tokens"("token_fingerprint");
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");
CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens"("expires_at");
CREATE INDEX "idx_refresh_tokens_revoked" ON "refresh_tokens"("revoked");
CREATE INDEX "idx_refresh_tokens_hmac_key_id" ON "refresh_tokens"("hmac_key_id");
```

**Token Storage:**
- token_hash (bcrypt) stored for verification
- token_fingerprint (HMAC-SHA256) stored for indexed lookup
- Original token never stored in database
- Token lookup uses token_fingerprint (deterministic), then verifies bcrypt hash

## Configuration

### Backend Environment Variables

**Required:**
- `JWT_SECRET` - Secret key for JWT signing (must be strong and unique)
- `DATABASE_URL` - PostgreSQL connection string
- `REFRESH_TOKEN_HMAC_KEYS` - JSON array of HMAC keys, e.g. `[{"id":1,"key_b64":"..."}]`
- `REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID` - Active HMAC key id to use for issuing new refresh tokens

### Publishing Environment Variables

See [Publishing Guide](../guides/publishing.md) for full publishing configuration. Key variables:

- `PUBLISHED_BASE_DOMAIN`
- `PUBLISH_ARTIFACT_STORE` (`filesystem` or `r2`)
- `SNAPSHOT_RENDERER_SCRIPT`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (when using R2)

**Optional (with defaults):**
- `JWT_ACCESS_EXPIRATION` - Access token lifetime (default: `15m`)
- `JWT_REFRESH_EXPIRATION` - Refresh token lifetime (default: `30d`)
- `JWT_ISSUER` - JWT issuer claim (default: `sacred-vows-api`)
- `JWT_AUDIENCE` - JWT audience claim (default: `sacred-vows-client`)
- `JWT_CLOCK_SKEW` - Clock skew tolerance (default: `60s`)

**Google OAuth:**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth redirect URI (default: `http://localhost:3000/api/auth/google/callback`)
- `FRONTEND_URL` - Frontend URL for redirects (default: `http://localhost:5173`)

### Frontend Environment Variables

**Optional:**
- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000/api`)

## Security Features

### 1. Password Security
- Passwords hashed using bcrypt (cost: 10)
- Passwords never stored in plain text
- Passwords never returned in API responses

### 2. Token Security
- **Access Tokens:**
  - Short-lived (15 minutes)
  - Stored in memory (not localStorage)
  - Signed with HMAC-SHA256
  - Includes expiration, issuer, audience claims
  - Clock skew tolerance for distributed systems

- **Refresh Tokens:**
  - Long-lived (30 days)
  - Stored in HttpOnly cookie (prevents XSS)
  - Stored as bcrypt hash in database
  - Token rotation on each use
  - Revocable

### 3. OAuth Security
- ID tokens verified using Google's official verifier
- Client ID validation
- Token signature verification
- Expiration and audience checks

### 4. Cookie Security
- HttpOnly: Prevents JavaScript access (XSS protection)
- Secure: HTTPS only (prevents MITM)
- Path: Limited to `/api/auth` (reduces attack surface)

### 5. Token Rotation
- New refresh token generated on each refresh
- Old refresh token revoked immediately
- Prevents token reuse attacks
- Limits damage from token theft

### 6. CORS Protection
- CORS middleware configured
- Frontend URL whitelist
- Prevents unauthorized origins

## Error Handling

### Backend Error Responses

**Standard Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Errors:**
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid credentials
- `403 Forbidden`: Valid token but insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., user email)
- `500 Internal Server Error`: Server error

### Frontend Error Handling

**Token Refresh Failures:**
- Clears access token
- Redirects to login page
- Shows error message

**API Request Failures:**
- Automatic retry with refreshed token
- User-friendly error messages
- Graceful degradation

## API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh` | No* | Refresh access token |
| POST | `/api/auth/logout` | Yes | Logout user |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/auth/google` | No | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |
| POST | `/api/auth/google/verify` | No | Verify Google ID token |

*Refresh endpoint requires refresh token in HttpOnly cookie

## Frontend Service Methods

### authService.js

- `register(userData)` - Register new user
- `login(email, password)` - Login user
- `logout()` - Logout user
- `getCurrentUser()` - Get user from localStorage
- `getCurrentUserFromAPI()` - Fetch user from API
- `isAuthenticated()` - Check if access token exists
- `getAuthToken()` - Get access token
- `refreshAccessToken()` - Refresh access token manually

### tokenStorage.js

- `setAccessToken(token)` - Store token in memory
- `getAccessToken()` - Get token from memory
- `clearAccessToken()` - Remove token from memory
- `hasAccessToken()` - Check if token exists

### apiClient.js

- `apiRequest(url, options)` - Make authenticated API request with auto-refresh

## Testing Authentication

### Manual Testing

1. **Registration:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}' \
     -c cookies.txt
   ```

3. **Get Current User:**
   ```bash
   curl -X GET http://localhost:3000/api/auth/me \
     -H "Authorization: Bearer <access_token>"
   ```

4. **Refresh Token:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/refresh \
     -b cookies.txt \
     -c cookies.txt
   ```

### Frontend Testing

1. Open browser DevTools → Application → Cookies
2. Verify refresh token cookie is set after login
3. Verify access token is in memory (check `tokenStorage.getAccessToken()`)
4. Test token refresh by waiting 15+ minutes or manually expiring token
5. Test logout clears both tokens

## Troubleshooting

### Common Issues

1. **"Invalid or expired token"**
   - Access token expired (15 minutes)
   - Solution: Token should auto-refresh, check refresh token cookie

2. **"Refresh token not found"**
   - Refresh token cookie missing or expired
   - Solution: User needs to login again

3. **"Invalid credentials"**
   - Wrong email/password
   - User doesn't exist
   - Solution: Check user exists, verify password

4. **CORS errors**
   - Frontend URL not whitelisted
   - Solution: Check `FRONTEND_URL` environment variable

5. **Google OAuth fails**
   - Invalid client ID/secret
   - Redirect URI mismatch
   - Solution: Verify Google OAuth configuration

## Best Practices

1. **Never store access tokens in localStorage**
   - Use in-memory storage
   - Let refresh tokens handle persistence

2. **Always use HttpOnly cookies for refresh tokens**
   - Prevents XSS attacks
   - Automatic cookie management

3. **Implement token rotation**
   - Generate new refresh token on each use
   - Revoke old tokens immediately

4. **Use short-lived access tokens**
   - Reduces damage from token theft
   - Forces regular token refresh

5. **Validate tokens server-side**
   - Never trust client-side token validation
   - Always verify signature and claims

6. **Handle token expiration gracefully**
   - Automatic refresh on 401
   - User-friendly error messages
   - Seamless re-authentication

## Future Enhancements

Potential improvements to consider:

1. **Multi-factor Authentication (MFA)**
   - TOTP support
   - SMS verification

2. **Session Management**
   - View active sessions
   - Revoke specific sessions
   - Device tracking

3. **Rate Limiting**
   - Prevent brute force attacks
   - Limit login attempts
   - Token refresh rate limiting

4. **Audit Logging**
   - Track authentication events
   - Log failed login attempts
   - Monitor suspicious activity

5. **Password Policies**
   - Minimum length requirements
   - Complexity requirements
   - Password expiration

6. **Social Login Expansion**
   - Facebook OAuth
   - Apple Sign-In
   - GitHub OAuth

