# Common Issues

This document consolidates common troubleshooting patterns and frequently encountered problems across the Sacred Vows platform.

## Environment & Configuration

### Environment Variables Not Loading

**Symptoms:**
- Application can't connect to services
- Configuration values are incorrect or missing

**Solutions:**
1. **For API (Go)**:
   - Ensure `.env.local` or `.env.docker` exists
   - Use `./scripts/select-env.sh local` or `./scripts/select-env.sh docker`
   - Verify environment file is being loaded (check logs)

2. **For Builder (Vite)**:
   - Ensure `.env.local` or `.env.docker` exists
   - Variables must be prefixed with `VITE_` to be exposed
   - Restart dev server after changing environment variables
   - Variables are read at build/dev server start time

3. **In Docker**:
   - Check `docker-compose.yml` has `env_file` configured
   - Verify service names match (e.g., `api-go:3000` not `localhost:3000`)

### Can't Connect to Services

**Symptoms:**
- Connection refused errors
- Timeout errors
- Service unavailable

**Solutions:**
1. **Check service is running**:
   ```bash
   docker compose ps
   ```

2. **Verify environment variables**:
   - Local development: Use `localhost` addresses
   - Docker: Use Docker service names (e.g., `minio:9000`)

3. **Check service health**:
   ```bash
   # MinIO
   curl http://localhost:9000/minio/health/live
   
   # Firestore Emulator
   curl http://localhost:8080
   ```

4. **Check Docker network**:
   - Ensure services are on the same Docker network
   - Verify service names in docker-compose.yml

## Storage & Assets

### Assets Not Loading

**Symptoms:**
- 404 errors for images/assets
- Access denied errors
- Assets return empty responses

**Solutions:**
1. **Verify bucket exists and is accessible**:
   ```bash
   mc ls local-r2  # For local MinIO
   ```

2. **Check public access policy**:
   - R2 buckets are private by default
   - Enable public access in bucket settings
   - For Terraform-managed buckets, add `public = true`

3. **Verify asset paths**:
   - Check for case sensitivity issues
   - Verify path structure matches bucket layout
   - Ensure assets have been uploaded

4. **Check CORS configuration**:
   - Set CORS policy if accessing from browser
   - Verify allowed origins include your domain

### R2 Custom Domain Issues

**Symptoms:**
- 404 errors on custom domain
- DNS resolves but returns 404

**Solutions:**
1. **Enable public access** (critical for APAC buckets):
   - Add `public = true` to Terraform configuration
   - Requires Cloudflare provider v5.0+
   - Wait 60-120 seconds for propagation

2. **Verify object exists**:
   - Check exact path in R2 bucket
   - Verify case sensitivity
   - Ensure object was uploaded successfully

3. **Check custom domain configuration**:
   - Verify domain is properly configured in Cloudflare
   - Check DNS records are correct
   - Ensure domain is linked to bucket

## Deployment

### Build Failures

**Symptoms:**
- GitHub Actions workflow fails
- Cloudflare Pages build fails
- Docker build fails

**Solutions:**
1. **Check build logs** for specific error messages
2. **Verify dependencies**:
   - `npm ci` for Node.js projects
   - `go mod download` for Go projects
3. **Check environment variables** in CI/CD
4. **Verify build configuration**:
   - Build command
   - Output directory
   - Node/Go versions

### Authentication Failures

**Symptoms:**
- GitHub Actions: Authentication error
- GCP: Permission denied
- Cloudflare: Token invalid

**Solutions:**
1. **GitHub Secrets**:
   - Verify secrets are set correctly
   - Check for typos in secret names
   - Ensure JSON keys are complete

2. **GCP Service Account**:
   - Verify service account has required roles
   - Check key hasn't expired
   - Ensure key is valid JSON

3. **Cloudflare API Token**:
   - Verify token has correct permissions
   - Check token hasn't expired
   - Ensure `account_id` is set in wrangler.toml

## Development

### Hot Reload Not Working

**Symptoms:**
- Changes don't reflect in browser
- Server doesn't restart on file changes

**Solutions:**
1. **For Go (API)**:
   - Use `make dev` (requires Air)
   - Or use Docker with volume mounts
   - Check Air is installed: `go install github.com/cosmtrek/air@latest`

2. **For Vite (Builder)**:
   - Ensure source files are mounted as volume
   - Check Vite polling is enabled
   - Verify `node_modules` is excluded from volume

3. **Check file watching**:
   - Ensure files are being saved
   - Check for file system events
   - Verify Docker volume mounts

### Database Connection Issues

**Symptoms:**
- Can't connect to Firestore
- Migration errors
- Data not persisting

**Solutions:**
1. **Check Firestore Emulator**:
   - Verify emulator is running: `docker compose ps firestore-emulator`
   - Check `FIRESTORE_EMULATOR_HOST` environment variable
   - Use `localhost:8080` for local, `firestore-emulator:8080` for Docker

2. **Verify GCP Project**:
   - Check `GCP_PROJECT_ID` is set correctly
   - For emulator, use `test-project` or your project ID

3. **Check data persistence**:
   - Firestore emulator data is in Docker volume
   - Reset: `docker compose down -v firestore-emulator`

## Observability

### No Traces Appearing

**Symptoms:**
- Grafana shows no traces
- Tempo search returns empty

**Solutions:**
1. **Check observability is enabled**:
   ```bash
   echo $OTEL_ENABLED  # Should be 'true'
   ```

2. **Verify OTLP endpoint**:
   - Check endpoint is reachable
   - Verify port is correct (4317 for gRPC, 4318 for HTTP)

3. **Check Tempo is running**:
   ```bash
   docker compose ps tempo
   curl http://localhost:3200/api/search
   ```

4. **Verify sampling**:
   - Check sampling rate isn't too low
   - Errors are always sampled (100%)

## Getting More Help

If your issue isn't covered here:

1. Check application-specific troubleshooting:
   - [R2 Troubleshooting](./r2-troubleshooting.md)
   - [Fix R2 DNS](./fix-r2-dns.md)
   - [Cloudflare Pages Troubleshooting](../../infrastructure/deployment/cloudflare-pages-troubleshooting.md)

2. Review relevant documentation:
   - [Local Development](../../getting-started/local-development.md)
   - [Deployment Guide](../../infrastructure/deployment/overview.md)
   - [Application Documentation](../../applications/README.md)

3. Check service logs:
   ```bash
   docker compose logs <service-name>
   ```

