# Terraform Infrastructure for Sacred Vows

This directory contains Terraform configuration for deploying the Sacred Vows API to Google Cloud Platform (GCP). The infrastructure includes Cloud Run for serverless API hosting, Firestore for the database, and Cloud Storage for asset management.

## Overview

The Terraform configuration provisions:

- **Cloud Run Service**: Serverless container hosting for the `api-go` service
- **Firestore Database**: Native mode NoSQL database
- **Cloud Storage Bucket**: For uploaded assets (images, etc.)
- **Artifact Registry**: Docker image repository
- **Service Accounts & IAM**: Proper permissions for Cloud Run
- **Secret Manager**: Secure storage for JWT secrets and HMAC keys
- **Domain Mapping**: Custom domain configuration for `api.sacredvows.io`

## Structure

```
infra/terraform/
├── modules/
│   └── gcp-resources/    # Reusable module for GCP resources
│       ├── main.tf        # Resource definitions
│       ├── variables.tf   # Module variables
│       └── outputs.tf     # Module outputs
├── dev/                   # Dev environment
│   ├── main.tf            # Dev module instantiation
│   ├── variables.tf       # Dev-specific variables
│   ├── terraform.tfvars   # Dev configuration (not in git)
│   └── terraform.tfvars.example  # Example dev config
├── prod/                  # Prod environment
│   ├── main.tf            # Prod module instantiation
│   ├── variables.tf       # Prod-specific variables
│   ├── terraform.tfvars   # Prod configuration (not in git)
│   └── terraform.tfvars.example  # Example prod config
├── main.tf                # Root provider configuration
├── variables.tf           # Root variables
├── outputs.tf             # Root outputs
├── README.md              # This file
└── DEPLOYMENT.md          # Detailed deployment guide
```

## Prerequisites

1. **GCP Project**: Create a GCP project (e.g., `sacred-vows`)
2. **Enable APIs**: Enable required GCP APIs:
   ```bash
   gcloud services enable \
     cloudbuild.googleapis.com \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     firestore.googleapis.com \
     storage.googleapis.com \
     secretmanager.googleapis.com \
     --project=sacred-vows
   ```

3. **Terraform State Backend**: Create a **single** GCS bucket for Terraform state (shared by dev and prod):
   ```bash
   # Create bucket (only need to do this once)
   gsutil mb -p sacred-vows gs://sacred-vows-terraform-state
   gsutil versioning set on gs://sacred-vows-terraform-state
   ```
   
   **Note:** One bucket is sufficient. Dev and prod use different prefixes to separate state files.

4. **Authentication**: Authenticate with GCP:
   ```bash
   gcloud auth application-default login
   gcloud config set project sacred-vows
   ```

5. **Terraform**: Install Terraform (>= 1.0)

## Quick Start

### 1. Configure Environment Variables

Copy the example tfvars files and edit with your values:

```bash
cd dev  # or prod
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your configuration:
- `project_id`: Your GCP project ID (e.g., `sacred-vows`)
- `api_domain`: API domain (e.g., `api.dev.sacredvows.io` for dev)
- `google_client_id` / `google_client_secret`: Google OAuth credentials

### 2. Configure Terraform Backend

The backend is configured per environment using different prefixes. You have two options:

**Option A: Using Backend Configuration Files (Recommended)**

Create `infra/terraform/dev/backend.tf`:
```hcl
terraform {
  backend "gcs" {
    bucket = "sacred-vows-terraform-state"
    prefix = "terraform/state/dev"
  }
}
```

Create `infra/terraform/prod/backend.tf`:
```hcl
terraform {
  backend "gcs" {
    bucket = "sacred-vows-terraform-state"
    prefix = "terraform/state/prod"
  }
}
```

**Option B: Using Backend Config Flags**

Configure during `terraform init`:
```bash
# For dev
cd dev
terraform init \
  -backend-config="bucket=sacred-vows-terraform-state" \
  -backend-config="prefix=terraform/state/dev"

# For prod
cd prod
terraform init \
  -backend-config="bucket=sacred-vows-terraform-state" \
  -backend-config="prefix=terraform/state/prod"
