# Asset Use Cases

## Purpose

Handles file upload, retrieval, and deletion operations for user assets (images, etc.).

## Use Cases

### UploadAssetUseCase (`upload.go`)

Handles file upload and creates asset record.

**Input:**
- `Filename`: Generated unique filename
- `OriginalName`: Original file name
- `Size`: File size in bytes
- `MimeType`: File MIME type
- `UserID`: Owner user ID

**Output:**
- `URL`: Public URL to access asset
- `Asset`: Asset DTO

**Process:**
1. Validate file size (max 10MB)
2. Validate file type (images only)
3. Generate unique filename
4. Create asset entity
5. Save to repository
6. Return URL and asset data

**Validation:**
- File size must not exceed configured limit
- MIME type must be in allowed list (jpeg, jpg, png, gif, webp)

### GetAllAssetsUseCase (`get_all.go`)

Lists all assets for a user.

**Input:**
- `UserID`: User identifier

**Output:**
- `Assets`: Array of asset DTOs

**Process:**
1. Find all assets by user ID
2. Convert to DTOs
3. Return list

### DeleteAssetUseCase (`delete.go`)

Deletes an asset by URL.

**Input:**
- `URL`: Asset URL

**Output:**
- Error if deletion fails

**Process:**
1. Find asset by URL
2. Delete from repository
3. Return success or error

**Note:** File deletion from storage is handled separately by the storage service.

## DTOs (`dto.go`)

- `AssetDTO`: Asset representation with all metadata

## Dependencies

- `repository.AssetRepository`: Asset data operations
- `domain.Asset`: Asset entity
- `github.com/segmentio/ksuid`: Unique filename generation
- File validation logic

## File Validation

- **Size Limit**: 10MB (configurable)
- **Allowed Types**: image/jpeg, image/jpg, image/png, image/gif, image/webp
- **Wildcard Support**: Supports image/* pattern matching

## Related Files

- Handler: `internal/interfaces/http/handlers/asset_handler.go`
- Domain: `internal/domain/asset.go`
- Repository: `internal/interfaces/repository/asset_repository.go`
- Storage: `internal/infrastructure/storage/filesystem.go`

## Storage

Files are stored in the configured upload path (default: `./uploads`). The storage service handles:
- File saving
- File deletion
- Path management
