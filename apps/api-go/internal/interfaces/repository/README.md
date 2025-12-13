# Repository Interfaces

## Purpose

Repository interfaces define contracts for data access operations. They follow the Repository pattern, abstracting data persistence details from business logic.

## Responsibilities

- Define data access contracts
- Specify required operations for each entity
- Provide abstraction over data storage
- Enable testability through interfaces

## Key Principles

1. **Interface Segregation**: Each entity has its own repository interface
2. **Dependency Inversion**: Use cases depend on interfaces, not implementations
3. **Testability**: Easy to mock for testing
4. **Abstraction**: Hide database implementation details

## Repository Interfaces

### UserRepository (`user_repository.go`)

User data operations:
- `Create(ctx, user)` - Create new user
- `FindByID(ctx, id)` - Find user by ID
- `FindByEmail(ctx, email)` - Find user by email
- `Update(ctx, user)` - Update user
- `Delete(ctx, id)` - Delete user

### InvitationRepository (`invitation_repository.go`)

Invitation data operations:
- `Create(ctx, invitation)` - Create invitation
- `FindByID(ctx, id)` - Find by ID
- `FindByUserID(ctx, userID)` - Find all by user
- `Update(ctx, invitation)` - Update invitation
- `Delete(ctx, id)` - Delete invitation

### TemplateRepository (`template_repository.go`)

Template data operations for database-stored templates:
- `Create(ctx, template)` - Create template
- `FindByID(ctx, id)` - Find by ID
- `FindAll(ctx)` - Find all active templates
- `Update(ctx, template)` - Update template
- `Delete(ctx, id)` - Delete template

**Note:** Templates are stored in the database with both `manifest` and `config` as JSONB columns. Templates are loaded via SQL migration `003_load_templates.up.sql` which contains all template data embedded in the migration file.

### AssetRepository (`asset_repository.go`)

Asset data operations:
- `Create(ctx, asset)` - Create asset record
- `FindByID(ctx, id)` - Find by ID
- `FindByUserID(ctx, userID)` - Find all by user
- `FindByURL(ctx, url)` - Find by URL
- `Delete(ctx, id)` - Delete by ID
- `DeleteByURL(ctx, url)` - Delete by URL

### RSVPRepository (`rsvp_repository.go`)

RSVP data operations:
- `Create(ctx, rsvp)` - Create RSVP response
- `FindByInvitationID(ctx, invitationID)` - Find all by invitation
- `FindByID(ctx, id)` - Find by ID

### AnalyticsRepository (`analytics_repository.go`)

Analytics data operations:
- `Create(ctx, analytics)` - Create analytics event
- `FindByInvitationID(ctx, invitationID)` - Find all by invitation
- `CountByType(ctx, invitationID, type)` - Count events by type

## Interface Pattern

All repositories follow this pattern:

```go
type EntityRepository interface {
    Create(ctx context.Context, entity *domain.Entity) error
    FindByID(ctx context.Context, id string) (*domain.Entity, error)
    // ... other operations
}
```

## Context Usage

All methods accept `context.Context` for:
- Cancellation
- Timeouts
- Request tracing
- Database transaction context

## Return Values

- **Single Entity**: Returns `*domain.Entity` and `error`
- **Multiple Entities**: Returns `[]*domain.Entity` and `error`
- **Not Found**: Returns `nil, nil` (not an error)
- **Errors**: Returns `nil, error` for actual errors

## Dependencies

- **Domain Layer**: Uses domain entities
- **Context**: Standard Go context package

## Implementations

Repository interfaces are implemented in:
- `internal/infrastructure/database/postgres/` - PostgreSQL/GORM implementations

## Related Files

- Domain Entities: `internal/domain/`
- Use Cases: `internal/usecase/` (depend on these interfaces)
- Implementations: `internal/infrastructure/database/postgres/`

## Best Practices

1. Keep interfaces focused on one entity
2. Use domain entities, not DTOs
3. Accept context for all operations
4. Return domain entities, not database models
5. Handle "not found" as `nil, nil`, not an error
6. Keep interfaces small and focused
