# Local Development

This guide provides a complete setup for local development, including environment configuration, service setup, and development workflows.

## Overview

In production, we use Cloudflare R2 for storing:
- **Published sites**: Static HTML/CSS/JS artifacts for published invitations
- **Public assets**: Default images, layouts, and music files

For local development, we use MinIO (an S3-compatible storage server) to simulate R2, allowing you to test the same storage patterns locally.

## Prerequisites

Before starting, ensure you have:
- All [prerequisites](./prerequisites.md) installed
- Docker and Docker Compose installed
- MinIO Client (`mc`) - will be installed automatically by the init script, or install manually:
  - macOS: `brew install minio/stable/mc`
  - Linux: Download from https://min.io/docs/minio/linux/reference/minio-mc.html

## Quick Start

### 1. Start Services

All services are included in `docker-compose.yml`. Start them all:

```bash
docker-compose up -d
```

This starts:
- **Firestore Emulator**: http://localhost:8080 (API), http://localhost:4000 (UI)
- **MinIO**: http://localhost:9000 (API), http://localhost:9001 (Console, login: `minioadmin`/`minioadmin`)
- **Tempo** (Observability): http://localhost:3200 (UI), OTLP gRPC on 4317, HTTP on 4318
- **Prometheus** (Observability): http://localhost:9090
- **Grafana** (Observability): http://localhost:3001 (login: `admin`/`admin`)
- **API Server**: http://localhost:3000

**Note:** The `api-go` service includes hot reloading support. When you edit Go source files locally, the server will automatically rebuild and restart. See the "Start Development Servers" section below for details.

Or start individual services:

```bash
# Just MinIO
docker-compose up -d minio

# Just observability stack
docker-compose up -d tempo prometheus grafana
```

### 2. Initialize Buckets and Upload Assets

Run the initialization script:

```bash
./apps/builder/scripts/init-local-r2.sh
```

This script will:
- Check MinIO availability
- Create required buckets (`sacred-vows-published-local` and `sacred-vows-public-assets-local`)
- Set public access policy for the public assets bucket
- Upload default assets from `apps/builder/scripts/assets`

### 3. Configure Environment Variables

This project uses separate environment files for different deployment scenarios to avoid configuration conflicts.

#### Environment Files Overview

Each application uses:
- **`.env.local`** - For running directly on your host machine (uses `localhost` addresses)
- **`.env.docker`** - For running in Docker Compose (uses Docker service names)

#### API Service Environment Setup

**First time setup:** Create your environment files from the template:

```bash
cd apps/api-go
cp env.example .env.local
cp env.example .env.docker
```

**For Local Development (Running on Host):**

1. Select the local environment file:
   ```bash
   cd apps/api-go
   ./scripts/select-env.sh local
   ```

2. Edit `.env.local` with localhost addresses:
   - `FIRESTORE_EMULATOR_HOST=localhost:8080`
   - `S3_ENDPOINT=http://localhost:9000`
   - `R2_ENDPOINT=http://localhost:9000`
   - `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`
   - `GCP_PROJECT_ID=test-project`
   - Generate and set `JWT_SECRET` (minimum 32 characters)
   - Add your API keys (Google OAuth, Mailjet, etc.)

**For Docker Development:**

Docker Compose automatically uses `.env.docker`. Edit `.env.docker` with Docker service names:
- `FIRESTORE_EMULATOR_HOST=firestore-emulator:8080`
- `S3_ENDPOINT=http://minio:9000`
- `R2_ENDPOINT=http://minio:9000`
- `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- `GCP_PROJECT_ID=test-project`
- Generate and set `JWT_SECRET` (minimum 32 characters)
- Add your API keys (Google OAuth, Mailjet, etc.)

**Additional R2/MinIO Configuration:**

Add or update these variables in your `.env.local` or `.env.docker`:

```bash
# R2/MinIO configuration
R2_ENDPOINT=http://minio:9000  # Use internal Docker network name for Docker, localhost:9000 for host
R2_ACCESS_KEY_ID=minioadmin
R2_SECRET_ACCESS_KEY=minioadmin
R2_BUCKET=sacred-vows-published-local
PUBLIC_ASSETS_R2_BUCKET=sacred-vows-public-assets-local
PUBLIC_ASSETS_CDN_URL=http://localhost:9000/sacred-vows-public-assets-local
```

For detailed API environment setup, see [API Environment Setup](../applications/api-go/env-setup.md).

#### Builder App Environment Setup

**First time setup:** Create your environment files:

```bash
cd apps/builder
cp env.example .env.local
cp env.example .env.docker
```

**For Local Development:**

Edit `.env.local`:
- `VITE_API_URL=http://localhost:3000/api`
- `VITE_PUBLIC_ASSETS_CDN_URL=http://localhost:9000/sacred-vows-public-assets-local`
- `VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

**For Docker Development:**

Edit `.env.docker`:
- `VITE_API_URL=http://api-go:3000/api` (Docker service name)
- `VITE_PUBLIC_ASSETS_CDN_URL=http://localhost:9000/sacred-vows-public-assets-local` (browser access)
- `VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318` (Docker service name)

