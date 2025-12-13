# File Storage Infrastructure

## Purpose

Handles file upload, storage, and deletion. Provides file validation and manages upload directory.

## Components

### FileStorage (`filesystem.go`)

Local file system storage implementation.

**Features:**
- File upload with validation
- File deletion
- MIME type validation
- File size validation
- Unique filename generation
- Directory management

**Methods:**
- `NewFileStorage(uploadPath, maxFileSize, allowedTypes)` - Create storage instance
- `SaveFile(filename, originalName, mimeType, size, reader)` - Save uploaded file
- `DeleteFile(filename)` - Delete file
- `ValidateFile(mimeType, size)` - Validate file before upload

## File Validation

### Size Validation
- Maximum file size: 10MB (configurable)
- Validates before saving

### Type Validation
- Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp
- Supports wildcard patterns (e.g., image/*)
- Validates MIME type and file extension

## Upload Process

1. **Validate**: Check size and type
2. **Generate Filename**: Create unique filename
3. **Save File**: Write to upload directory
4. **Return Metadata**: Return file information

## Storage Structure

```
uploads/
├── {unique-id-1}.jpg
├── {unique-id-2}.png
└── ...
```

Files are stored with unique generated filenames to prevent conflicts.

## Configuration

From `StorageConfig`:
- `UploadPath`: Directory for uploads (default: ./uploads)
- `MaxFileSize`: Maximum size in bytes (default: 10MB)
- `AllowedTypes`: Array of allowed MIME types

## Dependencies

- Standard Go libraries: `os`, `path/filepath`, `mime`, `io`

## Related Files

- Use Case: `internal/usecase/asset/upload.go`
- Handler: `internal/interfaces/http/handlers/asset_handler.go`
- Configuration: `internal/infrastructure/config/config.go`

## Security Considerations

1. **File Type Validation**: Strict MIME type checking
2. **Size Limits**: Prevents DoS via large files
3. **Unique Filenames**: Prevents overwriting
4. **Path Validation**: Prevents directory traversal
5. **Storage Location**: Should be outside web root in production

## Future Enhancements

Consider implementing:
- Cloud storage (S3, Cloudinary)
- Image processing/resizing
- Virus scanning
- CDN integration
- Backup strategies

## Best Practices

1. Always validate before saving
2. Use unique filenames
3. Store metadata in database
4. Clean up orphaned files
5. Implement proper error handling
6. Consider cloud storage for production
