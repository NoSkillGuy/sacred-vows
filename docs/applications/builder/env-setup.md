# Builder Application Environment Setup

This document explains how to configure environment variables for the builder application (Vite-based React app) for different deployment scenarios.

## Environment Files

The builder application uses separate environment files for different deployment scenarios:

- **`.env.local`** - For running the application directly on your host machine
  - Uses `localhost:3000` for API
  - Uses `localhost:9000` for MinIO (CDN assets)
  - Uses `localhost:4318` for OpenTelemetry

- **`.env.docker`** - For running the application in Docker Compose
  - Uses `api-go:3000` for API (Docker service name)
  - Uses `localhost:9000` for MinIO (accessed from browser)
  - Uses `tempo:4318` for OpenTelemetry (Docker service name)

## Setup Instructions

**No manual setup needed!** Vite automatically reads environment files:

- **For local development**: Vite automatically loads `.env.local` when you run `npm run dev`
- **For Docker**: Docker Compose automatically loads `.env.docker` via the `env_file` configuration

## Docker Compose

Docker Compose is configured to automatically use `.env.docker`. No manual setup needed when using `docker compose up builder`.

## Creating Your Environment Files

**IMPORTANT:** `.env.local` and `.env.docker` are NOT committed to git. You must create them locally.

1. Copy the example file:
   ```bash
   cd apps/builder
   cp env.example .env.local
   cp env.example .env.docker
   ```

2. Edit `.env.local` (for running on host):
   - Set `VITE_API_URL=http://localhost:3000/api`
   - Set `VITE_PUBLIC_ASSETS_CDN_URL=http://localhost:9000/sacred-vows-public-assets-local`
   - Set `VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`
   - Configure other OpenTelemetry variables as needed

3. Edit `.env.docker` (for Docker Compose):
   - Set `VITE_API_URL=http://api-go:3000/api` (Docker service name)
   - Set `VITE_PUBLIC_ASSETS_CDN_URL=http://localhost:9000/sacred-vows-public-assets-local` (browser access)
   - Set `VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318` (Docker service name)
   - Configure other OpenTelemetry variables as needed

4. See `env.example` for detailed instructions and all available variables.

## Key Differences

| Setting | .env.local | .env.docker |
|---------|------------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` | `http://api-go:3000/api` |
| `VITE_PUBLIC_ASSETS_CDN_URL` | `http://localhost:9000/...` | `http://localhost:9000/...` |
| `VITE_OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` | `http://tempo:4318` |

**Note:** `VITE_PUBLIC_ASSETS_CDN_URL` uses `localhost:9000` in both cases because it's accessed from the browser, not from within the Docker container.

## Running the Builder Application

### Local Development

1. Ensure `.env.local` exists and is configured correctly (see "Creating Your Environment Files" above)

2. Start the development server:
   ```bash
   cd apps/builder
   npm run dev
   ```

3. The application will be available at `http://localhost:5173`

**Note:** Vite automatically reads `.env.local` - no script or symlink needed!

### Docker Development

1. Ensure `.env.docker` exists and is configured correctly

2. Start the builder service:
   ```bash
   # From project root
   docker compose up builder
   ```

3. The application will be available at `http://localhost:5173`

4. Hot reload is enabled - changes to source files will automatically trigger rebuilds

## Hot Reload in Docker

The builder service in Docker Compose is configured with:
- Source code mounted as volume for hot reload
- Vite configured with polling for file system changes
- `node_modules` excluded from volume to avoid conflicts

File changes in `apps/builder/src/` will automatically trigger Vite to rebuild and refresh the browser.

## Troubleshooting

**Issue: Can't connect to API when running locally**
- Ensure `.env.local` has `VITE_API_URL=http://localhost:3000/api`
- Make sure the API service is running on your host machine
- Check that the API is accessible at `http://localhost:3000`

**Issue: Can't connect to API in Docker**
- Ensure `.env.docker` has `VITE_API_URL=http://api-go:3000/api`
- Check that the `api-go` service is running: `docker compose ps`
- Verify the `api-go` service is healthy: `docker compose logs api-go`

**Issue: Assets not loading**
- Ensure `VITE_PUBLIC_ASSETS_CDN_URL` is set correctly
- Check that MinIO is running and accessible
- Verify the bucket exists and has public access

**Issue: Hot reload not working in Docker**
- Check that source files are mounted as volume in docker-compose.yml
- Verify Vite is using polling mode (configured in vite.config.ts)
- Check Docker logs: `docker compose logs builder`

**Issue: Environment variables not loading**
- Vite only reads variables prefixed with `VITE_`
- Variables must be available when the dev server starts
- For local development, ensure `.env.local` exists (Vite reads it automatically)
- In Docker, variables are loaded from `.env.docker` via `env_file` in docker-compose.yml
- Restart the dev server after changing environment variables

## Vite Environment Variables

Vite has special handling for environment variables:
- Only variables prefixed with `VITE_` are exposed to the client code
- Variables are read at build/dev server start time
- Access variables in code via `import.meta.env.VITE_*`
- Variables are replaced at build time, not runtime

For more information, see the [Vite documentation on environment variables](https://vitejs.dev/guide/env-and-mode.html).