**Note:** Vite automatically reads `.env.local` when you run `npm run dev`. No manual setup needed!

For detailed Builder environment setup, see [Builder Environment Setup](../applications/builder/env-setup.md).

### 4. Update Configuration Files

The `apps/api-go/config/local.yaml` file is already configured to use R2 with local MinIO endpoint. Verify it has:

```yaml
publishing:
  artifact_store: "r2"
  r2_endpoint: "http://localhost:9000"
  r2_bucket: "sacred-vows-published-local"
  r2_public_base: "http://localhost:9000/sacred-vows-published-local"

public_assets:
  r2_bucket: "sacred-vows-public-assets-local"
  cdn_base_url: "http://localhost:9000/sacred-vows-public-assets-local"
```

### 5. Start Development Servers

#### Option A: Local Development with Hot Reloading (Recommended)

```bash
# Start API with hot reloading (automatically rebuilds on file changes)
cd apps/api-go
make dev

# Or using Docker with hot reloading (built-in)
docker-compose up api-go

# Start Builder (in another terminal)
cd apps/builder
npm run dev
```

#### Option B: Standard Development (Manual Restart)

```bash
# Start API (if not using docker-compose)
cd apps/api-go
make run
# Or: go run cmd/server/main.go

# Start Builder (in another terminal)
cd apps/builder
npm run dev
```