```

### 3. Create Secrets

Before deploying, create secrets in Secret Manager:

```bash
# JWT Secret
echo -n "your-secure-jwt-secret-min-32-chars" | \
  gcloud secrets create jwt-secret-dev --data-file=- --project=sacred-vows

# Refresh Token HMAC Keys (JSON array)
echo -n '[{"id":1,"key_b64":"base64-encoded-32-byte-or-more-key"}]' | \
  gcloud secrets create refresh-token-hmac-keys-dev --data-file=- --project=sacred-vows

# Active HMAC Key ID
echo -n "1" | \
  gcloud secrets create refresh-token-hmac-active-key-id-dev --data-file=- --project=sacred-vows
```

Repeat for `prod` environment (replace `-dev` with `-prod`).

### 4. Initialize and Deploy

```bash
# Initialize Terraform
terraform init

# Review changes
terraform plan

# Apply changes
terraform apply
```

## Configuration

### Environment-Specific Settings

**Dev Environment** (`dev/terraform.tfvars`):
- Lower resource allocation (200m CPU, 256Mi memory)
- Cost-optimized for development
- Separate subdomain: `api.dev.sacredvows.io`
- `force_destroy` enabled on GCS bucket

**Prod Environment** (`prod/terraform.tfvars`):
- Production-ready settings
- Main domain: `api.sacredvows.io`
- Higher scaling limits
- `force_destroy` disabled for safety

### Key Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `project_id` | GCP Project ID | `sacred-vows` |
| `region` | GCP Region | `asia-south1` (Mumbai) |
| `environment` | Environment name | `dev` or `prod` |
| `api_domain` | API domain | `api.sacredvows.io` |
| `builder_domain` | Builder domain | `sacredvows.io` |
| `published_base_domain` | Published sites base | `sacredvows.io` |
| `min_instances` | Min Cloud Run instances | `0` (scale to zero) |
| `max_instances` | Max Cloud Run instances | `5` (dev) or `10` (prod) |
| `cpu` | CPU allocation | `200m` (0.2 CPU) |
| `memory` | Memory allocation | `256Mi` |
| `timeout_seconds` | Request timeout | `300` |

### Cost Optimization

The configuration is optimized for cost:

- **CPU**: `200m` (0.2 CPU) - sufficient for most workloads
- **Memory**: `256Mi` - minimal memory allocation
- **Min Instances**: `0` - scales to zero when idle
- **Region**: `asia-south1` (Mumbai) - lower costs in India

Adjust these values in `terraform.tfvars` based on your traffic patterns.

## Deployment

### Dev Environment

```bash
cd dev
terraform init
terraform plan
terraform apply
```

### Prod Environment

```bash
cd prod
terraform init
terraform plan
terraform apply
```

### Building and Pushing Container

After infrastructure is created, build and push your container:

```bash
# Build container image
cd ../../apps/api-go
gcloud builds submit --tag asia-south1-docker.pkg.dev/sacred-vows/api-dev/api-go:latest

# Or deploy directly (Terraform will manage the service)
gcloud run deploy api-go-dev \
  --image asia-south1-docker.pkg.dev/sacred-vows/api-dev/api-go:latest \
  --region asia-south1 \
  --platform managed
