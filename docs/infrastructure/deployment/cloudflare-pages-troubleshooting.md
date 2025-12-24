# Cloudflare Pages Deployment Troubleshooting Guide

This document details all issues encountered during the Cloudflare Pages deployment setup and their solutions.

## Table of Contents

1. [Git Connection Issues](#git-connection-issues)
2. [Build Configuration Issues](#build-configuration-issues)
3. [DNS and API Connection Issues](#dns-and-api-connection-issues)
4. [SSL/TLS Configuration](#ssltls-configuration)
5. [Domain Mapping Issues](#domain-mapping-issues)

---

## Git Connection Issues

### Issue: "Connect to Git" Option Not Visible

**Problem:**
When setting up Cloudflare Pages via Terraform, the project is created but Git connection must be done manually. Sometimes the "Connect to Git" option is not immediately visible in the UI.

**Solution:**
1. Go to Cloudflare Dashboard → Workers & Pages
2. Click on your Pages project (`dev-builder` or `prod-builder`)
3. Navigate to **Settings** → **Builds & deployments**
4. Look for **Git Repository** section
5. Click **Manage** or **Connect to Git**
6. Authorize GitHub/GitLab and select your repository

**Alternative Approach:**
If the option still doesn't appear, you may need to:
- Delete the Terraform-created project
- Create a new project via UI with Git connected from the start
- Then manage the custom domain via Terraform or UI

**Key Takeaway:**
Cloudflare Pages Terraform provider doesn't support Git source configuration directly. Git connection must be done manually through the dashboard.

---

## Build Configuration Issues

### Issue 1: Build Fails - "Could not read package.json"

**Error:**
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/opt/buildhome/repo/package.json'
```

**Root Cause:**
Cloudflare Pages automatically runs `npm ci` at the repository root before executing the build command. In a monorepo structure, there's no `package.json` at the root, causing the build to fail before your custom build command runs.

**Solution:**
Set the **Root directory** in Cloudflare Pages build settings:

1. Go to Pages project → **Settings** → **Builds & deployments**
2. Set **Root directory** to: `apps/builder`
3. Update **Build command** to: `npm ci && npm run build` (remove the `cd apps/builder` part)
4. Set **Build output directory** to: `dist` (relative to root directory)

**Correct Configuration:**
| Setting | Value |
|---------|-------|
| **Root directory** | `apps/builder` |
| **Build command** | `npm ci && npm run build` |
| **Build output directory** | `dist` |
| **Framework preset** | `Vite` (or `None`) |

**Why This Works:**
- Cloudflare runs all commands from the root directory
- Setting root directory to `apps/builder` makes Cloudflare treat that as the project root
- `npm ci` then runs in the correct directory where `package.json` exists

---

### Issue 2: Build Output Directory Not Asked During Setup

**Problem:**
During initial Cloudflare Pages setup via UI, the build output directory field may not appear in the initial form.

**Solution:**
1. Complete the initial setup with build command
2. After project creation, go to **Settings** → **Builds & deployments**
3. Find **Build output directory** field
4. Set it to: `dist` (if root directory is `apps/builder`) or `apps/builder/dist` (if root directory is `/`)

**Note:**
Cloudflare may auto-detect the output directory based on framework preset, but for monorepos, you need to set it explicitly.

---

### Issue 3: Deploy Command Field in Worker Setup

**Problem:**
When setting up a Worker (not Pages), you see a "Deploy command" field. This is confusing if you're trying to set up Pages.

**Solution:**
- **For Cloudflare Pages:** Leave deploy command empty/blank. Pages automatically deploys after successful build.
- **For Cloudflare Workers:** Use `cd apps/edge-worker && npx wrangler deploy`

**Key Distinction:**
- **Pages** = Static site hosting (React/Vite app) - No deploy command needed
- **Workers** = Serverless functions - Requires deploy command

---

## DNS and API Connection Issues

### Issue: ERR_CONNECTION_CLOSED on API Endpoint

**Error:**
```
This site can't be reached
api.dev.sacredvows.io unexpectedly closed the connection.
ERR_CONNECTION_CLOSED
```

**Diagnosis Steps:**

1. **Verify Cloud Run Service Exists:**
   ```bash
   gcloud run services list --region asia-northeast1 --project=sacred-vows
   ```

2. **Test Direct Cloud Run URL:**
   ```bash
   curl https://api-go-dev-xxxxx-xx.a.run.app/health
   ```
   If this works, the service is running correctly.

3. **Check DNS Resolution:**
   ```bash
   dig api.dev.sacredvows.io +short
   ```
   Should show Cloudflare IPs (104.21.x.x, 172.67.x.x) if proxy is enabled.

4. **Verify Domain Mapping:**
   ```bash
   cd infra/terraform/dev
   terraform state show module.gcp_resources.google_cloud_run_domain_mapping.api
   ```
   Check that domain mapping exists and status shows `Ready` and `CertificateProvisioned`.

**Root Causes & Solutions:**

#### Cause 1: SSL/TLS Mode Incorrect

**Problem:**
Cloudflare SSL/TLS mode is set to "Flexible" or "Off", which causes connection issues with Cloud Run.

**Solution:**
1. Go to Cloudflare Dashboard → **SSL/TLS** → **Overview**
2. Set **SSL/TLS encryption mode** to: **Full** (or **Full (strict)**)
3. **Do NOT** use "Flexible" - Cloud Run requires HTTPS

**Why:**
- Cloud Run expects HTTPS connections
- "Flexible" mode tries to connect via HTTP, causing connection failures
- "Full" mode maintains HTTPS end-to-end

#### Cause 2: Authenticated Origin Pulls Enabled

**Problem:**
Authenticated Origin Pulls is enabled, but Cloud Run doesn't support it.

**Solution:**
1. Go to Cloudflare Dashboard → **SSL/TLS** → **Origin Server**
2. Ensure **Authenticated Origin Pulls** is **OFF**
3. Cloud Run doesn't validate Cloudflare's client certificates

**Why:**
- Cloud Run has its own security mechanisms (IAM, service accounts)
- Authenticated Origin Pulls requires certificate validation that Cloud Run doesn't support
- Enabling it will cause connection failures

#### Cause 3: Wrong CNAME Target

**Problem:**
DNS record points to incorrect CNAME target.

**Solution:**
1. Get correct CNAME target from Terraform:
   ```bash
   cd infra/terraform/dev
   terraform state show module.gcp_resources.google_cloud_run_domain_mapping.api | grep rrdata
   ```
   Should show: `rrdata = "ghs.googlehosted.com."`

2. Update Cloudflare DNS:
   - Go to Cloudflare Dashboard → **DNS**
   - Edit `api.dev` CNAME record
   - Set target to: `ghs.googlehosted.com` (without trailing dot)
   - Ensure proxy is enabled (orange cloud)

**Note:**
The trailing dot in Terraform output (`.`) is DNS notation and should be omitted in Cloudflare UI.

---

### Issue: Getting Domain Mapping CNAME Target

**Problem:**
`gcloud run domain-mappings describe` command syntax varies between Cloud Run v1 and v2.

**Solution:**

**For Cloud Run v2:**
```bash
# List domain mappings
gcloud run domain-mappings list --region asia-northeast1 --project=sacred-vows

# Get via Terraform (most reliable)
cd infra/terraform/dev
terraform state show module.gcp_resources.google_cloud_run_domain_mapping.api | grep rrdata
```

**Alternative:**
Check Google Cloud Console:
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Select project: `sacred-vows`
3. Click **Domain Mappings** tab
4. Find your domain mapping
5. View **Resource records** section for CNAME target

---

## SSL/TLS Configuration

### Issue: Connection Closing After SSL Handshake

**Symptoms:**
- DNS resolves correctly
- SSL handshake starts
- Connection closes immediately after

**Solution:**

1. **Set SSL/TLS Mode to Full:**
   - Cloudflare Dashboard → **SSL/TLS** → **Overview**
   - Set to **Full** (not Flexible)

2. **Verify Proxy Status:**
   - DNS record should have proxy enabled (orange cloud)
   - Gray cloud = DNS only (no proxy/SSL)

3. **Test Without Proxy First:**
   - Temporarily disable proxy (gray cloud)
   - Wait 2-3 minutes
   - Test: `curl https://api.dev.sacredvows.io/health`
   - If this works, re-enable proxy and set SSL mode to Full

**Configuration Checklist:**
- ✅ SSL/TLS mode: **Full**
- ✅ Authenticated Origin Pulls: **OFF**
- ✅ Proxy status: **ON** (orange cloud)
- ✅ CNAME target: `ghs.googlehosted.com`

---

## Domain Mapping Issues

### Issue: Domain Mapping Not Found

**Problem:**
Domain mapping doesn't exist or wasn't created by Terraform.

**Solution:**

1. **Check if it exists:**
   ```bash
   cd infra/terraform/dev
   terraform state list | grep domain
   ```

2. **Create via Terraform:**
   ```bash
   terraform apply -target=module.gcp_resources.google_cloud_run_domain_mapping.api
   ```

3. **Verify status:**
   ```bash
   terraform state show module.gcp_resources.google_cloud_run_domain_mapping.api
   ```
   Look for:
   - `status = "True"` for `Ready`
   - `status = "True"` for `CertificateProvisioned`
   - `status = "True"` for `DomainRoutable`

**Wait Time:**
Domain mapping creation and certificate provisioning can take 5-15 minutes. Check status periodically.

---

### Issue: Domain Mapping Status Shows Errors

**Problem:**
Domain mapping exists but shows error conditions.

**Common Errors:**

1. **Certificate Not Provisioned:**
   - Wait 10-15 minutes for automatic certificate provisioning
   - Check that domain is verified in Google Cloud Console

2. **Domain Not Routable:**
   - Verify DNS records are correct
   - Ensure domain is added to Cloudflare
   - Check that nameservers point to Cloudflare

3. **Route Not Found:**
   - Verify Cloud Run service exists: `gcloud run services list`
   - Check that service name matches in domain mapping spec

---

### Issue: Domain Stops Working After Deployment

**Problem:**
`api.dev.sacredvows.io` (or other custom domain) stops working after deploying via GitHub Actions. The domain was working before, but after a Cloud Run deployment, requests fail or timeout.

**Symptoms:**
- Domain worked before deployment
- After `gcloud run services update`, domain becomes unreachable
- DNS resolves correctly (`dig api.dev.sacredvows.io` shows Cloudflare IPs)
- Toggling Cloudflare DNS proxy off and on temporarily fixes it

**Root Cause:**
When Cloud Run services are updated, the underlying IP addresses behind the domain mapping can change. Cloudflare's proxy caches DNS resolutions, so it continues using the old cached IP addresses even though they're no longer valid. This causes requests to fail.

**Solution:**
The GitHub Actions workflow automatically purges Cloudflare's DNS cache after each Cloud Run deployment. This forces Cloudflare to re-resolve DNS and pick up the new IP addresses.

**How It Works:**
1. After `gcloud run services update` completes, the workflow calls Cloudflare's cache purge API
2. This clears all cached DNS resolutions for the zone
3. Cloudflare then re-resolves DNS and gets the updated IP addresses from Google's domain mapping

**Manual Fix (if needed):**
If you need to manually fix this issue:

1. **Option 1: Toggle DNS Proxy** (Quick fix)
   - Go to Cloudflare Dashboard → DNS
   - Find the `api.dev` CNAME record
   - Click the orange cloud to disable proxy (gray cloud)
   - Wait 30 seconds
   - Click again to re-enable proxy (orange cloud)
   - This forces Cloudflare to re-resolve DNS

2. **Option 2: Purge Cache via API** (Permanent fix)
   ```bash
   # Get zone ID
   ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=sacredvows.io" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" | jq -r '.result[0].id')
   
   # Purge cache
   curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"purge_everything":true}'
   ```

**Prevention:**
The automated cache purge in the GitHub Actions workflow prevents this issue. Ensure:
- `CLOUDFLARE_API_TOKEN` secret is set in GitHub
- Token has `Zone:Cache Purge` permission
- The "Purge Cloudflare DNS Cache" step runs after each Cloud Run deployment

**Verification:**
After deployment, check GitHub Actions logs for:
```
✅ Successfully purged Cloudflare cache
```

If you see warnings, check that the API token has the correct permissions.

**Troubleshooting Authentication Errors:**

If you see this error in GitHub Actions logs:
```
⚠️ Warning: Cache purge may have failed
Response: {"success":false,"errors":[{"code":10000,"message":"Authentication error"}]}
```

This means your `CLOUDFLARE_API_TOKEN` doesn't have the required permissions. Fix it by:

1. **Go to Cloudflare Dashboard**:
   - Navigate to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Find your existing token or create a new one

2. **Update Token Permissions**:
   - Click "Edit" on your token
   - Add the following permission:
     - **Zone** → **Cache Purge** → **Edit**
   - Make sure it's scoped to your zone: `sacredvows.io`
   - Save the token

3. **Alternative: Create New Token**:
   - Click "Create Token"
   - Use "Edit zone DNS" template as a base
   - Add additional permissions:
     - **Zone** → **Cache Purge** → **Edit**
     - **Zone** → **Zone** → **Read** (if not already included)
   - Set zone resources to: `sacredvows.io`
   - Copy the new token

4. **Update GitHub Secret**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Update `CLOUDFLARE_API_TOKEN` with the new token value
   - The next deployment will use the updated token

**Required Permissions Checklist:**
- ✅ Zone:Cache Purge:Edit (required for cache purge)
- ✅ Zone:Zone:Read (required to get zone ID)
- ✅ Zone:DNS:Edit (if you also manage DNS via API)

---

## Quick Reference: Correct Configurations

### Cloudflare Pages Build Settings

**For Monorepo Structure:**
```
Root directory: apps/builder
Build command: npm ci && npm run build
Build output directory: dist
Framework preset: Vite
```

**Environment Variables:**
```
VITE_API_URL = https://api.dev.sacredvows.io/api
NODE_VERSION = 18
```

### Cloudflare DNS Settings

**CNAME Record:**
```
Type: CNAME
Name: api.dev
Target: ghs.googlehosted.com
Proxy: ON (orange cloud)
TTL: Auto
```

### Cloudflare SSL/TLS Settings

```
SSL/TLS encryption mode: Full
Authenticated Origin Pulls: OFF
Always Use HTTPS: ON (optional)
```

### Cloud Run Domain Mapping

**Verify via Terraform:**
```bash
terraform state show module.gcp_resources.google_cloud_run_domain_mapping.api
```

**Expected Status:**
- Ready: `True`
- CertificateProvisioned: `True`
- DomainRoutable: `True`
- Resource Records: CNAME to `ghs.googlehosted.com.`

---

## Testing Checklist

After setup, verify everything works:

- [ ] Cloud Run service is running: `gcloud run services list`
- [ ] Direct Cloud Run URL works: `curl https://<service-url>/health`
- [ ] Domain mapping exists: `terraform state show module.gcp_resources.google_cloud_run_domain_mapping.api`
- [ ] DNS resolves: `dig api.dev.sacredvows.io +short` (should show Cloudflare IPs)
- [ ] SSL/TLS mode is Full: Check Cloudflare Dashboard
- [ ] Proxy is enabled: Orange cloud in DNS settings
- [ ] API endpoint works: `curl https://api.dev.sacredvows.io/health`
- [ ] Pages build succeeds: Check Cloudflare Pages deployment logs
- [ ] Pages site loads: Visit `https://dev.sacredvows.io`

---

## Common Commands Reference

### Check Cloud Run Service
```bash
gcloud run services list --region asia-northeast1 --project=sacred-vows
gcloud run services describe <service-name> --region asia-northeast1 --project=sacred-vows
```

### Check Domain Mapping
```bash
cd infra/terraform/dev
terraform state show module.gcp_resources.google_cloud_run_domain_mapping.api
```

### Test DNS Resolution
```bash
dig api.dev.sacredvows.io +short
nslookup api.dev.sacredvows.io
```

### Test API Endpoint
```bash
# Direct Cloud Run URL
curl https://api-go-dev-xxxxx-xx.a.run.app/health

# Via custom domain (with proxy)
curl https://api.dev.sacredvows.io/health

# Via custom domain (without proxy - test domain mapping)
# Disable proxy first, then:
curl https://api.dev.sacredvows.io/health
```

### Check SSL Certificate
```bash
openssl s_client -connect api.dev.sacredvows.io:443 -servername api.dev.sacredvows.io
```

---

## Summary of Key Learnings

1. **Monorepo Setup:** Always set root directory to the app subdirectory, not repository root
2. **Build Commands:** Remove `cd` commands when root directory is set correctly
3. **SSL/TLS:** Always use "Full" mode for Cloud Run, never "Flexible"
4. **Authenticated Origin Pulls:** Keep disabled for Cloud Run
5. **Domain Mapping:** Can take 10-15 minutes to provision certificates
6. **Git Connection:** Must be done manually via UI, not Terraform
7. **Testing:** Always test direct Cloud Run URL first, then custom domain

---

## Related Documentation

- [Cloudflare Setup Guide](./cloudflare-setup.md)
- [Cloudflare Terraform Setup](../../infra/terraform/CLOUDFLARE_SETUP.md)
- [Terraform Module README](../infra/terraform/modules/cloudflare-resources/README.md)

