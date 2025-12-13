# Error Handling Package

## Purpose

Provides custom error types and error handling utilities for consistent error responses across the application.

## Components

### AppError (`errors.go`)

Custom application error type that includes HTTP status code and error message.

**Structure:**
```go
type AppError struct {
    Code    int    // HTTP status code
    Message string // Error message
    Err     error  // Wrapped error (optional)
}
```

**Methods:**
- `Error()` - Implements error interface
- `Unwrap()` - Returns wrapped error
- `ToResponse()` - Converts to HTTP response format

### Predefined Errors

Common error constants:
- `ErrNotFound` - 404 Not Found
- `ErrBadRequest` - 400 Bad Request
- `ErrUnauthorized` - 401 Unauthorized
- `ErrForbidden` - 403 Forbidden
- `ErrInternalServerError` - 500 Internal Server Error
- `ErrConflict` - 409 Conflict

### Error Response

Standard error response format:
```go
type ErrorResponse struct {
    Error string `json:"error"`
}
```

## Usage

### Creating Errors

```go
// Simple error
err := errors.New(http.StatusBadRequest, "Invalid input")

// Wrapped error
err := errors.Wrap(http.StatusInternalServerError, "Database error", dbErr)

// Using predefined
return errors.ErrNotFound
```

### Handling Errors

```go
if err != nil {
    appErr, ok := err.(*errors.AppError)
    if ok {
        c.JSON(appErr.Code, appErr.ToResponse())
        return
    }
    // Handle non-AppError
}
```

## Error Flow

1. **Domain/Use Case**: Returns `*errors.AppError`
2. **Handler**: Converts to HTTP response
3. **Client**: Receives JSON error response

## Related Files

- Middleware: `internal/interfaces/http/middleware/error_middleware.go`
- Handlers: Use throughout handlers
- Use Cases: Return AppError for business errors

## Best Practices

1. Use AppError for all application errors
2. Include appropriate HTTP status codes
3. Wrap underlying errors when useful
4. Keep error messages user-friendly
5. Log detailed errors server-side
6. Use predefined errors for common cases