**Hot Reloading:**
- `make dev` uses [Air](https://github.com/cosmtrek/air) to automatically rebuild and restart the server when you change `.go` files
- Install Air with: `go install github.com/cosmtrek/air@latest`
- The `api-go` Docker service includes hot reloading with source code mounted as a volume - just run `docker-compose up api-go`

## Switching Between Filesystem and R2

### Use R2 (MinIO) - Recommended

Set in `apps/api-go/config/local.yaml`:

```yaml
publishing:
  artifact_store: "r2"
```

### Use Filesystem - Fallback

Set in `apps/api-go/config/local.yaml`:

```yaml
publishing:
  artifact_store: "filesystem"
```

## Uploading Assets to Local R2

### Using the Migration Script

The migration script supports local MinIO via the `R2_ENDPOINT` environment variable:

```bash
cd apps/builder

# Set environment variables
export R2_ENDPOINT=http://localhost:9000
export R2_ACCESS_KEY_ID=minioadmin
export R2_SECRET_ACCESS_KEY=minioadmin
export PUBLIC_ASSETS_R2_BUCKET=sacred-vows-public-assets-local

# Run migration
npm run migrate-assets -- --env=local
```

### Using MinIO Console

1. Open http://localhost:9001
2. Login with `minioadmin` / `minioadmin`
3. Navigate to the `sacred-vows-public-assets-local` bucket
4. Upload files via the web UI

### Using MinIO Client (mc)

```bash
# Configure alias (if not already done)
mc alias set local-r2 http://localhost:9000 minioadmin minioadmin

# Upload a file
mc cp path/to/file.jpg local-r2/sacred-vows-public-assets-local/defaults/couple1/bride/

# Upload a directory recursively
mc cp --recursive path/to/directory/ local-r2/sacred-vows-public-assets-local/defaults/
```

## Accessing Published Sites

When using R2 for published sites, the public URL format is:

```
http://localhost:9000/sacred-vows-published-local/sites/{subdomain}/v{version}/index.html
```

For example:
```
http://localhost:9000/sacred-vows-published-local/sites/john-wedding/v1/index.html
```

## Troubleshooting

### MinIO Not Accessible

**Error**: `MinIO is not accessible at http://localhost:9000`

**Solution**:
1. Check if MinIO is running: `docker-compose ps minio`
2. Start MinIO: `docker-compose up -d minio`
3. Wait a few seconds for MinIO to start
4. Check logs: `docker-compose logs minio`

### Assets Not Loading

**Error**: Assets return 404 or Access Denied

**Solutions**:
1. Verify bucket exists: `mc ls local-r2`
2. Check public access policy: `mc anonymous get local-r2/sacred-vows-public-assets-local`
3. Set public access: `mc anonymous set download local-r2/sacred-vows-public-assets-local`
4. Verify assets are uploaded: `mc ls local-r2/sacred-vows-public-assets-local/defaults/`

### API Can't Connect to MinIO

**Error**: `Failed to connect to MinIO` or `connection refused`

**Solutions**:
1. If API runs in Docker: Use `http://minio:9000` (internal network)
2. If API runs on host: Use `http://localhost:9000`
3. Check MinIO is accessible: `curl http://localhost:9000/minio/health/live`

### CORS Issues

If you see CORS errors when loading assets in the browser:

1. Set CORS policy via MinIO console (http://localhost:9001)
2. Or use mc:
```bash
mc cors set download local-r2/sacred-vows-public-assets-local
```

## MinIO Console

Access the MinIO web console at http://localhost:9001

- **Login**: `minioadmin` / `minioadmin` (default, change in production)
- **Features**:
  - Browse buckets and objects
  - Upload/download files
  - Set bucket policies
  - View access logs

## Firestore Emulator

The Firestore emulator is included in `docker-compose.yml` and provides a local Firestore database for development.

### Starting the Emulator

The Firestore emulator starts automatically with docker-compose:

```bash
docker-compose up -d firestore-emulator
```

Or start all services:

```bash
docker-compose up -d
```

### Firebase Emulator UI

The Firebase Emulator Suite includes a web UI for managing your local Firestore data:

- **URL**: http://localhost:4000
- **Firestore UI**: http://localhost:4000/firestore
- **Firestore API**: http://localhost:8080

**Features**:
- Browse collections and documents
- View and edit document data
- Add/delete collections and documents
- Query data visually
- Export/import data

### Configuration

The emulator is configured via `firebase.json`:

```json
{
  "emulators": {
    "firestore": {
      "port": 8080,
      "host": "0.0.0.0"
    },
    "ui": {
      "enabled": true,
      "port": 4000,
      "host": "0.0.0.0"
    }
  }
}
```

### Environment Variables

Your application should connect to the emulator using:

```bash
FIRESTORE_EMULATOR_HOST=localhost:8080
GCP_PROJECT_ID=test-project
```

When running in Docker, use the service name:

```bash
FIRESTORE_EMULATOR_HOST=firestore-emulator:8080
```

### Data Persistence

Firestore emulator data is persisted in the `firestore_data` Docker volume. To reset the database:

```bash
docker-compose down -v firestore-emulator
docker-compose up -d firestore-emulator
```

## Bucket Structure

### Published Sites Bucket (`sacred-vows-published-local`)

```
sites/
  {subdomain}/
    v{version}/
      index.html
      styles.css
      app.js
      manifest.json
      assets/...
```

### Public Assets Bucket (`sacred-vows-public-assets-local`)

```
defaults/
  couple1/
    couple/
    bride/
    groom/
    family/
  couple2/
    ...
  layouts/
    {layout-id}/
      preview.jpg
  music/
    {filename}.mp3
  manifest.json
```

## Environment Variables Reference

### API Service

| Variable | Description | Default (Local) |
|----------|-------------|----------------|
| `R2_ENDPOINT` | MinIO/R2 endpoint URL | `http://minio:9000` (Docker) or `http://localhost:9000` (host) |
| `R2_ACCESS_KEY_ID` | Access key | `minioadmin` |
| `R2_SECRET_ACCESS_KEY` | Secret key | `minioadmin` |
| `R2_BUCKET` | Published sites bucket | `sacred-vows-published-local` |
| `PUBLIC_ASSETS_R2_BUCKET` | Public assets bucket | `sacred-vows-public-assets-local` |
| `PUBLIC_ASSETS_CDN_URL` | CDN base URL for assets | `http://localhost:9000/sacred-vows-public-assets-local` |

### Builder App

| Variable | Description | Default (Local) |
|----------|-------------|----------------|
| `VITE_PUBLIC_ASSETS_CDN_URL` | CDN base URL for assets | `http://localhost:9000/sacred-vows-public-assets-local` |

## Production vs Local

| Aspect | Production | Local |
|--------|-----------|-------|
| Storage | Cloudflare R2 | MinIO |
| Endpoint | `https://{account}.r2.cloudflarestorage.com` | `http://localhost:9000` |
| Authentication | Cloudflare API tokens | `minioadmin` / `minioadmin` |
| Public Access | Custom domain (e.g., `pub.sacredvows.io`) | Direct MinIO URL |
| Buckets | `sacred-vows-published-prod` | `sacred-vows-published-local` |

## Observability

The local development environment includes a full observability stack for distributed tracing and metrics:

- **Tempo**: Distributed tracing backend (http://localhost:3200)
- **Prometheus**: Metrics collection (http://localhost:9090)
- **Grafana**: Visualization and dashboards (http://localhost:3001, admin/admin)

### Quick Start

Observability services start automatically with `docker-compose up -d`. To start just the observability stack:

```bash
docker-compose up -d tempo prometheus grafana
```

### Viewing Traces

1. Open Grafana: http://localhost:3001
2. Navigate to **Explore** (compass icon)
3. Select **Tempo** data source
4. Search by service: `{service.name="sacred-vows-api"}` or by request ID: `{http.request_id="<uuid>"}`

### Configuration

Observability is enabled by default in local development. See [Telemetry Documentation](../infrastructure/observability/telemetry.md) for:
- Detailed configuration options
- Request ID and trace correlation
- How to disable observability
- Production setup instructions

## Next Steps

- [ ] Start MinIO: `docker-compose up -d minio`
- [ ] Initialize buckets: `./apps/builder/scripts/init-local-r2.sh`
- [ ] Configure environment variables
- [ ] Explore traces in Grafana: http://localhost:3001
- [ ] Test publishing an invitation
- [ ] Verify assets load from MinIO
- [ ] Check MinIO console for uploaded files

