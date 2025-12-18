# Cloudflare Resources Module

This Terraform module manages Cloudflare resources for the Sacred Vows application, including:

- **Cloudflare Pages**: Deployment of the builder app
- **DNS Records**: CNAME records for API endpoints
- **Workers**: (Optional) Edge worker for published sites (managed separately via wrangler)

## Resources Created

### Cloudflare Pages Project
- Creates a Pages project for the builder app
- Configures build settings (build command, output directory)
- Sets up environment variables for preview and production deployments
- Configures custom domain

### DNS Records
- Creates CNAME record for API endpoint pointing to Google Cloud Run
- Enables Cloudflare proxy (orange cloud) for DDoS protection and CDN

### Workers
- Worker script is commented out by default (requires TypeScript compilation)
- Deploy worker separately using `wrangler` (see `apps/edge-worker/`)

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with your domain added
2. **Cloudflare API Token**: Create an API token with appropriate permissions:
   - Zone:Edit
   - Account:Cloudflare Pages:Edit
   - Account:Workers:Edit (if using workers)
   
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
| `api_url` | Full API URL with /api suffix | Required |
| `api_subdomain` | API subdomain for DNS | Required |
| `api_cname_target` | CNAME target from Cloud Run | Required |
| `builder_domain` | Builder app domain | Required |
| `production_branch` | Production branch for Pages | `"main"` |
| `node_version` | Node.js version for build | `"18"` |
| `r2_bucket_name` | R2 bucket name (optional) | `""` |
| `enable_worker_route` | Enable worker route | `true` |

## Outputs

- `pages_project_name`: Cloudflare Pages project name
- `pages_project_url`: Pages project URL
- `pages_domain`: Custom domain for Pages
- `api_dns_record_id`: API DNS record ID
- `api_dns_record_name`: API DNS record name
- `zone_id`: Cloudflare zone ID

## Cloudflare Pages Setup

After applying Terraform, you still need to:

1. **Connect GitHub Repository**:
   - Go to Cloudflare Dashboard → Pages → Your project
   - Click "Connect to Git"
   - Authorize GitHub and select your repository
   - The build settings are already configured via Terraform

2. **Verify Deployment**:
   - Pages will automatically deploy on push to the production branch
   - Check the deployment status in the Cloudflare dashboard

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

## Troubleshooting

### Pages Build Fails
- Check build logs in Cloudflare Pages dashboard
- Verify `build_command` and `destination_dir` are correct
- Ensure environment variables are set correctly

### DNS Not Resolving
- Wait for DNS propagation (can take up to 48 hours)
- Verify the CNAME target is correct
- Check that proxy is enabled (orange cloud)

### API Not Accessible
- Verify Cloud Run domain mapping exists
- Check DNS record points to correct target
- Ensure Cloudflare proxy is enabled

## Related Documentation

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

