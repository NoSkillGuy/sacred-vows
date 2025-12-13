# PostgreSQL Database Implementation

## Purpose

Provides PostgreSQL database implementation using GORM. Implements all repository interfaces and handles database operations.

## Responsibilities

- Manage database connections
- Implement repository interfaces
- Map domain entities to database models
- Handle database migrations
- Manage connection pooling

## Key Components

### Database Connection (`postgres.go`)

- `New()` - Creates database connection
- `Close()` - Closes connection
- `AutoMigrate()` - Runs schema migrations

**Features:**
- Connection pooling configuration
- Health checks
- Context support

### GORM Models (`models.go`)

Database models that map to PostgreSQL tables:
- `UserModel` - Users table
- `InvitationModel` - Invitations table
- `LayoutModel` - Layouts table (table name kept as templates for backward compatibility)
- `AssetModel` - Assets table
- `RSVPResponseModel` - RSVP responses table
- `AnalyticsModel` - Analytics table

**Features:**
- GORM tags for table mapping
- JSON field support (datatypes.JSON)
- Array field support (PostgreSQL arrays)
- Timestamps (CreatedAt, UpdatedAt)

### Repository Implementations

Each repository interface has a corresponding implementation:
- `user_repository.go` - UserRepository implementation
- `invitation_repository.go` - InvitationRepository implementation
- `asset_repository.go` - AssetRepository implementation
- `rsvp_repository.go` - RSVPRepository implementation
- `analytics_repository.go` - AnalyticsRepository implementation

## Mapping Domain to Database

Repositories convert between:
- **Domain Entities** (`internal/domain/`) - Business objects
- **Database Models** (GORM models) - Database representation

**Example:**
```go
// Domain entity
domain.User

// Database model
UserModel

// Conversion functions
toUserDomain(model) -> *domain.User
```

## JSON Fields

Handles JSON fields using GORM's `datatypes.JSON`:
- `Invitation.Data` - JSONB column
- `Template.Config` - JSONB column
- `Template.Tags` - Text array

## Migrations

Migrations are handled by GORM AutoMigrate:
- Automatically creates/updates tables
- Handles schema changes
- Runs on application startup

**Manual Migrations:**
SQL migration files are in `migrations/` directory for reference.

## Connection Pooling

Configured in `postgres.go`:
- Max open connections
- Max idle connections
- Connection max lifetime

## Dependencies

- **GORM**: ORM framework
- **PostgreSQL Driver**: GORM PostgreSQL driver
- **Domain Entities**: For mapping
- **Repository Interfaces**: Implements these

## Related Files

- Repository Interfaces: `internal/interfaces/repository/`
- Domain Entities: `internal/domain/`
- Migrations: `migrations/`

## Best Practices

1. Always use context for database operations
2. Handle "not found" as `nil, nil`
3. Map between domain and models properly
4. Use transactions for multi-step operations
5. Handle database errors appropriately
6. Keep models separate from domain entities
