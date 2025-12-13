# HTTP Handlers

## Purpose

HTTP handlers convert HTTP requests into use case calls and format responses. They handle HTTP-specific concerns like status codes, headers, and request/response formatting.

## Responsibilities

- Parse HTTP requests
- Validate request format
- Call appropriate use cases
- Format responses
- Handle errors and return appropriate status codes
- Extract user context from authentication

## Handlers

### AuthHandler (`auth_handler.go`)

Handles authentication endpoints:
- `Register` - POST /api/auth/register
- `Login` - POST /api/auth/login
- `GetCurrentUser` - GET /api/auth/me
- `GoogleOAuth` - GET /api/auth/google
- `GoogleCallback` - GET /api/auth/google/callback
- `GoogleVerify` - POST /api/auth/google/verify

**Features:**
- JWT token generation after successful auth
- OAuth redirect handling
- User context extraction

### InvitationHandler (`invitation_handler.go`)

Handles invitation endpoints:
- `GetAll` - GET /api/invitations
- `GetPreview` - GET /api/invitations/:id/preview
- `GetByID` - GET /api/invitations/:id
- `Create` - POST /api/invitations
- `Update` - PUT /api/invitations/:id
- `Delete` - DELETE /api/invitations/:id

**Features:**
- Optional authentication (supports anonymous)
- JSON data handling
- User ID extraction from context

### TemplateHandler (`template_handler.go`)

Handles template endpoints:
- `GetAll` - GET /api/templates
- `GetManifests` - GET /api/templates/manifests
- `GetManifest` - GET /api/templates/:id/manifest
- `GetByID` - GET /api/templates/:id

**Features:**
- Query parameter filtering (category, featured)
- File system template loading
- Manifest normalization

### AssetHandler (`asset_handler.go`)

Handles asset endpoints:
- `Upload` - POST /api/assets/upload
- `GetAll` - GET /api/assets
- `Delete` - DELETE /api/assets/delete

**Features:**
- Multipart form file upload
- File validation
- Storage integration

### RSVPHandler (`rsvp_handler.go`)

Handles RSVP endpoints:
- `Submit` - POST /api/rsvp/:invitationId
- `GetByInvitation` - GET /api/rsvp/:invitationId

**Features:**
- Public endpoints (no auth required)
- JSON request/response

### AnalyticsHandler (`analytics_handler.go`)

Handles analytics endpoints:
- `TrackView` - POST /api/analytics/view
- `GetByInvitation` - GET /api/analytics/:invitationId

**Features:**
- IP address extraction
- Event tracking
- Aggregated statistics

## Handler Pattern

All handlers follow this pattern:

```go
type HandlerName struct {
    useCaseUC *usecase.UseCaseName
    // ... other dependencies
}

func (h *HandlerName) HandlerMethod(c *gin.Context) {
    // 1. Parse request
    // 2. Call use case
    // 3. Format response
    // 4. Handle errors
}
```

## Error Handling

Handlers convert use case errors to HTTP responses:

```go
if err != nil {
    appErr, ok := err.(*errors.AppError)
    if ok {
        c.JSON(appErr.Code, appErr.ToResponse())
        return
    }
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
}
```

## Authentication

Handlers extract user context from middleware:

```go
userID, exists := c.Get("userID")
if !exists {
    c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
    return
}
```

## Dependencies

- **Gin Framework**: HTTP routing and context
- **Use Cases**: Business logic execution
- **Domain Errors**: Error types
- **Middleware**: Authentication, CORS, error handling

## Related Files

- Router: `internal/interfaces/http/router.go`
- Middleware: `internal/interfaces/http/middleware/`
- Use Cases: `internal/usecase/`
