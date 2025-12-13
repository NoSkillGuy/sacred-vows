# Database Migrations

## Purpose

Contains SQL migration files for database schema management. These migrations define the initial database structure and can be used for manual migrations or reference.

## Migration Files

### Initial Schema (`001_initial_schema`)

**Up Migration** (`001_initial_schema.up.sql`):
- Creates all tables (users, invitations, templates, assets, rsvp_responses, analytics)
- Creates indexes (unique email index)
- Creates foreign key constraints
- Uses IF NOT EXISTS for idempotency

**Down Migration** (`001_initial_schema.down.sql`):
- Drops all foreign keys
- Drops all indexes
- Drops all tables
- Uses IF EXISTS for safety

## Schema Overview

### Tables

1. **users** - User accounts
   - id (TEXT, PRIMARY KEY)
   - email (TEXT, UNIQUE)
   - name (TEXT, nullable)
   - password (TEXT)
   - timestamps

2. **invitations** - Wedding invitations
   - id (TEXT, PRIMARY KEY)
   - templateId (TEXT, default: 'royal-elegance')
   - data (JSONB)
   - userId (TEXT, FOREIGN KEY)
   - timestamps

3. **templates** - Template definitions
   - id (TEXT, PRIMARY KEY)
   - name, description, previewImage
   - tags (TEXT[])
   - version, config (JSONB)
   - isActive (BOOLEAN)
   - timestamps

4. **assets** - Uploaded files
   - id (TEXT, PRIMARY KEY)
   - url, filename, originalName
   - size (INTEGER)
   - mimetype
   - userId (TEXT, FOREIGN KEY)
   - createdAt

5. **rsvp_responses** - RSVP responses
   - id (TEXT, PRIMARY KEY)
   - invitationId (TEXT, FOREIGN KEY)
   - name, date (TEXT)
   - email, phone, message (nullable)
   - submittedAt

6. **analytics** - Analytics events
   - id (TEXT, PRIMARY KEY)
   - invitationId (TEXT, FOREIGN KEY)
   - type (TEXT)
   - referrer, userAgent, ipAddress (nullable)
   - timestamp

### Foreign Keys

- `invitations.userId` → `users.id` (CASCADE DELETE)
- `assets.userId` → `users.id` (CASCADE DELETE)
- `rsvp_responses.invitationId` → `invitations.id` (CASCADE DELETE)
- `analytics.invitationId` → `invitations.id` (CASCADE DELETE)

## Migration Tools

### GORM AutoMigrate (Current)

The application uses GORM AutoMigrate which automatically:
- Creates tables if they don't exist
- Adds missing columns
- Creates indexes
- Updates column types

**Note:** AutoMigrate doesn't handle all migration scenarios. For complex migrations, use SQL migration files.

### Manual Migrations

For manual migrations using tools like `golang-migrate`:

```bash
# Up migration
migrate -path migrations -database "$DATABASE_URL" up

# Down migration
migrate -path migrations -database "$DATABASE_URL" down
```

## Migration Strategy

1. **Development**: GORM AutoMigrate handles schema changes automatically
2. **Production**: Consider using migration tools for controlled deployments
3. **Version Control**: Keep migration files in version control
4. **Testing**: Test migrations on staging before production

## Schema Source

The schema is based on the Prisma schema from `apps/api/prisma/schema.prisma` and has been converted to PostgreSQL-compatible SQL.

## Related Files

- GORM Models: `internal/infrastructure/database/postgres/models.go`
- Prisma Schema: `apps/api/prisma/schema.prisma` (original source)

## Best Practices

1. Keep migrations idempotent (IF NOT EXISTS)
2. Test migrations on copy of production data
3. Backup database before migrations
4. Document breaking changes
5. Use transactions for multi-step migrations
6. Version migration files clearly
