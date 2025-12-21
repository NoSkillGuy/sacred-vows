# Cloudflare Resources Module

This Terraform module manages Cloudflare resources for the Sacred Vows application, including:

- **DNS Records**: CNAME records for API endpoints
- **R2 Buckets**: Storage for published sites
- **Workers**: (Optional) Edge worker for published sites (managed separately via wrangler)

**Note:** Cloudflare Pages for the builder app is managed manually via the Cloudflare UI, not through Terraform.

## Resources Created

### DNS Records
- Creates CNAME record for API endpoint pointing to Google Cloud Run
- Enables Cloudflare proxy (orange cloud) for DDoS protection and CDN

### R2 Buckets
- **Published Sites Bucket**: Created if `r2_bucket_name` is set
  - Used for storing published site artifacts
  - Location: `APAC` (Asia Pacific) by default
  
- **Public Assets Bucket**: Created if `public_assets_r2_bucket_name` is set
  - Used for storing default images, layouts, and music files
  - Location: `APAC` (Asia Pacific) by default
  - **Custom Domain**: Can be configured via Cloudflare Dashboard (see R2 Custom Domain Setup below)

### Workers
- Worker script is commented out by default (requires TypeScript compilation)
- Deploy worker separately using `wrangler` (see `apps/edge-worker/`)

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with your domain added
2. **Cloudflare API Token**: Create an API token with appropriate permissions:
   - Zone:Edit
   - Account:Workers:Edit (if using workers)
   - Account:Cloudflare R2:Edit (if using R2 buckets)
   
   Set it as an environment variable:
   ```bash
   export CLOUDFLARE_API_TOKEN="your-api-token-here"
   ```

3. **Cloudflare Account ID**: Get it from the Cloudflare dashboard (right sidebar when viewing your domain)

4. **Google Cloud Run Domain Mapping**: Deploy your API first and get the CNAME target:
   ```bash
   gcloud run domain-mappings describe api.dev.sacredvows.io \
     --region asia-south1 \
     --project=sacred-vows
   ```
   Look for the "target" field (usually `ghs.googlehosted.com`)

## Usage

The module is automatically included in dev and prod environments. Configure it via `terraform.tfvars`:

```hcl
cloudflare_account_id = "your-account-id"
cloudflare_zone_name  = "sacredvows.io"
cloudflare_api_subdomain = "api.dev"  # or "api" for prod
cloudflare_api_cname_target = "ghs.googlehosted.com"
```

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `cloudflare_account_id` | Cloudflare Account ID | Required |
| `zone_name` | Cloudflare zone name (domain) | `"sacredvows.io"` |
| `environment` | Environment name (dev, prod) | Required |
| `api_subdomain` | API subdomain for DNS | Required |
| `api_cname_target` | CNAME target from Cloud Run | Required |
| `published_base_domain` | Published sites base domain | `"sacredvows.io"` |
| `r2_bucket_name` | R2 bucket name (optional) | `""` |
| `r2_bucket_location` | R2 bucket location | `"APAC"` |
| `enable_worker_route` | Enable worker route | `true` |
| `resolve_cache_ttl_seconds` | Cache TTL for worker resolve | `"30"` |
| `public_assets_r2_bucket_name` | R2 bucket name for public assets | `""` |
| `public_assets_cdn_target` | CNAME target for R2 custom domain | `""` |
| `skip_worker_route_if_exists` | Skip creating worker route if exists | `false` |

## Outputs

- `api_dns_record_id`: API DNS record ID
- `api_dns_record_name`: API DNS record name
- `zone_id`: Cloudflare zone ID
- `r2_bucket_name`: R2 bucket name (if created)
- `worker_script_name`: Worker script name
- `worker_route_pattern`: Worker route pattern (if enabled)
- `public_assets_r2_bucket_name`: Public assets R2 bucket name (if created)
- `public_assets_cdn_dns_record_id`: Public assets CDN DNS record ID (if created)
- `public_assets_cdn_domain`: Public assets CDN domain name

## Worker Deployment

The worker is managed separately via `wrangler`:

```bash
cd apps/edge-worker
npx wrangler deploy
```

To manage the worker via Terraform, you'll need to:
1. Compile the TypeScript to JavaScript
2. Uncomment the worker resources in `main.tf`
3. Update the content path to point to the compiled JS

## DNS Configuration

The module automatically creates DNS records with Cloudflare proxy enabled. This provides:
- DDoS protection
- CDN caching
- Automatic SSL/TLS
- IP hiding

## R2 Custom Domain Setup (Public Assets)

To serve public assets (default images, layouts, music) directly from R2 via a custom domain:

### Step 1: Configure Custom Domain in Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **R2** → Select your public assets bucket
   - Dev: `sacred-vows-public-assets-dev`
   - Prod: `sacred-vows-public-assets-prod`

2. Navigate to **Settings** → **Custom Domain**

3. Click **Add Custom Domain** and enter:
   - **Dev**: `pub-dev.sacredvows.io`
   - **Prod**: `pub.sacredvows.io`

4. Cloudflare will automatically:
   - Create the DNS record (CNAME)
   - Provision SSL certificate
   - Configure routing

### Step 2: Get CNAME Target

After configuring the custom domain, Cloudflare will provide a CNAME target (usually `{domain}.cdn.cloudflare.net`).

### Step 3: Update Terraform Configuration

Add the CNAME target to your `terraform.tfvars`:

```hcl
# For dev
cloudflare_public_assets_r2_bucket_name = "sacred-vows-public-assets-dev"
cloudflare_public_assets_cdn_target = "pub-dev.sacredvows.io.cdn.cloudflare.net"  # Get from dashboard

# For prod
cloudflare_public_assets_r2_bucket_name = "sacred-vows-public-assets-prod"
cloudflare_public_assets_cdn_target = "pub.sacredvows.io.cdn.cloudflare.net"  # Get from dashboard
```

### Step 4: Apply Terraform

```bash
cd infra/terraform/dev  # or prod
terraform plan
terraform apply
```

This will create/manage the DNS record via Terraform for consistency.

### Step 5: Verify Setup

Test that assets are accessible:

```bash
# Should return 200 OK
curl -I https://pub-dev.sacredvows.io/defaults/couple2/groom/1.jpeg
```

**Note**: DNS propagation and SSL certificate provisioning may take 5-10 minutes.

## Troubleshooting

### Worker Route Already Exists Error

If you get an error: `A route with the same pattern already exists`, you have two options:

**Option 1: Import the existing route (Recommended)**
```bash
# First, get the route ID from Cloudflare API
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/workers/routes" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"

# Then import it (replace {zone_id} and {route_id} with actual values)
cd infra/terraform/dev  # or prod
terraform import 'module.cloudflare_resources.cloudflare_workers_route.published_sites[0]' {zone_id}/{route_id}
```

**Option 2: Skip route creation**
Add to your `terraform.tfvars`:
```hcl
skip_worker_route_if_exists = true
```
Note: This skips creation but Terraform won't manage the existing route.

### DNS Not Resolving
- Wait for DNS propagation (can take up to 48 hours)
- Verify the CNAME target is correct
- Check that proxy is enabled (orange cloud)

### API Not Accessible
- Verify Cloud Run domain mapping exists
- Check DNS record points to correct target
- Ensure Cloudflare proxy is enabled

## Related Documentation

- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

