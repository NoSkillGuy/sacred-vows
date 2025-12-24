# API Server (Go)

The API server is a Go backend that provides REST endpoints for managing invitations, authentication, assets, and publishing operations.

## Features

- User authentication (JWT, Google OAuth)
- Invitation CRUD operations
- Asset upload and management
- Layout management
- Publishing workflow
- RSVP tracking
- Analytics

## Documentation

- [Environment Setup](./env-setup.md) - Environment configuration for local and Docker development

## API Documentation

- Swagger documentation is available at `/swagger/index.html` when the server is running
- API endpoints are documented in the Swagger UI

## Quick Start

1. Set up environment variables (see [Environment Setup](./env-setup.md))
2. Install dependencies: `go mod download`
3. Run the server: `go run cmd/server/main.go`
4. API available at http://localhost:3000

## Related Documentation

- [Local Development Guide](../../getting-started/local-development.md) - Complete local setup
- [Architecture Overview](../../architecture/README.md) - System architecture
- [Authentication System](../../architecture/authentication.md) - Auth implementation details

