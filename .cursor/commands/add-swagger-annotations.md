When the user invokes `/add-swagger-annotations`, analyze the selected handler method and add comprehensive Swagger/OpenAPI annotations following the project's patterns.

### Context Understanding

1. **Identify the handler method**: Look for a function in `apps/api-go/internal/interfaces/http/handlers/` that handles HTTP requests
2. **Analyze the method signature**: Determine:
   - HTTP method (GET, POST, PUT, DELETE, etc.)
   - Route path (check router.go or method name)
   - Request parameters (path, query, body)
   - Response types
   - Authentication requirements
   - Error responses

### Annotation Pattern

Follow this structure for all handler methods:

```go
// MethodName handles the endpoint description
// @Summary      Brief one-line summary (max 50 chars)
// @Description  Detailed description of what the endpoint does. Include authentication requirements, special behavior, etc.
// @Tags         tag-name (lowercase, plural: auth, invitations, assets, layouts, rsvp, analytics)
// @Accept       json | multipart/form-data | json (based on request type)
// @Produce      json
// @Security     BearerAuth (if authentication required, omit if public)
// @Param        paramName  path|query|formData|body  type  required  "Description"  example:"value"
// @Success      statusCode  {object}  ResponseType  "Success description"
// @Failure      statusCode  {object}  ErrorResponse  "Error description"
// @Router       /api/path/to/endpoint [method]
```

### Detailed Rules

#### 1. Summary (@Summary)
- Keep it concise (one line, ~50 characters max)
- Use present tense, action-oriented
- Examples:
  - "Register a new user"
  - "Get invitation by ID"
  - "Upload asset file"
  - "Delete invitation"

#### 2. Description (@Description)
- Provide detailed explanation (2-3 sentences)
- Mention authentication requirements explicitly
- Note any special behavior (e.g., "No authentication required", "Supports optional authentication")
- Include important details about the operation
- Examples:
  - "Register a new user with email and password. Returns JWT token and user information."
  - "Get a public preview of an invitation by ID. No authentication required."
  - "Upload a new asset file (image). Authentication is required."

#### 3. Tags (@Tags)
- Use lowercase, plural nouns
- Match the handler's domain area
- Common tags: `auth`, `invitations`, `assets`, `layouts`, `rsvp`, `analytics`, `publish`
- One tag per endpoint

#### 4. Accept (@Accept)
- `json` - for JSON request bodies
- `multipart/form-data` - for file uploads
- `json` - default for most endpoints

#### 5. Produce (@Produce)
- Always `json` for this API

#### 6. Security (@Security)
- Include `@Security BearerAuth` if the endpoint requires authentication
- Omit if the endpoint is public
- Check the handler code for `c.Get("userID")` or middleware usage
- For optional auth, omit `@Security` but mention in description

#### 7. Parameters (@Param)
Format: `@Param name location type required "description" example:"value"`

**Location types:**
- `path` - URL path parameters (e.g., `:id`)
- `query` - Query string parameters
- `body` - Request body (use request struct name)
- `formData` - Form data fields (for multipart)

**Type examples:**
- `string` - for strings
- `int` - for integers
- `file` - for file uploads
- `RequestStructName` - for request bodies

**Required:**
- `true` - if parameter is required
- `false` - if optional

**Examples:**
```go
// Path parameter
// @Param        id   path      string  true  "Invitation ID"

// Query parameter
// @Param        category  query     string  false  "Layout category filter"

// Body parameter
// @Param        request  body      RegisterRequest  true  "Registration request"

// Form data
// @Param        image  formData  file    true  "Image file to upload"
```

#### 8. Success Responses (@Success)
Format: `@Success statusCode {object} ResponseType "Description"`

**Status codes:**
- `200` - OK (GET, PUT, DELETE)
- `201` - Created (POST for creation)
- `200` - OK (POST for other operations)

**Response types:**
- Use the actual response struct name (e.g., `AuthResponse`, `InvitationResponse`, `AssetsResponse`)
- For simple responses, use `object` with description

**Examples:**
```go
// @Success      200  {object}  InvitationsResponse  "List of invitations"
// @Success      201  {object}  AuthResponse         "User registered successfully"
// @Success      200  {object}  MessageResponse      "Asset deleted"
```

#### 9. Failure Responses (@Failure)
Include all possible error scenarios:
- `400` - Bad Request (validation errors, missing required fields)
- `401` - Unauthorized (authentication required, invalid token)
- `403` - Forbidden (authorization failed)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error (server errors)

Format: `@Failure statusCode {object} ErrorResponse "Description"`

**Examples:**
```go
// @Failure      400  {object}  ErrorResponse  "Invalid request"
// @Failure      401  {object}  ErrorResponse  "Authentication required"
// @Failure      404  {object}  ErrorResponse  "Invitation not found"
// @Failure      409  {object}  ErrorResponse  "User already exists"
// @Failure      500  {object}  ErrorResponse  "Internal server error"
```

