# HTTP Middleware

## Purpose

Middleware functions handle cross-cutting concerns for HTTP requests, such as authentication, CORS, error handling, and logging.

## Responsibilities

- Authenticate requests using JWT tokens
- Handle CORS headers
- Process errors consistently
- Add logging context
- Extract and set user context

## Middleware Functions

### AuthenticateToken (`auth_middleware.go`)

Validates JWT tokens and extracts user context.

**Functionality:**
- Reads Authorization header
- Validates Bearer token
- Extracts user ID and email from claims
- Sets user context in Gin context
- Returns 401 if token is missing or invalid
- Returns 403 if token is expired

**Usage:**
```go
router.GET("/protected", middleware.AuthenticateToken(jwtService), handler.ProtectedRoute)
```

**Sets Context:**
- `userID`: User identifier
- `email`: User email

### OptionalAuth (`auth_middleware.go`)

Optionally authenticates requests - attaches user if token is present but doesn't require it.

**Functionality:**
- Attempts to read and validate token
- Sets user context if token is valid
- Continues regardless of token presence

**Usage:**
```go
router.GET("/optional", middleware.OptionalAuth(jwtService), handler.OptionalRoute)
```

**Use Cases:**
- Routes that work for both authenticated and anonymous users
- Invitation previews
- Public content with optional personalization

### CORS (`cors_middleware.go`)

Handles Cross-Origin Resource Sharing headers.

**Functionality:**
- Sets CORS headers for all requests
- Handles preflight OPTIONS requests
- Allows all origins (configure for production)
- Sets allowed methods and headers

**Headers Set:**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS, GET, PUT, DELETE, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Authorization, etc.`

**Usage:**
Applied globally in router setup.

### ErrorHandler (`error_middleware.go`)

Processes errors from handlers and formats consistent error responses.

**Functionality:**
- Catches errors from handlers
- Converts AppError to HTTP response
- Returns appropriate status codes
- Formats error messages consistently

**Usage:**
Applied globally in router setup.

## Middleware Order

Middleware is applied in this order:
1. **Recovery** (Gin built-in) - Panic recovery
2. **CORS** - Cross-origin headers
3. **Error Handler** - Error processing
4. **Logger** - Request logging
5. **Route-specific** - Authentication, etc.

## Dependencies

- **Gin Framework**: HTTP context and middleware chain
- **JWT Service**: Token validation (`internal/infrastructure/auth/jwt.go`)
- **Error Package**: Error types (`pkg/errors/`)

## Related Files

- Router: `internal/interfaces/http/router.go`
- JWT Service: `internal/infrastructure/auth/jwt.go`
- Error Types: `pkg/errors/errors.go`

## Best Practices

1. Keep middleware focused on one concern
2. Use context for passing data between middleware
3. Return early on errors
4. Don't modify request body in middleware
5. Set appropriate status codes
6. Log important events
