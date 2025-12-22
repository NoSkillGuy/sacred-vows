# Cloudflare Setup Guide for Sacred Vows

This guide covers setting up Cloudflare for the `sacredvows.io` domain (currently in GoDaddy) and deploying the builder application to Cloudflare Pages.

## Table of Contents

1. [Domain Setup: GoDaddy to Cloudflare](#domain-setup-godaddy-to-cloudflare)
2. [DNS Configuration for API](#dns-configuration-for-api)
3. [Deploying Builder App to Cloudflare Pages](#deploying-builder-app-to-cloudflare-pages)
4. [Environment Variables](#environment-variables)
5. [Verification and Testing](#verification-and-testing)
6. [Troubleshooting](#troubleshooting)

---

## Domain Setup: GoDaddy to Cloudflare

### Option A: Transfer Domain to Cloudflare (Recommended)

**Benefits:**
- Lower domain renewal costs
- Integrated DNS and security
- Better performance with Cloudflare's CDN
- Free SSL certificates

**Steps:**

1. **Sign up for Cloudflare**
   - Go to [cloudflare.com](https://www.cloudflare.com)
   - Create a free account
   - Add your domain `sacredvows.io`

2. **Add Domain to Cloudflare**
   - Click "Add a Site"
   - Enter `sacredvows.io`
   - Select the Free plan (sufficient for most use cases)

3. **Get Nameservers from Cloudflare**
   - Cloudflare will provide two nameservers, e.g.:
     - `alice.ns.cloudflare.com`
     - `bob.ns.cloudflare.com`

4. **Update Nameservers in GoDaddy**
   - Log in to [GoDaddy](https://www.godaddy.com)
   - Go to "My Products" → "Domains"
   - Click on `sacredvows.io`
   - Click "DNS" or "Manage DNS"
   - Find "Nameservers" section
   - Click "Change"
   - Select "Custom" and enter Cloudflare's nameservers
   - Save changes

5. **Wait for DNS Propagation**
   - This can take 24-48 hours (usually completes within a few hours)
   - Verify with: `dig NS sacredvows.io`

### Option B: Use Cloudflare DNS Only (Keep Domain in GoDaddy)

**If you prefer to keep the domain registered with GoDaddy:**

1. **Add Domain to Cloudflare**
   - Sign up at [cloudflare.com](https://www.cloudflare.com)
   - Add `sacredvows.io` as a site
   - Select Free plan

2. **Get Cloudflare Nameservers**
   - Note the nameservers provided by Cloudflare

3. **Update Nameservers in GoDaddy**
   - Log in to GoDaddy
   - Go to Domain settings for `sacredvows.io`
   - Update nameservers to Cloudflare's nameservers
   - Save changes

4. **Verify in Cloudflare**
   - Wait for Cloudflare to detect the nameserver change
   - Status should change to "Active"

---

## DNS Configuration for API

After your domain is active in Cloudflare, configure DNS records for the API endpoints.

### Prerequisites

1. **Deploy API to Google Cloud Run** (via Terraform)
   ```bash
   cd infra/terraform/dev
   terraform apply
   ```

2. **Get Domain Mapping from Google Cloud**
   ```bash
   gcloud run domain-mappings describe api.dev.sacredvows.io \
     --region asia-northeast1 \
     --project=sacred-vows
   ```

   This will show the target domain (usually `ghs.googlehosted.com` or a specific subdomain).

### Configure DNS Records

1. **Log in to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select your domain `sacredvows.io`
   - Click "DNS" in the left sidebar

2. **Add CNAME Record for Dev API**
   - Click "Add record"
   - **Type**: `CNAME`
   - **Name**: `api.dev`
   - **Target**: The domain mapping target from Google Cloud (e.g., `ghs.googlehosted.com`)
   - **Proxy status**: 🟠 **Proxied** (orange cloud) - **IMPORTANT: Enable this**
   - **TTL**: Auto (or 3600 if not proxied)
   - Click "Save"

3. **Add CNAME Record for Prod API** (when ready)
   - Click "Add record"
   - **Type**: `CNAME`
   - **Name**: `api`
   - **Target**: The domain mapping target from Google Cloud
   - **Proxy status**: 🟠 **Proxied** (orange cloud)
   - **TTL**: Auto
   - Click "Save"

### Why Enable Proxy (Orange Cloud)?

✅ **Benefits:**
- **DDoS Protection**: Cloudflare automatically mitigates attacks
- **CDN Caching**: Faster response times globally
- **SSL/TLS**: Automatic HTTPS (even with free plan)
- **IP Hiding**: Your origin IP is hidden
- **Analytics**: Traffic insights in Cloudflare dashboard

⚠️ **Note**: With proxy enabled, Cloudflare handles SSL termination. Google Cloud will still provision its own SSL certificate for the domain mapping.

### Wait for DNS Propagation

- **Cloudflare**: Usually instant (within minutes)
- **Global DNS**: 5-60 minutes typically, up to 48 hours in rare cases

### Verify DNS Configuration

```bash
# Check DNS resolution
dig api.dev.sacredvows.io

# Test HTTPS endpoint
curl -I https://api.dev.sacredvows.io/health

# Expected response:
# HTTP/2 200
# ...
```

---

## Deploying Builder App to Cloudflare Pages

### Prerequisites

1. **Cloudflare Account** (already set up from domain configuration)
2. **GitHub Repository** (your code should be in GitHub)
3. **Node.js 18+** (for local testing)

### Step 1: Prepare Builder App for Production

1. **Check Build Configuration**
   ```bash
   cd apps/builder
   cat package.json  # Verify build script exists
   ```

2. **Test Build Locally**
   ```bash
   cd apps/builder
   npm install
   npm run build
   ```
   
   This should create a `dist` folder with the production build.

3. **Verify Environment Variables**
   - Check if the app needs any environment variables at build time
   - These will be configured in Cloudflare Pages

### Step 2: Connect GitHub Repository to Cloudflare Pages

1. **Go to Cloudflare Pages**
   - Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Select "Pages" → "Connect to Git"

2. **Authorize GitHub**
   - Click "Connect GitHub"
   - Authorize Cloudflare to access your repositories
   - Select the repository containing your builder app

3. **Configure Build Settings**
   - **Project name**: `sacred-vows-builder` (or your preferred name)
   - **Production branch**: `main` (or `master`)
   - **Framework preset**: `Vite` (or `React` if Vite not available)
   - **Build command**: `npm run build`
   - **Build output directory**: `apps/builder/dist`
   - **Root directory**: Leave empty (or set to `/` if your repo root is the monorepo root)

   **Important Settings:**
   ```
   Framework preset: Vite
   Build command: cd apps/builder && npm run build
   Build output directory: apps/builder/dist
   ```

4. **Environment Variables** (if needed)
   - Click "Add variable" for each environment variable
   - Common variables:
     - `VITE_API_URL`: `https://api.dev.sacredvows.io/api` (for dev)
     - `VITE_API_URL`: `https://api.sacredvows.io/api` (for prod)
     - `VITE_PUBLIC_ASSETS_CDN_URL`: `https://dev-pub.sacredvows.io` (for dev)
     - `VITE_PUBLIC_ASSETS_CDN_URL`: `https://pub.sacredvows.io` (for prod)
   
   **Note**: Vite requires `VITE_` prefix for environment variables to be exposed to the client.

5. **Click "Save and Deploy"**

### Step 3: Configure Custom Domain

1. **Add Custom Domain**
   - In your Pages project, go to "Custom domains"
   - Click "Set up a custom domain"
   - Enter: `dev.sacredvows.io` (for dev) or `sacredvows.io` (for prod)

2. **Cloudflare Will Auto-Configure DNS**
   - Cloudflare automatically creates the necessary DNS records
   - Wait a few minutes for SSL certificate provisioning

3. **Verify Domain**
   - Check that the domain shows as "Active" in Cloudflare Pages
   - SSL certificate should be "Active" (may take a few minutes)

### Step 4: Set Up Production Deployment

For production, you can either:

**Option A: Separate Pages Project**
- Create a new Pages project for production
- Use branch `main` or `prod`
- Configure custom domain: `sacredvows.io` or `www.sacredvows.io`

**Option B: Branch-based Deployment**
- Use the same Pages project
- Configure preview deployments for different branches
- Set production domain to `main` branch

### Step 5: Configure Build Settings (Advanced)

If you need custom build settings, create a `wrangler.toml` or use Cloudflare Pages configuration:

**For Monorepo Setup:**
```
Root directory: (leave empty)
Build command: cd apps/builder && npm ci && npm run build
Build output directory: apps/builder/dist
Node version: 18
```

**Environment Variables:**
```
VITE_API_URL=https://api.dev.sacredvows.io/api
VITE_PUBLIC_ASSETS_CDN_URL=https://dev-pub.sacredvows.io
NODE_VERSION=18
```

---

## Environment Variables

### Builder App Environment Variables

Configure these in Cloudflare Pages → Settings → Environment variables:

**Development:**
```
VITE_API_URL=https://api.dev.sacredvows.io/api
VITE_PUBLIC_ASSETS_CDN_URL=https://dev-pub.sacredvows.io
```

**Production:**
```
VITE_API_URL=https://api.sacredvows.io/api
VITE_PUBLIC_ASSETS_CDN_URL=https://pub.sacredvows.io
```

**Note**: 
- Vite requires `VITE_` prefix for client-side variables
- These are baked into the build at build time
- Update and redeploy when changing environment variables

### API Environment Variables

These are configured in Google Cloud Run (via Terraform), not Cloudflare:
- `GCP_PROJECT_ID`
- `DATABASE_TYPE`
- `FIRESTORE_DATABASE`
- `JWT_SECRET` (from Secret Manager)
- `REFRESH_TOKEN_HMAC_KEYS` (from Secret Manager)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- etc.

---

## Verification and Testing

### 1. Verify DNS Records

```bash
# Check API DNS
dig api.dev.sacredvows.io
dig api.sacredvows.io

# Check Builder DNS
dig dev.sacredvows.io
dig sacredvows.io
```

### 2. Test API Endpoints

```bash
# Health check
curl https://api.dev.sacredvows.io/health

# Expected: {"status":"ok","timestamp":"..."}

# Test authenticated endpoint (if applicable)
curl https://api.dev.sacredvows.io/api/layouts
```

### 3. Test Builder App

```bash
# Open in browser
open https://dev.sacredvows.io

# Or test with curl
curl -I https://dev.sacredvows.io
```

### 4. Check SSL Certificates

```bash
# Check API SSL
openssl s_client -connect api.dev.sacredvows.io:443 -servername api.dev.sacredvows.io

# Check Builder SSL
openssl s_client -connect dev.sacredvows.io:443 -servername dev.sacredvows.io
```

### 5. Verify Cloudflare Analytics

- Go to Cloudflare Dashboard → Analytics
- Check traffic, requests, and performance metrics
- Verify requests are being proxied through Cloudflare

---

## Troubleshooting

### DNS Issues

**Problem**: Domain not resolving
- **Solution**: Wait for DNS propagation (up to 48 hours)
- **Check**: Verify nameservers are correct in GoDaddy
- **Verify**: Use `dig NS sacredvows.io` to check nameservers

**Problem**: CNAME record not working
- **Solution**: Ensure proxy is enabled (orange cloud) in Cloudflare
- **Check**: Verify target domain is correct
- **Note**: CNAME cannot coexist with other records for the same name

### SSL Certificate Issues

**Problem**: SSL certificate not provisioned
- **Solution**: Wait 5-15 minutes after domain configuration
- **Check**: Ensure proxy is enabled in Cloudflare
- **Verify**: Check SSL/TLS settings in Cloudflare (should be "Full" or "Full (strict)")

**Problem**: Mixed content warnings
- **Solution**: Ensure all resources use HTTPS
- **Check**: Update any hardcoded HTTP URLs in the builder app

### Cloudflare Pages Deployment Issues

**Problem**: Build fails
- **Solution**: Check build logs in Cloudflare Pages
- **Common issues**:
  - Wrong build output directory
  - Missing environment variables
  - Node version mismatch
  - Missing dependencies

**Problem**: App not loading
- **Solution**: 
  - Check build output directory is correct
  - Verify `index.html` exists in output directory
  - Check browser console for errors
  - Verify environment variables are set correctly

**Problem**: API calls failing (CORS)
- **Solution**: 
  - Ensure API CORS settings allow `dev.sacredvows.io` origin
  - Check API environment variables are correct
  - Verify `VITE_API_URL` is set correctly in Pages

### Performance Issues

**Problem**: Slow page loads
- **Solution**: 
  - Enable Cloudflare caching
  - Check Cloudflare Analytics for insights
  - Optimize images and assets
  - Enable Cloudflare's Auto Minify in Speed settings

---

## Summary Checklist

### Domain Setup
- [ ] Created Cloudflare account
- [ ] Added `sacredvows.io` to Cloudflare
- [ ] Updated nameservers in GoDaddy
- [ ] Verified domain is active in Cloudflare

### DNS Configuration
- [ ] Added CNAME record for `api.dev.sacredvows.io`
- [ ] Added CNAME record for `api.sacredvows.io` (when ready)
- [ ] Enabled proxy (orange cloud) for all records
- [ ] Verified DNS resolution with `dig`

### API Deployment
- [ ] Deployed API to Google Cloud Run
- [ ] Created domain mapping in Google Cloud
- [ ] Got domain mapping target from Google Cloud
- [ ] Configured DNS records in Cloudflare
- [ ] Tested API endpoints

### Builder App Deployment
- [ ] Connected GitHub repository to Cloudflare Pages
- [ ] Configured build settings correctly
- [ ] Set environment variables
- [ ] Added custom domain
- [ ] Verified deployment is live
- [ ] Tested builder app functionality

### Verification
- [ ] All DNS records resolving correctly
- [ ] SSL certificates active
- [ ] API endpoints responding
- [ ] Builder app loading correctly
- [ ] No console errors in browser
- [ ] Analytics showing traffic in Cloudflare

---

## Additional Resources

- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare SSL/TLS Settings](https://developers.cloudflare.com/ssl/ssl-modes/)
- [Google Cloud Run Domain Mapping](https://cloud.google.com/run/docs/mapping-custom-domains)

---

## Next Steps

After completing this setup:

1. **Monitor Performance**: Check Cloudflare Analytics regularly
2. **Optimize Caching**: Configure cache rules for static assets
3. **Set Up WAF Rules**: Configure Web Application Firewall rules if needed
4. **Enable Additional Features**: Consider Cloudflare Workers for edge computing
5. **Set Up Monitoring**: Configure alerts for downtime or errors

