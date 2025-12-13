# Template Use Cases

## Purpose

Handles template operations including loading templates from the database, filtering, and manifest management. Templates are stored in the PostgreSQL database with both manifest and config as JSONB columns.

## Use Cases

### GetAllTemplatesUseCase (`get_all.go`)

Lists all available templates with optional filtering.

**Input:**
- `Category`: Optional category filter
- `Featured`: Optional featured filter

**Output:**
- `Templates`: Array of template summaries
- `Categories`: List of available categories

**Process:**
1. Query all active templates from database
2. Convert domain templates to DTOs using normalization helper
3. Apply filters (category, featured, status)
4. Return filtered templates and categories

### GetTemplateByIDUseCase (`get_by_id.go`)

Retrieves a single template by ID.

**Input:**
- `ID`: Template identifier

**Output:**
- `Template`: Template summary DTO

**Process:**
1. Query template by ID from database
2. Convert domain template to DTO using normalization helper
3. Return template summary or error if not found

### GetTemplateManifestUseCase (`get_manifest.go`)

Gets the full manifest for a specific template.

**Input:**
- `ID`: Template identifier

**Output:**
- `Manifest`: Full manifest as map

**Process:**
1. Query template by ID from database
2. Extract and normalize manifest JSON
3. Return full manifest data as map

### GetManifestsUseCase (`get_manifests.go`)

Gets manifests for all templates.

**Input:**
- None

**Output:**
- `Manifests`: Array of all template manifests

**Process:**
1. Query all active templates from database
2. Extract and normalize manifest JSON for each template
3. Filter to only ready templates
4. Return array of manifests

## Manifest Normalization

Templates are loaded from the database where manifest and config are stored as JSONB columns. The normalization process (in `normalize.go`):

- Parses manifest JSON from database
- Sets default theme if none specified
- Handles status (ready, coming-soon, hidden)
- Trims tags to maximum 3
- Sets default values for missing fields
- Ensures consistent structure

The `ToTemplateSummaryDTO` function converts `domain.Template` to `TemplateSummaryDTO`, and `ToManifestMap` converts to a full manifest map.

## DTOs (`dto.go`)

- `TemplateSummaryDTO`: Template summary with all fields

## Dependencies

- `TemplateRepository`: Database repository interface for template operations
- `encoding/json`: JSON parsing for manifest and config
- `normalize.go`: Shared normalization helper functions

## Database Schema

Templates are stored in the `templates` table with:
- `id`: Template identifier (primary key)
- `name`: Template name
- `description`: Optional description
- `previewImage`: Optional preview image URL
- `tags`: Array of tags (TEXT[])
- `version`: Template version
- `config`: Template config as JSONB (render defaults)
- `manifest`: Template manifest as JSONB (catalog metadata)
- `isActive`: Whether template is active
- `createdAt`, `updatedAt`: Timestamps

## Related Files

- Handler: `internal/interfaces/http/handlers/template_handler.go`
- Repository: `internal/infrastructure/database/postgres/template_repository.go`
- Domain: `internal/domain/template.go`
- Normalization: `internal/usecase/template/normalize.go`

## Migration

Templates are loaded into the database via SQL migration `003_load_templates.up.sql`. This migration contains all template data embedded directly in the SQL file as INSERT statements. The migration file is the source of truth for templates - to add or modify templates, edit the migration file directly. The templates folder can be removed after the migration runs.
