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
- `LayoutModel` - Layouts table (renamed from layouts in migration 006)
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
- `Layout.Config` - JSONB column
- `Layout.Tags` - Text array

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

## Invitation Storage

All wedding invitations are stored in the PostgreSQL database in the `invitations` table. The storage has been verified and tested:

- **Primary Storage**: PostgreSQL database (`invitations` table)
- **Data Format**: JSONB column stores invitation configuration data
- **Metadata**: Title and status are stored in `_meta` field within the JSON data
- **Timestamps**: `created_at` and `updated_at` are automatically managed

For detailed verification report, see [INVITATION_STORAGE_VERIFICATION.md](./INVITATION_STORAGE_VERIFICATION.md).

### Invitation Repository

The `InvitationRepository` provides full CRUD operations:
- `Create()` - Saves invitation to database
- `FindByID()` - Retrieves invitation by ID
- `FindByUserID()` - Retrieves all invitations for a user
- `Update()` - Updates invitation in database (preserves CreatedAt)
- `Delete()` - Removes invitation from database

All operations are tested. See `invitation_repository_test.go` for test coverage.

## Best Practices

1. Always use context for database operations
2. Handle "not found" as `nil, nil`
3. Map between domain and models properly
4. Use transactions for multi-step operations
5. Handle database errors appropriately
6. Keep models separate from domain entities
7. Preserve `CreatedAt` timestamp when updating entities
