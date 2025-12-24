# Manual Deployment

This guide covers manual deployment procedures for when you need to deploy outside of the automated GitHub Actions workflow (e.g., for testing or troubleshooting).

## Prerequisites

- Authenticated with the appropriate cloud provider
- Required CLI tools installed (gcloud, wrangler)
- Access to deployment targets

## Manual API Server Deployment

### Prerequisites

- `gcloud` CLI installed and authenticated
- GCP project access
- Docker image built and ready

### Steps

```bash
# Navigate to api-go directory
cd apps/api-go

# Authenticate with GCP
gcloud auth login
gcloud config set project sacred-vows

# Build and push Docker image
gcloud builds submit \
  --tag asia-northeast1-docker.pkg.dev/sacred-vows/api-dev/api-go:latest \
  --project sacred-vows \
  --region asia-northeast1

# Deploy to Cloud Run
gcloud run services update api-go-dev \
  --image asia-northeast1-docker.pkg.dev/sacred-vows/api-dev/api-go:latest \
  --region asia-northeast1 \
  --project sacred-vows
```

### Verify Deployment

```bash
# Check service status
gcloud run services describe api-go-dev \
  --region asia-northeast1 \
  --project sacred-vows

# Test health endpoint
curl https://api.dev.sacredvows.io/health
```

## Manual Edge Worker Deployment

### Prerequisites

- `wrangler` CLI installed (`npm install -g wrangler`)
- Cloudflare API token set
- `account_id` configured in `wrangler.toml`

### Steps

```bash
# Navigate to edge-worker directory
cd apps/edge-worker

# Install dependencies
npm ci

# Set Cloudflare API token
export CLOUDFLARE_API_TOKEN="your-token-here"

# Verify account_id is set in wrangler.toml (helps avoid authentication issues)
# The account_id can be found in Cloudflare dashboard or in error messages

# Deploy worker
npx wrangler deploy
```

**Note**: Ensure `account_id` is configured in `apps/edge-worker/wrangler.toml`. This helps avoid authentication errors and bypasses the User Details permission requirement. The account ID can be found:
- In the Cloudflare dashboard (right sidebar when viewing Workers)
- In error messages when deploying without `account_id` set
- In Terraform configuration: `infra/terraform/dev/terraform.tfvars` (as `cloudflare_account_id`)

### Verify Deployment

```bash
# List workers
npx wrangler deployments list

# View worker logs
npx wrangler tail
```

## Manual Builder App Deployment

The Builder app is automatically deployed via Cloudflare Pages integration. Manual deployment is typically not needed, but if required:

1. Build the application:
   ```bash
   cd apps/builder
   npm run build
   ```

2. Deploy via Cloudflare Pages dashboard or Wrangler:
   ```bash
   npx wrangler pages deploy dist
   ```

## Troubleshooting

### Authentication Issues

- **GCP**: Verify `gcloud auth login` completed successfully
- **Cloudflare**: Check API token is valid and has required permissions
- **Service Account**: Ensure GCP service account key is valid

### Build Failures

- Check Docker image builds successfully locally
- Verify all dependencies are installed
- Check for environment-specific configuration issues

### Deployment Failures

- Verify target services exist (Cloud Run service, Worker)
- Check IAM permissions for service accounts
- Review deployment logs for specific errors

## Related Documentation

- [Deployment Overview](./overview.md) - Automated deployment workflow
- [Cloudflare Setup](./cloudflare-setup.md) - Cloudflare configuration
- [Troubleshooting](../operations/troubleshooting/README.md) - Common issues

