# Configuration Management

## Purpose

Loads and validates application configuration from **YAML config files** (for non-sensitive settings) and **environment variables** (for sensitive data). Provides type-safe configuration structs.

## Responsibilities

- Load YAML config files based on environment
- Load environment variables (sensitive values and overrides)
- Merge YAML defaults with environment variable overrides
- Validate required configuration
- Provide type-safe configuration access
- Support .env file loading for local development
- Set defaults where appropriate

## Components

### Config (`config.go`)

Main configuration structure with nested configs:

**ServerConfig:**
- `Port` - Server port (default: 3000)
- `ReadTimeout` - Request read timeout
- `WriteTimeout` - Response write timeout

**DatabaseConfig:**
- `ProjectID` - Google Cloud Project ID (required)
- `DatabaseID` - Firestore database name (default: "(default)")

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
1. Loads .env file if present (optional, for local development)
2. Determines environment from `APP_ENV` variable (defaults to "local")
3. Loads corresponding YAML config file from `config/{env}.yaml`
4. Falls back to `config/local.yaml` if environment-specific file not found
5. Reads environment variables (sensitive values and overrides)
6. Merges YAML defaults with environment variable values (env vars take precedence)
7. Sets defaults for optional values
8. Validates required values
9. Returns configuration struct

**Configuration Priority:**
1. Environment variables (highest priority - for sensitive values and overrides)
2. YAML config file (defaults for non-sensitive values)
3. Hard-coded defaults (lowest priority)

## Validation

Validates:
- `GCP_PROJECT_ID` must be set
- `JWT_SECRET` must be set and not default value

## Configuration Sources

### YAML Config Files

Non-sensitive configuration is stored in `config/{env}.yaml` files:
- `config/local.yaml` - Local development
- `config/dev.yaml` - Dev environment
- `config/prod.yaml` - Production environment

The environment is determined by the `APP_ENV` environment variable.

**YAML files contain:**
- Server settings (port, timeouts)
- Auth settings (JWT expiration, issuer, audience - not secrets)
- Storage paths
- Google OAuth redirect URIs and frontend URLs
- Publishing settings (domains, artifact store type)
- Email configuration (vendors, limits, from address/name - not API keys)

### Environment Variables

See `env.example` for all **sensitive** environment variables. These should never be in YAML files.

**Required:**
- `APP_ENV` - Environment name: `local`, `dev`, or `prod`
- `GCP_PROJECT_ID` - Google Cloud Project ID
- `JWT_SECRET` - JWT signing secret
- `REFRESH_TOKEN_HMAC_KEYS` - JSON array of HMAC keys
- `REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID` - Active HMAC key ID

**Optional (sensitive):**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MAILJET_API_KEY` - Mailjet API key
- `MAILJET_SECRET_KEY` - Mailjet secret key
- `MAILGUN_API_KEY` - Mailgun API key
- `R2_ACCESS_KEY_ID` - R2 access key ID
- `R2_SECRET_ACCESS_KEY` - R2 secret access key

**Note:** Environment variables can override YAML values. This is useful for:
- Sensitive values (must be in env vars)
- Environment-specific overrides
- Local development customization

## Dependencies

- **github.com/joho/godotenv**: .env file loading
- **gopkg.in/yaml.v3**: YAML config file parsing

## Related Files

- `config/local.yaml`, `config/dev.yaml`, `config/prod.yaml`: Environment-specific config files
- `env.example`: Example environment variables (sensitive only)
- Used by: `cmd/server/main.go`

## Best Practices

1. Always validate required configuration
2. Use sensible defaults
3. Document all environment variables
4. Never commit .env files
5. Use type-safe configuration structs
6. Validate configuration on startup
