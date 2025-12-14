# Database Migrations

## Purpose

Contains SQL migration files for database schema management. These migrations define the initial database structure and can be used for manual migrations or reference.

## Migration Files

### Initial Schema (`001_initial_schema`)

**Up Migration** (`001_initial_schema.up.sql`):
- Creates all tables (users, invitations, layouts, assets, rsvp_responses, analytics)
- Creates indexes (unique email index)
- Creates foreign key constraints
- Uses IF NOT EXISTS for idempotency

**Down Migration** (`001_initial_schema.down.sql`):
- Drops all foreign keys
- Drops all indexes
- Drops all tables
- Uses IF EXISTS for safety

### Add Layout Manifest (`002_add_layout_manifest`)

**Up Migration** (`002_add_layout_manifest.up.sql`):
- Adds `manifest` JSONB column to `layouts` table
- Allows storing layout manifest data separately from config
- Uses IF NOT EXISTS for idempotency

**Down Migration** (`002_add_layout_manifest.down.sql`):
- Removes `manifest` column from `layouts` table
- Uses IF EXISTS for safety

### Load Layouts (`003_load_layouts`)

**Up Migration** (`003_load_layouts.up.sql`):
- Data migration that loads all layouts into the database
- Contains all layout data embedded directly in the SQL file
- Inserts layouts into the `layouts` table with both manifest and config as JSONB
- Uses `ON CONFLICT DO NOTHING` for idempotency
- **This migration file is the source of truth for layouts**
- To add or modify layouts, edit this migration file directly
- The layouts folder (`apps/builder/layouts`) can be removed after this migration runs

**Down Migration** (`003_load_layouts.down.sql`):
- Removes all layouts from the database

### Rename Layout ID to Layout ID (`004_rename_layout_id_to_layout_id`)

**Up Migration** (`004_rename_layout_id_to_layout_id.up.sql`):
- Renames `layoutId` column to `layoutId` in `invitations` table
- This migration handles the schema change for the refactoring

**Down Migration** (`004_rename_layout_id_to_layout_id.down.sql`):
- Reverts the column rename back to `layoutId`

### Update Image Paths to Layouts (`005_update_image_paths_to_layouts`)

**Up Migration** (`005_update_image_paths_to_layouts.up.sql`):
- Updates image paths in JSON data from `/layouts/` to `/layouts/`
- Updates `preview_image` column
- Updates `previewImage` in both `config` and `manifest` JSONB columns
- This migration updates the data to reflect the new directory structure
- **Note**: This migration references the `layouts` table, which is renamed in migration 006

**Down Migration** (`005_update_image_paths_to_layouts.down.sql`):
- Reverts image paths from `/layouts/` back to `/layouts/`

### Rename Layouts Table to Layouts (`006_rename_layouts_table_to_layouts`)

**Up Migration** (`006_rename_layouts_table_to_layouts.up.sql`):
- Renames the `layouts` table to `layouts`
- This migration completes the refactoring from layouts to layouts terminology
- **Note**: This migration must run AFTER migration 005, which references the `layouts` table name

**Down Migration** (`006_rename_layouts_table_to_layouts.down.sql`):
- Reverts the table rename from `layouts` back to `layouts`

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
   - layoutId (TEXT, default: 'classic-scroll') - renamed to layoutId in migration 004
   - data (JSONB)
   - userId (TEXT, FOREIGN KEY)
   - timestamps

3. **layouts** - Layout definitions (table renamed from "layouts" to "layouts" in migration 006)
   - id (TEXT, PRIMARY KEY)
   - name, description, previewImage
   - tags (TEXT[])
   - version, config (JSONB), manifest (JSONB)
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

### Automatic Migration on Startup

The application automatically runs SQL migrations on startup:
1. **SQL Migrations**: Checks for pending migrations in the `migrations/` directory and runs them
2. **Data Migrations**: Special migrations (like `003_load_layouts`) contain SQL INSERT statements
3. **GORM AutoMigrate**: Runs after SQL migrations to ensure schema is up to date

**Migration Order:**
1. SQL migrations (from `migrations/*.sql` files)
   - Schema migrations (e.g., `002_add_layout_manifest`, `004_rename_layout_id_to_layout_id`)
   - Data migrations (e.g., `003_load_layouts`) - pure SQL INSERT statements
   - Data updates (e.g., `005_update_image_paths_to_layouts`) - UPDATE statements
   - Schema renames (e.g., `006_rename_layouts_table_to_layouts`) - ALTER TABLE statements
2. GORM AutoMigrate (ensures all models are synced)

**Data Migrations:**
- Migration `003_load_layouts` contains SQL INSERT statements for all layouts/layouts
- Layouts are embedded directly in the migration SQL file (source of truth)
- Layouts are loaded with both `manifest` and `config` as JSONB columns
- Migration is idempotent (uses `ON CONFLICT DO NOTHING`) and tracked in `schema_migrations` table
- To add or modify layouts, edit the migration file directly
- The layouts folder can be removed after migration runs

**Important Migration Principles:**
- **Never modify existing migrations** that have been run in production
- Always create new migrations for schema or data changes
- Migration files are immutable once applied
- Use new migrations to handle refactoring (e.g., migration 004 renames column, migration 005 updates paths, migration 006 renames table)

### GORM AutoMigrate

GORM AutoMigrate automatically:
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

The schema has been designed for PostgreSQL and is defined in the migration files and GORM models.

## Related Files

- GORM Models: `internal/infrastructure/database/postgres/models.go`
- Migration Files: `001_initial_schema.up.sql` and `001_initial_schema.down.sql`

## Best Practices

1. Keep migrations idempotent (IF NOT EXISTS)
2. Test migrations on copy of production data
3. Backup database before migrations
4. Document breaking changes
5. Use transactions for multi-step migrations
6. Version migration files clearly