```

## DNS Configuration

After deployment, configure DNS:

1. **Get Cloud Run domain mapping**:
   ```bash
   gcloud run domain-mappings describe api.sacredvows.io --region asia-south1
   ```

2. **Add CNAME record** in your DNS provider:
   - Name: `api` (or `api.dev` for dev)
   - Value: Cloud Run domain mapping (from step 1)
   - TTL: 3600

3. **Wait for DNS propagation** (can take up to 48 hours)

## Resources Created

### Cloud Run
- Service: `api-go-dev` / `api-go-prod`
- Auto-scaling: 0 to configured max instances
- Custom domain mapping
- Service account with proper IAM roles

### Firestore
- Database: `(default)` in Native mode
- Location: `asia-south1`
- Concurrency: Optimistic

### Cloud Storage
- Bucket: `{project-id}-assets-{environment}`
- CORS configured for builder and published sites
- Lifecycle rule: Delete objects after 90 days

### Artifact Registry
- Repository: `api-dev` / `api-prod`
- Format: Docker
- Location: `asia-south1`

### Secret Manager
- `jwt-secret-{environment}`
- `refresh-token-hmac-keys-{environment}`
- `refresh-token-hmac-active-key-id-{environment}`

## Outputs

After deployment, Terraform outputs:

- `cloud_run_service_url`: Cloud Run service URL
- `cloud_run_service_name`: Service name
- `artifact_registry_repository`: Artifact Registry repo name
- `gcs_assets_bucket`: GCS bucket name
- `firestore_database`: Firestore database name
- `service_account_email`: Service account email

View outputs:
```bash
terraform output
```

## Environment Variables in Cloud Run

Terraform automatically sets these environment variables in Cloud Run:

- `GCP_PROJECT_ID`: GCP project ID
- `FIRESTORE_DATABASE`: Firestore database name
- `GCS_ASSETS_BUCKET`: GCS bucket for assets
- `PUBLIC_ASSETS_BASE_URL`: Public URL base for assets
- `PUBLISHED_BASE_DOMAIN`: Base domain for published sites
- `FRONTEND_URL`: Frontend URL (builder)
- `JWT_SECRET`: From Secret Manager
- `REFRESH_TOKEN_HMAC_KEYS`: From Secret Manager
- `REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID`: From Secret Manager
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_REDIRECT_URI`: OAuth redirect URI
- `PORT`: Server port (8080)
- `PUBLISH_ARTIFACT_STORE`: "r2" (for published artifacts)

## Database Configuration

The application supports both Postgres and Firestore. To use Firestore:

1. Set `DATABASE_TYPE=firestore` in Cloud Run environment variables (or via Terraform)
2. Ensure `GCP_PROJECT_ID` and `FIRESTORE_DATABASE` are set
3. The application will automatically use Firestore repositories

## Troubleshooting

### Cloud Run Service Won't Start

```bash
# Check logs
gcloud run services logs read api-go-dev --region asia-south1 --limit 50

# Verify service account permissions
gcloud projects get-iam-policy sacred-vows \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:api-go-dev@sacred-vows.iam.gserviceaccount.com"
```

Common issues:
- Missing secrets in Secret Manager
- Service account lacks required IAM roles
- Firestore database not created
- Invalid environment variables

### Firestore Connection Issues

- Verify `GCP_PROJECT_ID` is set correctly
- Check service account has `roles/datastore.user` role
- Ensure Firestore database exists in `asia-south1` region
- Verify database name matches `FIRESTORE_DATABASE` env var

### DNS Not Working

- Verify domain mapping exists: `gcloud run domain-mappings list --region asia-south1`
- Check DNS records point to correct Cloud Run domain
- Wait for DNS propagation (up to 48 hours)
- Test with: `curl -H "Host: api.sacredvows.io" https://api.sacredvows.io/health`

### Terraform State Issues

If state is locked or corrupted:

```bash
# Force unlock (use with caution)
terraform force-unlock LOCK_ID

# Check state
terraform state list
terraform state show <resource>
```

## Updating Infrastructure

To update resources:

```bash
# Review changes
terraform plan

# Apply changes
terraform apply

# For specific resources
terraform apply -target=module.gcp_resources.google_cloud_run_v2_service.api
```

## Destroying Infrastructure

⚠️ **Warning**: This will delete all resources!

```bash
terraform destroy
```

For dev environment, GCS bucket can be force-destroyed. For prod, manually delete the bucket after destroying other resources.

## Security Best Practices

1. **Never commit** `terraform.tfvars` files (they contain secrets)
2. **Use Secret Manager** for sensitive values (JWT secrets, OAuth credentials)
3. **Rotate secrets** regularly
4. **Limit IAM permissions** to minimum required
5. **Enable audit logs** for production
6. **Use separate projects** for dev and prod if possible

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [GCP Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firestore Documentation](https://cloud.google.com/firestore/docs)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

## Support

For issues or questions:
1. Check logs: `gcloud run services logs read api-go-dev --region asia-south1`
2. Review Terraform state: `terraform state list`
3. Check GCP Console for resource status

