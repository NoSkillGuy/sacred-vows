# Layout Use Cases

## Purpose

Handles layout operations including loading layouts from the database, filtering, and manifest management. Layouts are stored in the PostgreSQL database with both manifest and config as JSONB columns.

## Use Cases

### GetAllLayoutsUseCase (`get_all.go`)

Lists all available layouts with optional filtering.

**Input:**
- `Category`: Optional category filter
- `Featured`: Optional featured filter

**Output:**
- `Layouts`: Array of layout summaries
- `Categories`: List of available categories

**Process:**
1. Query all active layouts from database
2. Convert domain layouts to DTOs using normalization helper
3. Apply filters (category, featured, status)
4. Return filtered layouts and categories

### GetLayoutByIDUseCase (`get_by_id.go`)

Retrieves a single layout by ID.

**Input:**
- `ID`: Layout identifier

**Output:**
- `Layout`: Layout summary DTO

**Process:**
1. Query layout by ID from database
2. Convert domain layout to DTO using normalization helper
3. Return layout summary or error if not found

### GetLayoutManifestUseCase (`get_manifest.go`)

Gets the full manifest for a specific layout.

**Input:**
- `ID`: Layout identifier

**Output:**
- `Manifest`: Full manifest as map

**Process:**
1. Query layout by ID from database
2. Extract and normalize manifest JSON
3. Return full manifest data as map

### GetManifestsUseCase (`get_manifests.go`)

Gets manifests for all layouts.

**Input:**
- None

**Output:**
- `Manifests`: Array of all layout manifests

**Process:**
1. Query all active layouts from database
2. Extract and normalize manifest JSON for each layout
3. Filter to only ready layouts
4. Return array of manifests

## Manifest Normalization

Layouts are loaded from the database where manifest and config are stored as JSONB columns. The normalization process (in `normalize.go`):

- Parses manifest JSON from database
- Sets default theme if none specified
- Handles status (ready, coming-soon, hidden)
- Trims tags to maximum 3
- Extracts category, featured status, and other metadata

The `ToLayoutSummaryDTO` function converts `domain.Layout` to `LayoutSummaryDTO`, and `ToManifestMap` converts to a full manifest map.

## Dependencies

- `LayoutSummaryDTO`: Layout summary with all fields
- `GetAllLayoutsInput`, `GetAllLayoutsOutput`: Input/output structs
- `LayoutRepository`: Database repository interface for layout operations

## Database Schema

Layouts are stored in the `layouts` table (renamed from `templates` in migration 006) with:
- `id`: Layout identifier (primary key)
- `name`: Layout name
- `description`: Layout description
- `previewImage`: Preview image URL
- `tags`: Array of tags
- `version`: Layout version
- `config`: Layout config as JSONB (render defaults)
- `manifest`: Layout manifest as JSONB (catalog metadata)
- `isActive`: Whether layout is active

## Related Files

- Handler: `internal/interfaces/http/handlers/layout_handler.go`
- Repository: `internal/infrastructure/database/postgres/layout_repository.go`
- Domain: `internal/domain/layout.go`
- Normalization: `internal/usecase/layout/normalize.go`


