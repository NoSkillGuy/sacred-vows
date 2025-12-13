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

### LayoutHandler (`layout_handler.go`)

Handles layout endpoints:
- `GetAll` - GET /api/layouts
- `GetManifests` - GET /api/layouts/manifests
- `GetManifest` - GET /api/layouts/:id/manifest
- `GetByID` - GET /api/layouts/:id

**Features:**
- Query parameter filtering (category, featured)
- File system layout loading
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

## Swagger Documentation

All handlers include Swagger/OpenAPI annotations for automatic API documentation generation. The annotations follow the swaggo/swag format.

### Annotation Format

Each handler method includes Swagger annotations in comments above the function:

```go
// HandlerMethodName handles the endpoint
// @Summary      Brief description
// @Description  Detailed description
// @Tags         tag-name
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Parameter description"
// @Param        body body      RequestModel true "Request body"
// @Success      200  {object}  ResponseModel "Success response"
// @Failure      400  {object}  ErrorResponse "Bad request"
// @Router       /api/endpoint/{id} [get]
func (h *Handler) HandlerMethod(c *gin.Context) {
    // Implementation
}
```

### Common Annotations

- `@Summary` - Brief one-line description of the endpoint
- `@Description` - Detailed description of what the endpoint does
- `@Tags` - Group endpoints (e.g., "auth", "invitations", "layouts")
- `@Accept` - Content types the endpoint accepts (json, multipart/form-data)
- `@Produce` - Content types the endpoint returns (json)
- `@Security` - Authentication requirement (BearerAuth for JWT)
- `@Param` - Request parameters (path, query, body, formData)
- `@Success` - Success response with status code, response type, and description
- `@Failure` - Error responses with status codes and error types
- `@Router` - Route path and HTTP method

### Response Models

Response models are defined as struct types in handler files with JSON tags and example values:

```go
type ResponseModel struct {
    ID    string `json:"id" example:"1234567890"`
    Name  string `json:"name" example:"Example Name"`
    Email string `json:"email" example:"user@example.com"`
}
```

### Generating Documentation

To generate Swagger documentation:

```bash
make swagger
```

This creates the `docs/` directory with:
- `swagger.json` - OpenAPI specification
- `swagger.yaml` - OpenAPI specification (YAML)
- `docs.go` - Generated Go code

### Accessing Documentation

Once generated and the server is running, access Swagger UI at:
- `http://localhost:3000/swagger/index.html`

### Authentication in Swagger

Endpoints requiring authentication use `@Security BearerAuth`. In Swagger UI:
1. Click "Authorize" button
2. Enter JWT token as: `Bearer <token>`
3. Click "Authorize" to authenticate

## Related Files

- Router: `internal/interfaces/http/router.go`
- Middleware: `internal/interfaces/http/middleware/`
- Use Cases: `internal/usecase/`
- Swagger Tests: `swagger_test.go`
