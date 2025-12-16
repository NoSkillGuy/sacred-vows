# Configuration Management

## Purpose

Loads and validates application configuration from environment variables. Provides type-safe configuration structs.

## Responsibilities

- Load environment variables
- Validate required configuration
- Provide type-safe configuration access
- Support .env file loading
- Set defaults where appropriate

## Components

### Config (`config.go`)

Main configuration structure with nested configs:

**ServerConfig:**
- `Port` - Server port (default: 3000)
- `ReadTimeout` - Request read timeout
- `WriteTimeout` - Response write timeout

**DatabaseConfig:**
- `URL` - PostgreSQL connection string (required)
- `MaxOpenConns` - Maximum open connections
- `MaxIdleConns` - Maximum idle connections
- `ConnMaxLifetime` - Connection max lifetime

**AuthConfig:**
- `JWTSecret` - JWT signing secret (required)
- `JWTAccessExpiration` - Access token expiration duration (default: 15 minutes)
- `JWTRefreshExpiration` - Refresh token expiration duration (default: 30 days)
- `JWTIssuer` - JWT issuer claim (default: "sacred-vows-api")
- `JWTAudience` - JWT audience claim (default: "sacred-vows-client")
- `ClockSkewTolerance` - Clock skew tolerance for token validation (default: 60 seconds)

**StorageConfig:**
- `UploadPath` - File upload directory (default: ./uploads)
- `MaxFileSize` - Maximum file size in bytes (default: 10MB)
- `AllowedTypes` - Allowed MIME types

**GoogleConfig:**
- `ClientID` - Google OAuth client ID
- `ClientSecret` - Google OAuth client secret
- `RedirectURI` - OAuth redirect URI
- `FrontendURL` - Frontend application URL

## Loading Configuration

```go
config, err := config.Load()
if err != nil {
    // Handle error
}
```

**Process:**
1. Loads .env file if present (optional)
2. Reads environment variables
3. Sets defaults for optional values
4. Validates required values
5. Returns configuration struct

## Validation

Validates:
- `DATABASE_URL` must be set
- `JWT_SECRET` must be set and not default value

## Environment Variables

See `.env.example` for all available variables:
- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `PORT` (optional, default: 3000)
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)
- `GOOGLE_REDIRECT_URI` (optional)
- `FRONTEND_URL` (optional)
- `UPLOAD_PATH` (optional)
- `LAYOUTS_DIR` (optional)

## Dependencies

- **github.com/joho/godotenv**: .env file loading

## Related Files

- `.env.example`: Example environment variables
- Used by: `cmd/server/main.go`

## Best Practices

1. Always validate required configuration
2. Use sensible defaults
3. Document all environment variables
4. Never commit .env files
5. Use type-safe configuration structs
6. Validate configuration on startup
