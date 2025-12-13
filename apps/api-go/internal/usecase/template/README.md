# Template Use Cases

## Purpose

Handles template operations including loading templates from the file system, filtering, and manifest management. Templates are stored in the file system, not the database.

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
1. Read template directories from file system
2. Load manifest.json for each template
3. Normalize manifest data
4. Apply filters (category, featured)
5. Return filtered templates and categories

### GetTemplateByIDUseCase (`get_by_id.go`)

Retrieves a single template by ID.

**Input:**
- `ID`: Template identifier

**Output:**
- `Template`: Template summary DTO

**Process:**
1. Load manifest.json for template ID
2. Normalize manifest data
3. Return template summary or error if not found

### GetTemplateManifestUseCase (`get_manifest.go`)

Gets the full manifest for a specific template.

**Input:**
- `ID`: Template identifier

**Output:**
- `Manifest`: Full manifest as map

**Process:**
1. Load manifest.json file
2. Parse and normalize
3. Return full manifest data

### GetManifestsUseCase (`get_manifests.go`)

Gets manifests for all templates.

**Input:**
- None

**Output:**
- `Manifests`: Array of all template manifests

**Process:**
1. Read all template directories
2. Load and normalize each manifest
3. Return array of manifests

## Manifest Normalization

Templates are loaded from `manifest.json` files in the templates directory. The normalization process:

- Sets default theme if none specified
- Handles status (ready, coming-soon, hidden)
- Trims tags to maximum 3
- Sets default values for missing fields
- Ensures consistent structure

## DTOs (`dto.go`)

- `TemplateSummaryDTO`: Template summary with all fields

## Dependencies

- File system access (no database)
- `encoding/json`: JSON parsing
- `os`, `path/filepath`: File operations

## Template Directory Structure

```
templates/
├── template-id-1/
│   └── manifest.json
├── template-id-2/
│   └── manifest.json
└── ...
```

## Related Files

- Handler: `internal/interfaces/http/handlers/template_handler.go`
- Templates are loaded from file system (configured via TEMPLATES_DIR)

## Configuration

Templates directory is configured via `TEMPLATES_DIR` environment variable, defaulting to `../../builder/templates`.