#### 10. Router (@Router)
Format: `@Router /api/path/to/endpoint [method]`

- Use the actual route path from `router.go`
- Include `/api` prefix
- Use lowercase HTTP method: `[get]`, `[post]`, `[put]`, `[delete]`
- Include path parameters in curly braces: `/invitations/{id}/preview`

**Examples:**
```go
// @Router       /auth/register [post]
// @Router       /invitations [get]
// @Router       /invitations/{id} [get]
// @Router       /assets/upload [post]
```

### Common Patterns by HTTP Method

#### GET Endpoints
```go
// @Summary      Get resource by ID
// @Description  Get a specific resource by its ID. Authentication is required.
// @Tags         resources
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Resource ID"
// @Success      200  {object}  ResourceResponse  "Resource details"
// @Failure      401  {object}  ErrorResponse     "Authentication required"
// @Failure      404  {object}  ErrorResponse     "Resource not found"
// @Failure      500  {object}  ErrorResponse     "Internal server error"
// @Router       /resources/{id} [get]
```

#### POST Endpoints (Creation)
```go
// @Summary      Create resource
// @Description  Create a new resource. Authentication is required.
// @Tags         resources
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      CreateResourceRequest  true  "Resource data"
// @Success      201      {object}  ResourceResponse       "Resource created successfully"
// @Failure      400      {object}  ErrorResponse          "Invalid request"
// @Failure      401      {object}  ErrorResponse          "Authentication required"
// @Failure      409      {object}  ErrorResponse          "Resource already exists"
// @Failure      500      {object}  ErrorResponse         "Internal server error"
// @Router       /resources [post]
```

#### PUT Endpoints
```go
// @Summary      Update resource
// @Description  Update an existing resource. Authentication is required.
// @Tags         resources
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                 true  "Resource ID"
// @Param        request  body      UpdateResourceRequest  true  "Updated resource data"
// @Success      200      {object}  ResourceResponse       "Resource updated successfully"
// @Failure      400      {object}  ErrorResponse         "Invalid request"
// @Failure      401      {object}  ErrorResponse         "Authentication required"
// @Failure      404      {object}  ErrorResponse         "Resource not found"
// @Failure      500      {object}  ErrorResponse         "Internal server error"
// @Router       /resources/{id} [put]
```

#### DELETE Endpoints
```go
// @Summary      Delete resource
// @Description  Delete a resource by ID. Authentication is required.
// @Tags         resources
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Resource ID"
// @Success      200  {object}  MessageResponse  "Resource deleted successfully"
// @Failure      401  {object}  ErrorResponse    "Authentication required"
// @Failure      404  {object}  ErrorResponse    "Resource not found"
// @Failure      500  {object}  ErrorResponse     "Internal server error"
// @Router       /resources/{id} [delete]
```

#### File Upload Endpoints
```go
// @Summary      Upload asset
// @Description  Upload a new asset file (image). Authentication is required.
// @Tags         assets
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        image  formData  file    true  "Image file to upload"
// @Success      200    {object}  UploadAssetResponse  "Asset uploaded successfully"
// @Failure      400    {object}  ErrorResponse        "Invalid file or request"
// @Failure      401    {object}  ErrorResponse        "Authentication required"
// @Failure      500    {object}  ErrorResponse        "Internal server error"
// @Router       /assets/upload [post]
```

### Implementation Steps

1. **Read the handler method**:
   - Identify function name and signature
   - Check for request structs (usually defined above the handler)
   - Check for response structs
   - Identify path parameters from `c.Param()`
   - Identify query parameters from `c.Query()`
   - Check authentication requirements

2. **Check router.go**:
   - Find the actual route path
   - Verify HTTP method
   - Check middleware (auth, optional auth, etc.)

3. **Analyze error handling**:
   - Review all `c.JSON()` calls to identify status codes
   - Map status codes to error scenarios

4. **Generate annotations**:
   - Place annotations directly above the function declaration
   - Follow the exact format shown in examples
   - Ensure all fields are properly aligned
   - Use consistent spacing (2 spaces for alignment)

5. **Verify**:
   - All parameters are documented
   - All success/error responses are documented
   - Route path matches router.go
   - Tag matches the handler's domain area

### Example: Complete Annotation

```go
// Register registers a new user
// @Summary      Register a new user
// @Description  Register a new user with email and password. Returns JWT token and user information.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      RegisterRequest  true  "Registration request"
// @Success      201      {object}  AuthResponse     "User registered successfully"
// @Failure      400      {object}  ErrorResponse    "Invalid request"
// @Failure      409      {object}  ErrorResponse    "User already exists"
// @Failure      500      {object}  ErrorResponse    "Internal server error"
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
    // ... implementation
}
```

### Notes

- Always place annotations immediately before the function declaration
- Use consistent spacing and alignment for readability
- Reference existing handler files for pattern consistency
- After adding annotations, run `make swagger` (or `swag init`) to regenerate documentation
- Verify the annotations work by checking Swagger UI at `/swagger/index.html`

