# Quick Start: Environment Setup

## Initial Setup

**First time setup:** Create your environment files from the template:

```bash
cd apps/api-go
cp env.example .env.local
cp env.example .env.docker
```

Then edit both files with your configuration. See `env.example` for detailed instructions.

## For Docker Development (Recommended)

Docker Compose automatically uses `.env.docker`. Just run:

```bash
docker compose up
```

Make sure `.env.docker` has Docker service names:
- `FIRESTORE_EMULATOR_HOST=firestore-emulator:8080`
- `S3_ENDPOINT=http://minio:9000`
- `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`

## For Local Development (Running on Host)

1. Select the local environment file:
   ```bash
   cd apps/api-go
   ./scripts/select-env.sh local
   ```

2. Start services (Firestore emulator, MinIO, etc.):
   ```bash
   # From project root
   docker compose up firestore-emulator minio tempo
   ```

3. Run the API:
   ```bash
   cd apps/api-go
   go run cmd/server/main.go
   ```

Make sure `.env.local` has localhost addresses:
- `FIRESTORE_EMULATOR_HOST=localhost:8080`
- `S3_ENDPOINT=http://localhost:9000`
- `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`

See [env-setup.md](./env-setup.md) for detailed documentation.

