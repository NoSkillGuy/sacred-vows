# Wedding Invitation Builder API - Go

A Go implementation of the wedding invitation builder API following Clean Architecture principles. This API provides endpoints for managing wedding invitations, templates, assets, RSVP responses, and analytics.

## Architecture

This project follows [Uncle Bob's Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), organizing code into four main layers:

1. **Entities (Domain Layer)**: Core business entities and rules
2. **Use Cases (Application Layer)**: Application-specific business logic
3. **Interface Adapters**: Controllers, presenters, repositories
4. **Frameworks & Drivers**: HTTP server, database, external services

### Project Structure

```
apps/api-go/
├── cmd/server/          # Application entry point
├── internal/
│   ├── domain/          # Business entities and rules
│   ├── usecase/         # Application business logic
│   ├── interfaces/      # HTTP handlers, middleware, repository interfaces
│   └── infrastructure/  # Database, auth, storage implementations
├── pkg/                 # Shared packages (errors, logger, validator)
└── migrations/          # Database migration files
```

## Features

- User authentication (JWT, Google OAuth)
  - User registration and login
  - Google OAuth flow (redirect and callback)
  - Google ID token verification (for frontend Sign-In button)
  - JWT token generation and validation
- Invitation CRUD operations
  - Create, read, update, delete invitations
  - Title and status field support (stored in JSON data)
  - Preview endpoint for public access
  - Optional authentication (supports anonymous users)
- Template management (file system based)
  - List templates with filtering (category, featured)
  - Get template manifests
  - Template catalog support
- Asset upload and management
  - File upload with validation
  - File type and size validation
  - Asset listing and deletion
- RSVP response handling
  - Submit RSVP responses
  - Retrieve RSVP responses by invitation
- Analytics tracking
  - Track invitation views
  - Retrieve analytics by invitation
- PostgreSQL database with GORM
- File storage with validation

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 15 or higher
- Make (optional, for using Makefile commands)

## Setup

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   cd apps/api-go
   go mod download
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**:
   ```bash
   # Using docker-compose (recommended)
   docker-compose up -d postgres
   
   # Or use your own PostgreSQL instance
   # Update DATABASE_URL in .env
   ```

5. **Run migrations**:
   The application will automatically run migrations on startup using GORM AutoMigrate.

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Server port (default: 3000)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI
- `FRONTEND_URL` - Frontend application URL
- `UPLOAD_PATH` - Path for file uploads (default: ./uploads)
- `LAYOUTS_DIR` - Path to layouts directory

## Running the Application

### Development

```bash
# Using Make
make run

# Or directly
go run cmd/server/main.go
```

### Production Build

```bash
# Build binary
make build

# Run binary
./bin/server
```

### Docker

```bash
# Build and run with docker-compose
docker-compose up api-go

# Or build Docker image
docker build -t api-go .
docker run -p 3000:3000 api-go
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/google/verify` - Verify Google ID token

### Invitations
- `GET /api/invitations` - List user invitations
- `GET /api/invitations/:id` - Get invitation
- `GET /api/invitations/:id/preview` - Get invitation preview
- `POST /api/invitations` - Create invitation
- `PUT /api/invitations/:id` - Update invitation
- `DELETE /api/invitations/:id` - Delete invitation

### Layouts
- `GET /api/layouts` - List layouts
- `GET /api/layouts/:id` - Get layout
- `GET /api/layouts/:id/manifest` - Get layout manifest
- `GET /api/layouts/manifests` - Get all manifests

### Assets
- `POST /api/assets/upload` - Upload asset
- `GET /api/assets` - List user assets
- `DELETE /api/assets/delete` - Delete asset

### RSVP
- `POST /api/rsvp/:invitationId` - Submit RSVP
- `GET /api/rsvp/:invitationId` - Get RSVP responses

### Analytics
- `POST /api/analytics/view` - Track view
- `GET /api/analytics/:invitationId` - Get analytics

### Health Check
- `GET /health` - Health check endpoint

## Development

### Code Structure

- **Domain Layer** (`internal/domain/`): Pure business logic, no dependencies on frameworks
- **Use Cases** (`internal/usecase/`): Application-specific business rules
- **Interfaces** (`internal/interfaces/`): HTTP handlers and repository interfaces
- **Infrastructure** (`internal/infrastructure/`): Database, auth, storage implementations

### Adding New Features

1. Define domain entities in `internal/domain/`
2. Create repository interfaces in `internal/interfaces/repository/`
3. Implement use cases in `internal/usecase/`
4. Implement repositories in `internal/infrastructure/database/postgres/`
5. Create HTTP handlers in `internal/interfaces/http/handlers/`
6. Register routes in `internal/interfaces/http/router.go`

### Testing

```bash
# Run tests
make test

# Or
go test ./...
```

### Database Migrations

Migrations are handled automatically by GORM AutoMigrate on startup. For manual migrations, see `migrations/README.md`.

## Dependencies

- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **JWT** - JSON Web Token authentication
- **OAuth2** - Google OAuth integration
- **Zap** - Structured logging
- **Bcrypt** - Password hashing

## Implementation Details

### Key Features

1. **Title and Status Fields**: Stored in the `_meta` field within the JSON `data` column, but returned as top-level fields in responses for compatibility.

2. **Google OAuth Verify**: Fully implemented using `google.golang.org/api/idtoken` for proper ID token verification.

3. **Database**: Uses PostgreSQL with GORM. The schema is automatically migrated on startup using GORM AutoMigrate.

## License

ISC
