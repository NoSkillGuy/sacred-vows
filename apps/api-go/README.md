# Wedding Invitation Builder API - Go

A Go implementation of the wedding invitation builder API following Clean Architecture principles. This API provides endpoints for managing wedding invitations, layouts, assets, RSVP responses, and analytics.

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
- Layout management (file system based)
  - List layouts with filtering (category, featured)
  - Get layout manifests
  - Layout catalog support
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
- Firestore database
- File storage with validation

## Prerequisites

- Go 1.21 or higher
- Google Cloud SDK (for Firestore emulator, optional for local development)
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
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**:

   **Using Firestore Emulator (recommended for local development)**
   ```bash
   # Start Firestore emulator
   gcloud beta emulators firestore start --host-port=localhost:8080
   
   # Or use docker-compose which includes the emulator
   docker-compose up -d firestore-emulator
   
   # Set environment variables in .env:
   # GCP_PROJECT_ID=test-project
   # FIRESTORE_DATABASE=(default)
   # FIRESTORE_EMULATOR_HOST=localhost:8080
   ```

   **Or connect to real Firestore instance**
   ```bash
   # Authenticate with GCP
   gcloud auth application-default login
   
   # Set environment variables in .env:
   # GCP_PROJECT_ID=your-project-id
   # FIRESTORE_DATABASE=(default)
   ```

5. **Run migrations**:
   The application will automatically run Firestore migrations on startup (see Database Migrations section)

## Configuration

Configuration is managed through a combination of **YAML config files** (for non-sensitive settings) and **environment variables** (for sensitive data).

### Configuration Files

Non-sensitive configuration is stored in environment-specific YAML files:
- `config/local.yaml` - Local development defaults
- `config/dev.yaml` - Dev environment
- `config/prod.yaml` - Production environment

The environment is determined by the `APP_ENV` environment variable (defaults to `local`).

### Environment Variables

See `env.example` for all required **sensitive** environment variables. Non-sensitive settings should be configured in the YAML files.

**Required Sensitive Variables:**
- `APP_ENV` - Environment name: `local`, `dev`, or `prod` (defaults to `local`)
- `GCP_PROJECT_ID` - Google Cloud Project ID (required)
- `JWT_SECRET` - Secret key for JWT token signing (required)
- `REFRESH_TOKEN_HMAC_KEYS` - JSON array of HMAC keys for refresh tokens (required)
- `REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID` - Active HMAC key ID (required)

**Optional Sensitive Variables:**
- `FIRESTORE_DATABASE` - Firestore database name (default: `(default)`)
- `FIRESTORE_EMULATOR_HOST` - Firestore emulator host (e.g., `localhost:8080`) for local development
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MAILJET_API_KEY` - Mailjet API key
- `MAILJET_SECRET_KEY` - Mailjet secret key
- `MAILGUN_API_KEY` - Mailgun API key
- `R2_ACCESS_KEY_ID` - R2 access key ID
- `R2_SECRET_ACCESS_KEY` - R2 secret access key

**Note:** Non-sensitive settings like `PORT`, `FRONTEND_URL`, `EMAIL_VENDORS`, email limits, etc. are configured in the YAML files. Environment variables can override YAML values if needed.

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

### Swagger Documentation
- `GET /swagger/index.html` - Swagger UI interface

## Swagger Documentation

The API includes comprehensive Swagger/OpenAPI documentation that can be accessed via the Swagger UI.

### Generating Swagger Documentation

To generate or update the Swagger documentation:

```bash
# Using Make
make swagger

# Or directly
swag init -g cmd/server/main.go -o docs
```

This command scans the codebase for Swagger annotations and generates:
- `docs/swagger.json` - OpenAPI specification in JSON format
- `docs/swagger.yaml` - OpenAPI specification in YAML format
- `docs/docs.go` - Go code containing the documentation

### Accessing Swagger UI

Once the server is running, access the Swagger UI at:
- **URL**: `http://localhost:3000/swagger/index.html`

