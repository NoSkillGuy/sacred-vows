# Cloudflare Terraform Setup Guide

This guide explains how to use Terraform to manage Cloudflare resources for the Sacred Vows builder app.

## What Was Added

Terraform now manages:
- ✅ **Cloudflare Pages** - Builder app deployment
- ✅ **DNS Records** - CNAME records for API endpoints
- ✅ **R2 Buckets** - Storage for published sites
- ✅ **Workers** - Edge worker for published sites (automatically built and deployed)

## Quick Start

### 1. Get Your Cloudflare Credentials

**Account ID:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain (`sacredvows.io`)
3. Find Account ID in the right sidebar

**API Token:**
1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit zone DNS" template or create custom token with:
   - Zone:Edit
   - Account:Cloudflare Pages:Edit
   - Account:Workers:Edit
   - Account:Cloudflare R2:Edit
4. Copy the token

```bash
export CLOUDFLARE_API_TOKEN="your-api-token-here"
```

### 2. Get Google Cloud Run CNAME Target

After deploying your API to Cloud Run, get the domain mapping target:

```bash
# For dev (asia-northeast1)
gcloud run domain-mappings describe api.dev.sacredvows.io \
  --region asia-northeast1 \
  --project=sacred-vows

# For prod
gcloud run domain-mappings describe api.sacredvows.io \
  --region asia-northeast1 \
  --project=sacred-vows
```

Look for the `target` field (usually `ghs.googlehosted.com` or similar).

### 3. Configure Terraform

Update your `terraform.tfvars` files:

**For dev (`infra/terraform/dev/terraform.tfvars`):**
```hcl
# ... existing GCP variables ...

# Cloudflare Configuration
cloudflare_account_id = "your-cloudflare-account-id"
cloudflare_zone_name  = "sacredvows.io"
cloudflare_api_subdomain = "api.dev"
cloudflare_api_cname_target = "ghs.googlehosted.com"  # From step 2

# R2 and Worker Configuration
cloudflare_r2_bucket_name = "sacred-vows-published-dev"
cloudflare_r2_bucket_location = "APAC"  # Asia Pacific (matches asia-northeast1)
cloudflare_enable_worker_route = true
```

**For prod (`infra/terraform/prod/terraform.tfvars`):**
```hcl
# ... existing GCP variables ...

# Cloudflare Configuration
cloudflare_account_id = "your-cloudflare-account-id"
cloudflare_zone_name  = "sacredvows.io"
cloudflare_api_subdomain = "api"
cloudflare_api_cname_target = "ghs.googlehosted.com"  # From step 2

# R2 and Worker Configuration
cloudflare_r2_bucket_name = "sacred-vows-published-prod"
cloudflare_r2_bucket_location = "APAC"  # Asia Pacific (matches asia-northeast1)
cloudflare_enable_worker_route = true
```

### 4. Initialize and Apply

```bash
# For dev
cd infra/terraform/dev
terraform init  # This will download the Cloudflare provider
terraform plan  # Review changes
terraform apply # Create resources

# For prod
cd infra/terraform/prod
terraform init
terraform plan
terraform apply
```

## What Gets Created

### Cloudflare Pages
- Project: `dev-builder` or `prod-builder`
- Build configuration: `cd apps/builder && npm ci && npm run build`
- Output directory: `apps/builder/dist`
- Environment variables: `VITE_API_URL` set automatically
- Custom domain: `dev.sacredvows.io` or `sacredvows.io`

### DNS Records
- CNAME record: `api.dev` or `api` → Cloud Run domain mapping
- Proxy enabled (orange cloud) for DDoS protection and CDN

### R2 Buckets
- Bucket: `sacred-vows-published-dev` or `sacred-vows-published-prod`
- Location: `APAC` (Asia Pacific) - matches your `asia-northeast1` deployment
- Used for storing published site artifacts

### Workers
- Worker script: `dev-published-sites` or `prod-published-sites`
- Automatically built from TypeScript source using esbuild
- Routes: `*.dev.sacredvows.io/*` or `*.sacredvows.io/*` for published sites
- Binds to R2 bucket for artifact storage

