# Logging Package

## Purpose

Provides structured logging using Zap logger with Gin middleware integration.

## Components

### Logger (`logger.go`)

Structured logger with development and production configurations.

**Features:**
- Development mode with colored output
- Production mode with JSON output
- ISO8601 timestamp format
- Request logging middleware for Gin

**Initialization:**
```go
err := logger.Init()
defer logger.GetLogger().Sync()
```

**Configuration:**
- Development: Colored console output (when GIN_MODE=debug)
- Production: JSON output for log aggregation
- Timestamps: ISO8601 format

### Gin Middleware

`GinLogger()` provides request logging middleware:

**Logs:**
- HTTP method
- Request path
- Query parameters
- Status code
- Response latency
- Client IP
- User agent

**Usage:**
```go
router.Use(logger.GinLogger())
```

## Log Levels

Zap log levels:
- `Debug` - Detailed debugging information
- `Info` - General informational messages
- `Warn` - Warning messages
- `Error` - Error messages
- `Fatal` - Fatal errors (exits application)

## Usage Examples

### Basic Logging

```go
logger.GetLogger().Info("Server started", zap.String("port", "3000"))
logger.GetLogger().Error("Database error", zap.Error(err))
```

### Structured Logging

```go
logger.GetLogger().Info("User created",
    zap.String("userID", userID),
    zap.String("email", email),
)
```

### In Handlers

```go
logger.GetLogger().Error("Failed to process request",
    zap.String("handler", "InvitationHandler"),
    zap.String("method", "Create"),
    zap.Error(err),
)
```

## Dependencies

- **go.uber.org/zap**: Structured logging library
- **Gin Framework**: For middleware integration

## Configuration

Environment variable:
- `GIN_MODE`: Set to "debug" for development mode

## Related Files

- Router: `internal/interfaces/http/router.go` (uses middleware)
- Main: `cmd/server/main.go` (initializes logger)

## Best Practices

1. Use structured logging with fields
2. Include context in log messages
3. Use appropriate log levels
4. Don't log sensitive information
5. Use error logging for exceptions
6. Sync logger on shutdown
