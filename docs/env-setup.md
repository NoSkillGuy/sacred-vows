# Environment File Setup

This project uses separate environment files for different deployment scenarios to avoid configuration conflicts.

## Environment Files

- **`.env.local`** - For running the application directly on your host machine
  - Uses `localhost:8080` for Firestore emulator
  - Uses `localhost:9000` for MinIO
  - Uses `localhost:4317` for OpenTelemetry

- **`.env.docker`** - For running the application in Docker Compose
  - Uses `firestore-emulator:8080` for Firestore emulator (Docker service name)
  - Uses `minio:9000` for MinIO (Docker service name)
  - Uses `tempo:4317` for OpenTelemetry (Docker service name)

- **`.env`** - Symlink or copy of one of the above (not committed to git)

## Setup Instructions

### Option 1: Using the Helper Script (Recommended)

```bash
# For local development (running directly on host)
cd apps/api-go
./scripts/select-env.sh local

# For Docker development
cd apps/api-go
./scripts/select-env.sh docker
```

This script creates a symlink from `.env` to the appropriate environment file.

### Option 2: Manual Setup

**For Local Development:**
```bash
cd apps/api-go
cp .env.local .env
# Or create a symlink:
ln -sf .env.local .env
```

**For Docker Development:**
```bash
cd apps/api-go
cp .env.docker .env
# Or create a symlink:
ln -sf .env.docker .env
```

### Option 3: Using ENV_FILE Environment Variable

The application supports the `ENV_FILE` environment variable to specify which file to load:

```bash
# For local development
ENV_FILE=.env.local go run cmd/server/main.go

# For Docker, docker-compose.yml is already configured to use .env.docker
```

## Docker Compose

Docker Compose is configured to automatically use `.env.docker`. No manual setup needed when using `docker compose up`.

## Creating Your Environment Files

**IMPORTANT:** `.env.local` and `.env.docker` are NOT committed to git. You must create them locally.

1. Copy the example file:
   ```bash
   cd apps/api-go
   cp env.example .env.local
   cp env.example .env.docker
   ```

2. Edit `.env.local` (for running on host):
   - Set `FIRESTORE_EMULATOR_HOST=localhost:8080`
   - Set `S3_ENDPOINT=http://localhost:9000`
   - Set `R2_ENDPOINT=http://localhost:9000`
   - Set `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`
   - Set `GCP_PROJECT_ID=test-project` (or your project ID)
   - Generate and set `JWT_SECRET` (minimum 32 characters)
   - Add your API keys (Google OAuth, Mailjet, etc.)

3. Edit `.env.docker` (for Docker Compose):
   - Set `FIRESTORE_EMULATOR_HOST=firestore-emulator:8080`
   - Set `S3_ENDPOINT=http://minio:9000`
   - Set `R2_ENDPOINT=http://minio:9000`
   - Set `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
   - Set `GCP_PROJECT_ID=test-project` (or your project ID)
   - Generate and set `JWT_SECRET` (minimum 32 characters)
   - Add your API keys (Google OAuth, Mailjet, etc.)

4. See `env.example` for detailed instructions and all available variables.

## Key Differences

| Setting | .env.local | .env.docker |
|---------|------------|-------------|
| `FIRESTORE_EMULATOR_HOST` | `localhost:8080` | `firestore-emulator:8080` |
| `S3_ENDPOINT` | `http://localhost:9000` | `http://minio:9000` |
| `R2_ENDPOINT` | `http://localhost:9000` | `http://minio:9000` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4317` | `http://tempo:4317` |

## Troubleshooting

**Issue: Migrations not running in Docker**
- Ensure `.env.docker` has `FIRESTORE_EMULATOR_HOST=firestore-emulator:8080`
- Check that docker-compose.yml is using `.env.docker`

**Issue: Can't connect to services when running locally**
- Ensure `.env.local` has `localhost` addresses
- Make sure services are running on your host machine

**Issue: Can't connect to services in Docker**
- Ensure `.env.docker` uses Docker service names (e.g., `firestore-emulator:8080`)
- Check that services are defined in docker-compose.yml

