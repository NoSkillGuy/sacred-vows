# Deployment Guide - Sacred Vows GCP Infrastructure

This guide provides detailed step-by-step instructions for deploying the Sacred Vows API to Google Cloud Platform for both **dev** and **prod** environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Dev Environment Deployment](#dev-environment-deployment)
4. [Prod Environment Deployment](#prod-environment-deployment)
5. [Building and Deploying Container Images](#building-and-deploying-container-images)
6. [DNS Configuration](#dns-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Updating Deployments](#updating-deployments)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. GCP Account and Project

- **GCP Account**: Active Google Cloud Platform account
- **Project ID**: `sacred-vows` (or your preferred project ID)
- **Billing**: Billing account linked to the project

### 2. Required Tools

Install the following tools:

```bash
# Google Cloud SDK
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install

# Terraform (>= 1.0)
# macOS
brew install terraform

# Or download from: https://www.terraform.io/downloads

# Docker (for building containers)
# macOS
brew install docker

# Verify installations
gcloud --version
terraform --version
docker --version
```

### 3. Authentication

Authenticate with GCP:

```bash
# Login to GCP
gcloud auth login

# Set default project
gcloud config set project sacred-vows

# Set default region
gcloud config set compute/region asia-south1

# Enable Application Default Credentials (for Terraform)
gcloud auth application-default login
```

### 4. Enable Required APIs

Enable all required GCP APIs:

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  --project=sacred-vows
```

Verify APIs are enabled:

```bash
gcloud services list --enabled --project=sacred-vows
```

### 5. Create Terraform State Bucket

Create a **single** GCS bucket for Terraform state (shared by both dev and prod environments):

```bash
# Create bucket (only need to do this once)
gsutil mb -p sacred-vows gs://sacred-vows-terraform-state

# Enable versioning (for state backup)
gsutil versioning set on gs://sacred-vows-terraform-state

# Verify bucket exists
gsutil ls -b gs://sacred-vows-terraform-state
```

**Note:** You only need **one bucket** for both dev and prod. Terraform will use different prefixes to separate the state files:
- Dev state: `gs://sacred-vows-terraform-state/terraform/state/dev/default.tfstate`
- Prod state: `gs://sacred-vows-terraform-state/terraform/state/prod/default.tfstate`

---

## Initial Setup

### 1. Configure Terraform Backend

The backend is configured during `terraform init` using backend configuration flags. This allows different prefixes for dev and prod while using the same bucket.

**For Dev Environment:**

```bash
cd infra/terraform/dev

# Initialize Terraform with dev-specific backend prefix
terraform init \
  -backend-config="bucket=sacred-vows-terraform-state" \
  -backend-config="prefix=terraform/state/dev"
```

**For Prod Environment:**

```bash
cd infra/terraform/prod

# Initialize Terraform with prod-specific backend prefix
terraform init \
  -backend-config="bucket=sacred-vows-terraform-state" \
  -backend-config="prefix=terraform/state/prod"
```

**Alternative: Using Backend Configuration Files**

You can also create backend configuration files to avoid typing the flags each time:

**Create `infra/terraform/dev/backend.tf`:**
```hcl
terraform {
  backend "gcs" {
    bucket = "sacred-vows-terraform-state"
    prefix = "terraform/state/dev"
  }
}
```

**Create `infra/terraform/prod/backend.tf`:**
```hcl
terraform {
  backend "gcs" {
    bucket = "sacred-vows-terraform-state"
    prefix = "terraform/state/prod"
  }
}
```

Then simply run `terraform init` in each directory.

**Note:** The root `infra/terraform/main.tf` has the backend commented out. Each environment (dev/prod) should have its own backend configuration with a unique prefix.

### 2. Generate HMAC Keys for Refresh Tokens

Generate secure HMAC keys for refresh token signing:

```bash
# Generate a 32-byte key and encode to base64
openssl rand -base64 32

# Example output: "xK9mP2vQ7wR4tY8uI0oP3qW5eR6tY9uI0oP1a="
```

Save this key - you'll need it for the secrets.

### 3. Prepare Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - Dev: `https://api.dev.sacredvows.io/api/auth/google/callback`
   - Prod: `https://api.sacredvows.io/api/auth/google/callback`
4. Save the Client ID and Client Secret

---

## Dev Environment Deployment

### Step 1: Configure Dev Variables

```bash
cd infra/terraform/dev

# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
# Use your preferred editor (nano, vim, code, etc.)
nano terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
project_id = "sacred-vows"
region     = "asia-south1"  # Mumbai, India
environment = "dev"

api_domain           = "api.dev.sacredvows.io"
builder_domain       = "dev.sacredvows.io"
published_base_domain = "dev.sacredvows.io"

min_instances = 0
max_instances = 5
cpu          = "200m"  # 200 millicores (0.2 CPU) - cost optimized for dev
memory       = "256Mi"  # Reduced memory for cost optimization
timeout_seconds = 300

google_client_id     = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
google_client_secret = "YOUR_GOOGLE_CLIENT_SECRET"
```

**Important**: Never commit `terraform.tfvars` to git (it contains secrets).

### Step 2: Create Dev Secrets

Create secrets in Secret Manager for dev environment:

```bash
# JWT Secret (minimum 32 characters)
echo -n "your-secure-jwt-secret-minimum-32-characters-long" | \
  gcloud secrets create jwt-secret-dev \
    --data-file=- \
    --project=sacred-vows \
    --replication-policy="automatic"

# Refresh Token HMAC Keys (JSON array)
# Replace "xK9mP2vQ7wR4tY8uI0oP3qW5eR6tY9uI0oP1a=" with your generated key
echo -n '[{"id":1,"key_b64":"xK9mP2vQ7wR4tY8uI0oP3qW5eR6tY9uI0oP1a="}]' | \
  gcloud secrets create refresh-token-hmac-keys-dev \
    --data-file=- \
    --project=sacred-vows \
    --replication-policy="automatic"

# Active HMAC Key ID
echo -n "1" | \
  gcloud secrets create refresh-token-hmac-active-key-id-dev \
    --data-file=- \
    --project=sacred-vows \
    --replication-policy="automatic"
```

Verify secrets were created:

```bash
gcloud secrets list --project=sacred-vows | grep dev
```

### Step 3: Initialize Terraform

```bash
cd infra/terraform/dev

# Initialize Terraform (downloads providers, sets up backend)
# If you haven't created backend.tf, use backend-config flags:
terraform init \
  -backend-config="bucket=sacred-vows-terraform-state" \
  -backend-config="prefix=terraform/state/dev"

# If you've already created backend.tf, simply run:
# terraform init

# If prompted about backend migration, type "yes"
```

Expected output:
```
Initializing the backend...
Initializing provider plugins...
Terraform has been successfully initialized!
```

### Step 4: Review Terraform Plan

```bash
# Review what Terraform will create
terraform plan
```

Review the plan carefully. You should see resources like:
- `google_artifact_registry_repository.api`
- `google_firestore_database.database`
- `google_storage_bucket.assets`
- `google_service_account.cloud_run`
- `google_cloud_run_v2_service.api`
- `google_secret_manager_secret.*`
- `google_cloud_run_domain_mapping.api`

### Step 5: Apply Terraform

```bash
# Apply the configuration
terraform apply

# Type "yes" when prompted
```

This will take 5-10 minutes. Terraform will:
1. Create Artifact Registry repository
2. Create Firestore database
3. Create GCS bucket
4. Create service account and IAM bindings
5. Create Secret Manager secrets (if they don't exist)
6. Create Cloud Run service (without container image initially)
7. Create domain mapping

### Step 6: Verify Dev Infrastructure

```bash
# Check Cloud Run service
gcloud run services describe api-go-dev \
  --region asia-south1 \
  --project=sacred-vows

# Check Firestore database
gcloud firestore databases describe --project=sacred-vows

# Check GCS bucket
gsutil ls gs://sacred-vows-assets-dev

# Check Artifact Registry
gcloud artifacts repositories describe api-dev \
  --location=asia-south1 \
  --project=sacred-vows

# View Terraform outputs
terraform output
```

### Step 7: Build and Push Container Image

```bash
# Navigate to api-go directory
cd ../../../apps/api-go

# Build and push container image to Artifact Registry
gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/sacred-vows/api-dev/api-go:latest \
  --project=sacred-vows

# This will:
# 1. Build the Docker image
# 2. Push to Artifact Registry
# 3. Take 5-10 minutes
```

Verify image was pushed:

```bash
gcloud artifacts docker images list \
  asia-south1-docker.pkg.dev/sacred-vows/api-dev \
  --project=sacred-vows
```

### Step 8: Update Cloud Run Service with Image

Terraform should have created the service, but you need to update it with the actual image:

```bash
# Update Cloud Run service with the image
gcloud run services update api-go-dev \
  --image asia-south1-docker.pkg.dev/sacred-vows/api-dev/api-go:latest \
  --region asia-south1 \
  --project=sacred-vows

# Or let Terraform manage it by updating the image reference
cd ../../infra/terraform/dev
terraform apply
```

### Step 9: Configure Dev DNS

Get the Cloud Run domain mapping:

```bash
# Get domain mapping details
gcloud run domain-mappings describe api.dev.sacredvows.io \
  --region asia-south1 \
  --project=sacred-vows

# Or get from Terraform output
terraform output cloud_run_service_url
```

Add DNS records in your DNS provider (e.g., Cloudflare):

1. **CNAME Record**:
   - Name: `api.dev`
   - Target: Cloud Run domain mapping (from above)
   - TTL: 3600 (1 hour)
   - Proxy: Enabled (if using Cloudflare)

2. Wait for DNS propagation (5-60 minutes typically)

3. Verify DNS:

```bash
# Check DNS resolution
dig api.dev.sacredvows.io

# Test HTTPS endpoint
curl -I https://api.dev.sacredvows.io/health
```

### Step 10: Verify Dev Deployment

```bash
# Check service logs
gcloud run services logs read api-go-dev \
  --region asia-south1 \
  --project=sacred-vows \
  --limit 50

# Test health endpoint
curl https://api.dev.sacredvows.io/health

# Expected: {"status":"ok"}

# Test API endpoint
curl https://api.dev.sacredvows.io/api/layouts

# Should return layout list
```

---

## Prod Environment Deployment

### Step 1: Configure Prod Variables

```bash
cd infra/terraform/prod

# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
nano terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
project_id = "sacred-vows"
region     = "asia-south1"  # Mumbai, India
environment = "prod"

api_domain           = "api.sacredvows.io"
builder_domain       = "sacredvows.io"
published_base_domain = "sacredvows.io"

min_instances = 0
max_instances = 10
cpu          = "200m"  # 200 millicores (0.2 CPU) - cost optimized
memory       = "256Mi"  # Reduced memory for cost optimization
timeout_seconds = 300

google_client_id     = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
google_client_secret = "YOUR_GOOGLE_CLIENT_SECRET"
```

**Note**: Use the same Google OAuth credentials or create separate ones for prod.

### Step 2: Create Prod Secrets

```bash
# JWT Secret (use a DIFFERENT secret for prod)
echo -n "your-different-secure-jwt-secret-for-prod-min-32-chars" | \
  gcloud secrets create jwt-secret-prod \
    --data-file=- \
    --project=sacred-vows \
    --replication-policy="automatic"

# Refresh Token HMAC Keys (can use same key or generate new one)
echo -n '[{"id":1,"key_b64":"xK9mP2vQ7wR4tY8uI0oP3qW5eR6tY9uI0oP1a="}]' | \
  gcloud secrets create refresh-token-hmac-keys-prod \
    --data-file=- \
    --project=sacred-vows \
    --replication-policy="automatic"

# Active HMAC Key ID
echo -n "1" | \
  gcloud secrets create refresh-token-hmac-active-key-id-prod \
    --data-file=- \
    --project=sacred-vows \
    --replication-policy="automatic"
```

### Step 3: Initialize Terraform

```bash
cd infra/terraform/prod

# Initialize Terraform
# If you haven't created backend.tf, use backend-config flags:
terraform init \
  -backend-config="bucket=sacred-vows-terraform-state" \
  -backend-config="prefix=terraform/state/prod"

# If you've already created backend.tf, simply run:
# terraform init
```

### Step 4: Review and Apply

```bash
# Review plan carefully for production
terraform plan

# Apply (be extra careful in prod!)
terraform apply
```

### Step 5: Build and Push Prod Container

```bash
cd ../../../apps/api-go

# Build and push prod image
gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/sacred-vows/api-prod/api-go:latest \
  --project=sacred-vows
```

### Step 6: Update Prod Service

```bash
gcloud run services update api-go-prod \
  --image asia-south1-docker.pkg.dev/sacred-vows/api-prod/api-go:latest \
  --region asia-south1 \
  --project=sacred-vows
```

### Step 7: Configure Prod DNS

```bash
# Get domain mapping
gcloud run domain-mappings describe api.sacredvows.io \
  --region asia-south1 \
  --project=sacred-vows
```

Add DNS records:

1. **CNAME Record**:
   - Name: `api`
   - Target: Cloud Run domain mapping
   - TTL: 3600
   - Proxy: Enabled

2. Wait for DNS propagation

3. Verify:

```bash
curl -I https://api.sacredvows.io/health
```

### Step 8: Verify Prod Deployment

```bash
# Check logs
gcloud run services logs read api-go-prod \
  --region asia-south1 \
  --project=sacred-vows \
  --limit 50

# Test endpoints
curl https://api.sacredvows.io/health
curl https://api.sacredvows.io/api/layouts
```

---

## Building and Deploying Container Images

### Building Locally

```bash
cd apps/api-go

# Build Docker image locally
docker build -t api-go:latest .

# Test locally
docker run -p 8080:8080 \
  -e GCP_PROJECT_ID=sacred-vows \
  -e DATABASE_TYPE=firestore \
  -e GCS_ASSETS_BUCKET=sacred-vows-assets-dev \
  api-go:latest
```

### Building with Cloud Build

```bash
# Dev environment
gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/sacred-vows/api-dev/api-go:latest \
  --project=sacred-vows

# Prod environment
gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/sacred-vows/api-prod/api-go:latest \
  --project=sacred-vows
```

### Using Version Tags

For production, use version tags instead of `latest`:

```bash
# Build with version tag
VERSION="v1.0.0"
gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/sacred-vows/api-prod/api-go:${VERSION} \
  --project=sacred-vows

# Deploy specific version
gcloud run services update api-go-prod \
  --image asia-south1-docker.pkg.dev/sacred-vows/api-prod/api-go:${VERSION} \
  --region asia-south1 \
  --project=sacred-vows
```

---

## DNS Configuration

### Dev Environment

**Domain**: `api.dev.sacredvows.io`

1. Get Cloud Run domain mapping:
   ```bash
   gcloud run domain-mappings describe api.dev.sacredvows.io \
     --region asia-south1 \
     --project=sacred-vows
   ```

2. Add CNAME record:
   - **Type**: CNAME
   - **Name**: `api.dev`
   - **Target**: `ghs.googlehosted.com` (or the specific mapping from step 1)
   - **TTL**: 3600
   - **Proxy**: Enabled (Cloudflare)

### Prod Environment

**Domain**: `api.sacredvows.io`

1. Get Cloud Run domain mapping:
   ```bash
   gcloud run domain-mappings describe api.sacredvows.io \
     --region asia-south1 \
     --project=sacred-vows
   ```

2. Add CNAME record:
   - **Type**: CNAME
   - **Name**: `api`
   - **Target**: `ghs.googlehosted.com` (or the specific mapping)
   - **TTL**: 3600
   - **Proxy**: Enabled

### Verify DNS

```bash
# Check DNS resolution
dig api.dev.sacredvows.io
dig api.sacredvows.io

# Test HTTPS
curl -I https://api.dev.sacredvows.io/health
curl -I https://api.sacredvows.io/health

# Check SSL certificate
openssl s_client -connect api.sacredvows.io:443 -servername api.sacredvows.io
```

---

## Post-Deployment Verification

### 1. Health Check

```bash
# Dev
curl https://api.dev.sacredvows.io/health

# Prod
curl https://api.sacredvows.io/health

# Expected: {"status":"ok"}
```

### 2. API Endpoints

```bash
# Test layouts endpoint
curl https://api.sacredvows.io/api/layouts

# Test with authentication
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
  https://api.sacredvows.io/api/invitations
```

### 3. Check Logs

```bash
# Dev logs
gcloud run services logs read api-go-dev \
  --region asia-south1 \
  --project=sacred-vows \
  --limit 100

# Prod logs
gcloud run services logs read api-go-prod \
  --region asia-south1 \
  --project=sacred-vows \
  --limit 100
```

### 4. Verify Firestore

```bash
# Check Firestore database
gcloud firestore databases describe --project=sacred-vows

# List collections (via API or console)
# Go to: https://console.cloud.google.com/firestore/databases
```

### 5. Verify GCS Bucket

```bash
# List buckets
gsutil ls gs://sacred-vows-assets-dev
gsutil ls gs://sacred-vows-assets-prod

# Test upload (if needed)
echo "test" | gsutil cp - gs://sacred-vows-assets-dev/test.txt
```

### 6. Check Service Account Permissions

```bash
# Verify service account exists
gcloud iam service-accounts describe \
  api-go-dev@sacred-vows.iam.gserviceaccount.com \
  --project=sacred-vows

# Check IAM bindings
gcloud projects get-iam-policy sacred-vows \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:api-go-dev@sacred-vows.iam.gserviceaccount.com"
```

---

## Updating Deployments

### Update Application Code

1. **Make code changes** in `apps/api-go`

2. **Build new image**:
   ```bash
   cd apps/api-go
   gcloud builds submit \
     --tag asia-south1-docker.pkg.dev/sacred-vows/api-prod/api-go:v1.0.1 \
     --project=sacred-vows
   ```

3. **Update Cloud Run service**:
   ```bash
   gcloud run services update api-go-prod \
     --image asia-south1-docker.pkg.dev/sacred-vows/api-prod/api-go:v1.0.1 \
     --region asia-south1 \
     --project=sacred-vows
   ```

4. **Verify deployment**:
   ```bash
   curl https://api.sacredvows.io/health
   ```

### Update Infrastructure

1. **Modify Terraform files** in `infra/terraform/prod`

2. **Review changes**:
   ```bash
   cd infra/terraform/prod
   terraform plan
   ```

3. **Apply changes**:
   ```bash
   terraform apply
   ```

### Update Secrets

```bash
# Update JWT secret
echo -n "new-jwt-secret" | \
  gcloud secrets versions add jwt-secret-prod \
    --data-file=- \
    --project=sacred-vows

# Cloud Run will automatically use the latest version
```

---

## Troubleshooting

### Cloud Run Service Won't Start

**Symptoms**: Service shows as "Ready" but requests fail or timeout.

**Diagnosis**:
```bash
# Check recent logs
gcloud run services logs read api-go-dev \
  --region asia-south1 \
  --project=sacred-vows \
  --limit 100

# Check service status
gcloud run services describe api-go-dev \
  --region asia-south1 \
  --project=sacred-vows
```

**Common Issues**:
1. **Missing environment variables**: Check all required env vars are set
2. **Secret access denied**: Verify service account has `secretmanager.secretAccessor` role
3. **Firestore connection failed**: Check `GCP_PROJECT_ID` and database exists
4. **Invalid image**: Verify image exists in Artifact Registry

**Solutions**:
```bash
# Check service account permissions
gcloud projects get-iam-policy sacred-vows \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:api-go-dev@sacred-vows.iam.gserviceaccount.com"

# Verify secrets exist
gcloud secrets list --project=sacred-vows

# Test secret access
gcloud secrets versions access latest \
  --secret=jwt-secret-dev \
  --project=sacred-vows
```

### DNS Not Working

**Symptoms**: Domain doesn't resolve or returns 404.

**Diagnosis**:
```bash
# Check DNS resolution
dig api.sacredvows.io

# Check domain mapping
gcloud run domain-mappings describe api.sacredvows.io \
  --region asia-south1 \
  --project=sacred-vows

# Test direct Cloud Run URL
gcloud run services describe api-go-prod \
  --region asia-south1 \
  --project=sacred-vows \
  --format="value(status.url)"
```

**Solutions**:
1. Verify DNS records are correct
2. Wait for DNS propagation (up to 48 hours)
3. Check domain mapping status in GCP Console
4. Verify SSL certificate is provisioned

### Firestore Connection Issues

**Symptoms**: API returns errors about Firestore connection.

**Diagnosis**:
```bash
# Check Firestore database exists
gcloud firestore databases describe --project=sacred-vows

# Verify service account has permissions
gcloud projects get-iam-policy sacred-vows \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:api-go-dev@sacred-vows.iam.gserviceaccount.com" \
  --filter="bindings.role:roles/datastore.user"
```

**Solutions**:
1. Verify `GCP_PROJECT_ID` environment variable is set correctly
2. Check `FIRESTORE_DATABASE` matches the database name
3. Ensure service account has `roles/datastore.user` role
4. Verify database exists in the correct region (`asia-south1`)

### GCS Upload Failures

**Symptoms**: Asset uploads fail with permission errors.

**Diagnosis**:
```bash
# Check bucket exists
gsutil ls gs://sacred-vows-assets-dev

# Check service account permissions
gcloud projects get-iam-policy sacred-vows \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:api-go-dev@sacred-vows.iam.gserviceaccount.com" \
  --filter="bindings.role:roles/storage.objectAdmin"
```

**Solutions**:
1. Verify `GCS_ASSETS_BUCKET` environment variable is set
2. Check service account has `roles/storage.objectAdmin` role
3. Verify bucket CORS configuration allows uploads from builder domain

### High Costs

**Symptoms**: Unexpected GCP charges.

**Solutions**:
1. **Check Cloud Run usage**:
   ```bash
   gcloud billing accounts list
   gcloud billing projects describe sacred-vows
   ```

2. **Review resource allocation**:
   - Reduce `max_instances` if not needed
   - Consider increasing `min_instances` to 0 (scale to zero)
   - Review CPU/memory allocation

3. **Monitor Firestore usage**:
   - Check read/write operations in GCP Console
   - Review Firestore pricing

4. **Review GCS storage**:
   ```bash
   gsutil du -sh gs://sacred-vows-assets-dev
   gsutil du -sh gs://sacred-vows-assets-prod
   ```

### Terraform State Issues

**Symptoms**: Terraform can't lock state or shows inconsistent state.

**Solutions**:
```bash
# Force unlock (use with caution)
terraform force-unlock LOCK_ID

# Refresh state
terraform refresh

# Import existing resources (if needed)
terraform import google_cloud_run_v2_service.api \
  projects/sacred-vows/locations/asia-south1/services/api-go-dev
```

---

## Environment Variables Reference

### Required for Firestore

- `DATABASE_TYPE=firestore`
- `GCP_PROJECT_ID=sacred-vows`
- `FIRESTORE_DATABASE=(default)`

### Required for GCS Storage

- `GCS_ASSETS_BUCKET=sacred-vows-assets-dev` (or `-prod`)
- `PUBLIC_ASSETS_BASE_URL=https://storage.googleapis.com/sacred-vows-assets-dev`

### Authentication

- `JWT_SECRET`: From Secret Manager
- `REFRESH_TOKEN_HMAC_KEYS`: From Secret Manager
- `REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID`: From Secret Manager

### OAuth

- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `GOOGLE_REDIRECT_URI`: `https://api.sacredvows.io/api/auth/google/callback`

### Publishing

- `PUBLISHED_BASE_DOMAIN=sacredvows.io`
- `PUBLISH_ARTIFACT_STORE=r2`
- `FRONTEND_URL=https://sacredvows.io`

---

## Next Steps

After successful deployment:

1. **Update Cloudflare Worker**: Point `API_ORIGIN` to your Cloud Run API
2. **Deploy Builder**: Deploy builder app to Cloudflare Pages
3. **Configure Monitoring**: Set up Cloud Monitoring alerts
4. **Set up CI/CD**: Automate deployments with GitHub Actions or Cloud Build
5. **Backup Strategy**: Configure Firestore backups
6. **Security Review**: Review IAM roles and permissions

---

## Additional Resources

- [GCP Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firestore Documentation](https://cloud.google.com/firestore/docs)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