The Swagger UI provides:
- Interactive API documentation
- Try-it-out functionality for all endpoints
- Request/response schema definitions
- Authentication support (JWT Bearer token)

### Swagger Annotations

All API endpoints are documented using Swagger annotations in the handler files:
- `@Summary` - Brief endpoint description
- `@Description` - Detailed endpoint description
- `@Tags` - Endpoint grouping
- `@Param` - Request parameters (path, query, body)
- `@Success` - Success response codes and schemas
- `@Failure` - Error response codes and schemas
- `@Security` - Authentication requirements
- `@Router` - Route path and HTTP method

### Authentication in Swagger

The Swagger UI supports JWT Bearer token authentication:
1. Click the "Authorize" button in Swagger UI
2. Enter your JWT token in the format: `Bearer <your-token>`
3. Click "Authorize" to authenticate
4. All authenticated requests will include the token in the Authorization header

### Updating Documentation

When adding new endpoints or modifying existing ones:
1. Add or update Swagger annotations in the handler file
2. Run `make swagger` to regenerate documentation
3. Restart the server to see changes in Swagger UI

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
4. Implement repositories in `internal/infrastructure/database/firestore/`
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

Firestore migrations run automatically on startup:
- All 12 migrations are executed sequentially
- Migrations are tracked in the `schema_migrations` collection
- Migrations are idempotent (safe to run multiple times)

**Verifying Firestore Migrations Locally:**

1. **Start Firestore Emulator:**
   ```bash
   gcloud beta emulators firestore start --host-port=localhost:8080
   ```

2. **Configure Environment:**
   ```bash
   # In apps/api-go/.env
   GCP_PROJECT_ID=test-project
   FIRESTORE_DATABASE=(default)
   FIRESTORE_EMULATOR_HOST=localhost:8080
   ```

3. **Run the Application:**
   ```bash
   go run cmd/server/main.go
   ```

4. **Check Migration Logs:**
   Look for log messages indicating migrations:
   - `"Running migration"` - Shows which migration is executing
   - `"Migration already applied"` - Shows migrations that were skipped
   - `"Migration completed"` - Confirms successful migration

5. **Verify in Firestore:**
   - Check that `schema_migrations` collection exists with 12 documents (versions 1-12)
   - Verify collections were created: `users`, `invitations`, `layouts`, `assets`, `rsvp_responses`, `analytics`, `refresh_tokens`, `published_sites`
   - Check `layouts` collection contains `classic-scroll` and `editorial-elegance` documents

**Using Real Firestore (instead of emulator):**
```bash
# Authenticate with GCP
gcloud auth application-default login

# Set environment variables
export GCP_PROJECT_ID=your-project-id
export FIRESTORE_DATABASE=(default)
```

**Migration Behavior:**
- Migrations run sequentially and validate version order
- If a migration fails, the application logs an error but continues startup
- Running migrations multiple times is safe (idempotent)
- Migration status is persisted in Firestore `schema_migrations` collection

## Dependencies

- **Gin** - HTTP web framework
- **Firestore** - Google Cloud Firestore database
- **JWT** - JSON Web Token authentication
- **OAuth2** - Google OAuth integration
- **Zap** - Structured logging
- **Bcrypt** - Password hashing
- **Swagger** - API documentation (swaggo/swag, gin-swagger)

## Implementation Details

### Key Features

1. **Title and Status Fields**: Stored in the `_meta` field within the JSON `data` column, but returned as top-level fields in responses for compatibility.

2. **Google OAuth Verify**: Fully implemented using `google.golang.org/api/idtoken` for proper ID token verification.

3. **Database**: Uses Firestore with Go-based migrations. Migrations run automatically on startup and are tracked in the `schema_migrations` collection.

4. **Invitation Storage**: All wedding invitations are stored in Firestore in the `invitations` collection.

## License

ISC
