# Interface Adapters Layer

## Purpose

The interface adapters layer contains code that adapts data between the use cases and external frameworks (HTTP, database). It includes HTTP handlers, middleware, and repository interfaces.

## Responsibilities

- Handle HTTP requests and responses
- Map HTTP requests to use case inputs
- Map use case outputs to HTTP responses
- Define repository interfaces (contracts)
- Implement middleware for cross-cutting concerns
- Route HTTP requests to appropriate handlers

## Structure

```
interfaces/
├── http/              # HTTP layer
│   ├── handlers/      # Request handlers
│   ├── middleware/    # HTTP middleware
│   └── router.go      # Route definitions
└── repository/        # Repository interfaces
```

## Key Components

### HTTP Handlers (`http/handlers/`)

Convert HTTP requests to use case calls and format responses:
- `auth_handler.go` - Authentication endpoints
- `invitation_handler.go` - Invitation endpoints
- `template_handler.go` - Template endpoints
- `asset_handler.go` - Asset endpoints
- `rsvp_handler.go` - RSVP endpoints
- `analytics_handler.go` - Analytics endpoints

### HTTP Middleware (`http/middleware/`)

Handle cross-cutting concerns:
- `auth_middleware.go` - JWT authentication
- `cors_middleware.go` - CORS headers
- `error_middleware.go` - Error handling

### Router (`http/router.go`)

Defines all HTTP routes and applies middleware.

### Repository Interfaces (`repository/`)

Define contracts for data access:
- `user_repository.go`
- `invitation_repository.go`
- `template_repository.go`
- `asset_repository.go`
- `rsvp_repository.go`
- `analytics_repository.go`

## Dependencies

- **Use Cases**: Handlers call use cases
- **Domain**: Uses domain entities and errors
- **Gin Framework**: HTTP routing and middleware
- **Infrastructure**: Repository implementations (injected)

## Related Layers

- **Use Cases**: Handlers call use cases
- **Domain**: Uses domain entities for validation
- **Infrastructure**: Repository implementations fulfill interfaces

## Best Practices

1. Keep handlers thin - delegate to use cases
2. Handle HTTP concerns only (status codes, headers)
3. Validate request format, not business rules
4. Use middleware for reusable logic
5. Repository interfaces define contracts, not implementations
6. Return appropriate HTTP status codes
7. Handle errors consistently