## Next Steps After Terraform Apply

### 1. Connect GitHub Repository to Pages

Terraform creates the Pages project, but you need to connect it to GitHub:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Workers & Pages → Your project (`dev-builder` or `prod-builder`)
3. Click "Connect to Git"
4. Authorize GitHub and select your repository
5. The build settings are already configured via Terraform

### 2. Verify Deployment

- Pages will automatically deploy on push to the production branch
- Check deployment status in Cloudflare dashboard
- Visit your custom domain to verify it's working

### 3. Worker and R2 Bucket

The worker and R2 bucket are automatically created by Terraform:

- **R2 Bucket**: Created with the name specified in `cloudflare_r2_bucket_name`
- **Worker**: Automatically built from TypeScript and deployed
  - The worker TypeScript is compiled to JavaScript using esbuild
  - No manual build step required - Terraform handles it
  - Worker is bound to the R2 bucket automatically
  - Worker route is created for wildcard subdomain pattern

**Note**: The worker build requires:
- Node.js and npm installed
- `esbuild` package (automatically installed via `npm install` in the worker directory)

## Troubleshooting

### Pages Build Fails
- Check build logs in Cloudflare Pages dashboard
- Verify the build command works locally: `cd apps/builder && npm ci && npm run build`
- Ensure environment variables are set correctly

### DNS Not Resolving
- Wait for DNS propagation (can take up to 48 hours)
- Verify CNAME target is correct: `dig api.dev.sacredvows.io`
- Check that proxy is enabled (orange cloud in Cloudflare dashboard)

### API Not Accessible
- Verify Cloud Run domain mapping exists
- Check DNS record in Cloudflare dashboard
- Ensure Cloudflare proxy is enabled

### Worker Build Fails
- Ensure Node.js and npm are installed
- Check that `apps/edge-worker/package.json` has `esbuild` as a dependency
- Run `cd apps/edge-worker && npm install` manually if needed
- Verify the build script in `package.json` is correct

### R2 Bucket Issues
- Verify bucket name is unique (not already exists)
- Check R2 location is valid: `APAC`, `WEUR`, `WNAM`, or `ENAM`
- Ensure API token has `Account:Cloudflare R2:Edit` permission

### Terraform Errors

**"Provider cloudflare not found"**
```bash
terraform init  # Download the provider
```

**"Invalid API token"**
- Verify `CLOUDFLARE_API_TOKEN` environment variable is set
- Check token has correct permissions

**"Zone not found"**
- Verify domain is added to Cloudflare
- Check `cloudflare_zone_name` matches your domain exactly

## Files Changed

- `infra/terraform/main.tf` - Added Cloudflare and null providers
- `infra/terraform/modules/cloudflare-resources/` - New module with:
  - Cloudflare Pages project
  - DNS records
  - R2 bucket
  - Worker script (with automatic build)
  - Worker routes
- `infra/terraform/dev/main.tf` - Added Cloudflare module
- `infra/terraform/dev/variables.tf` - Added Cloudflare variables (including R2 location)
- `infra/terraform/dev/terraform.tfvars.example` - Added example config
- `infra/terraform/prod/main.tf` - Added Cloudflare module
- `infra/terraform/prod/variables.tf` - Added Cloudflare variables (including R2 location)
- `infra/terraform/prod/terraform.tfvars.example` - Added example config
- `apps/edge-worker/package.json` - Added esbuild and build script
- `.gitignore` - Added worker bundle file

## Benefits

✅ **Infrastructure as Code** - Version control for Cloudflare config
✅ **Consistency** - Same config across dev/prod
✅ **Automation** - No manual DNS/Pages/Worker/R2 configuration
✅ **State Management** - Terraform tracks all changes
✅ **Automatic Worker Build** - TypeScript worker is automatically compiled and deployed
✅ **Regional Optimization** - R2 bucket location matches your GCP region (APAC for asia-northeast1)

## Related Documentation

- [Cloudflare Module README](./modules/cloudflare-resources/README.md)
- [Main Terraform README](./README.md)
- [Cloudflare Setup Guide](../../docs/cloudflare-setup.md)

