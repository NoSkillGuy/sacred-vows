# R2 Custom Domain Troubleshooting Guide

## Issue: 404 Error on R2 Custom Domain

**URL**: `https://pub-dev.sacredvows.io/defaults/couple1/bride/1.jpeg`
**Status**: DNS resolves correctly, but returns `HTTP/2 404` from Cloudflare edge

## Root Causes & Solutions

### 1. Verify Object Exists in R2 Bucket

**Check in Cloudflare Dashboard:**
1. Go to **R2** → `sacred-vows-public-assets-dev`
2. Navigate to the object path: `defaults/couple1/bride/1.jpeg`
3. Verify the object exists and the path is correct

**Common Issues:**
- Object might be in a different path (e.g., `/defaults/couple1/bride/1.jpeg` vs `defaults/couple1/bride/1.jpeg`)
- Object might not have been uploaded yet
- Case sensitivity: `Bride` ≠ `bride`, `1.JPG` ≠ `1.jpeg`

### 2. Enable Public Access for R2 Bucket (CRITICAL for APAC Buckets)

**Critical Step**: R2 buckets are private by default. You must enable public access.

**For Terraform-Managed Buckets (APAC Region):**
- **IMPORTANT**: Even if the UI shows "Public Access: Enabled", Terraform-created buckets in APAC region require explicit `public = true` in Terraform configuration
- The UI toggle may not appear for Terraform-created buckets
- **Provider Version Requirement**: The `public` parameter requires Cloudflare Terraform provider v5.0 or later
- Add `public = true` to your `cloudflare_r2_bucket` resource:

```hcl
resource "cloudflare_r2_bucket" "public_assets" {
  account_id = var.cloudflare_account_id
  name       = var.public_assets_r2_bucket_name
  location   = "APAC"
  public     = true  # CRITICAL: Required for APAC buckets with custom domains (requires provider v5+)
}
```

- After adding `public = true`, run `terraform init` to update provider, then `terraform apply`
- Wait 60-120 seconds for changes to propagate

**Note**: If you're using provider v4.x, the `public` parameter is not available. You must:
1. Enable public access manually via Cloudflare Dashboard, OR
2. Upgrade to provider v5.0+ (see note about v5 stability below)

**For UI-Created Buckets:**
1. Go to **R2** → `sacred-vows-public-assets-dev` → **Settings**
2. Look for **"Public Access"** setting
3. Enable public access for the bucket
4. This allows objects to be served via the custom domain

**Note**: Even with a custom domain configured, if public access is disabled, you'll get 404 errors.

### 3. Fix Custom Domain Edge Routing (MOST COMMON FIX FOR APAC BUCKETS)

**Current Issue**: Custom domain exists but Cloudflare edge returns 404 before reaching R2.

**Root Cause**: For APAC buckets, custom domains can end up in a "half-bound" state where:
- DNS record exists (locked by Cloudflare)
- Edge routing is not properly attached
- Result: Cloudflare edge returns 404 instead of forwarding to R2

**Solution**: Rebind the Custom Domain

1. **Delete the existing custom domain:**
   - Go to **R2** → `sacred-vows-public-assets-dev` → **Settings** → **Custom Domains**
   - Find `pub-dev.sacredvows.io`
   - Click the three dots (⋯) → **Remove domain**
   - Wait 60 seconds

2. **Re-add the custom domain:**
   - In the same **Custom Domains** section, click **Add**
   - Enter: `pub-dev.sacredvows.io`
   - Click **Continue** → **Connect Domain**
   - Cloudflare will automatically create a locked DNS record

3. **Wait for propagation:**
   - Wait 2-3 minutes for edge routing to attach
   - Test: `curl -I https://pub-dev.sacredvows.io/defaults/couple1/bride/1.jpeg`
   - Should return `HTTP/2 200` instead of `404`

**Why This Works**: Rebinding forces Cloudflare to reattach the edge routing, which fixes the common APAC bucket issue.

### 4. DNS Record Configuration (Usually Automatic)

**Note**: When you add a custom domain in R2, Cloudflare automatically creates a "locked DNS record" (type: R2). This is correct and expected.

**You should NOT manually create a CNAME record** - Cloudflare manages this automatically.

**If DNS is not resolving:**
1. Check that the custom domain shows as "Active" in R2 settings
2. Verify SSL certificate is provisioned (can take 5-10 minutes)
3. Check DNS records: `dig +short pub-dev.sacredvows.io` should resolve to Cloudflare IPs

### 5. Verify SSL Certificate

**Check SSL/TLS Status:**
1. Go to **SSL/TLS** → **Overview**
2. Verify `pub-dev.sacredvows.io` has a valid SSL certificate
3. SSL provisioning can take 5-10 minutes after custom domain configuration

### 6. Check for Conflicting Workers or Rules

**Check Workers Routes:**
- Go to **Workers** → **Triggers** → **Routes**
- Ensure NO route matches `pub-dev.sacredvows.io/*`
- Workers routes can intercept and block R2 custom domain requests

**Check Zero Trust / Access Policies:**
- Go to **Zero Trust** → **Access** → **Applications**
- Ensure `pub-dev.sacredvows.io` is NOT protected by Access policies
- Access policies can cause 404s even for public assets

**Check Cache Rules / Page Rules:**
- Go to **Rules** → **Cache Rules** or **Page Rules**
- Look for rules affecting `pub-dev.sacredvows.io/*`
- Rules like "Cache everything" or "Block hotlinking" can interfere

### 7. Test with Direct R2 URL (Diagnostic Only)

**Note**: R2's S3-style endpoint does NOT support public HTTP access. This test is only for diagnostics.

The endpoint format `https://<account>.r2.cloudflarestorage.com/<bucket>/<key>` will return `400 Bad Request` - this is expected and does NOT indicate a permissions problem.

**Alternative Test**: Upload a test file `hello.txt` to bucket root and test:
```bash
curl https://pub-dev.sacredvows.io/hello.txt
```
If this works but your image doesn't → path issue
If this also 404s → domain binding issue

## Quick Diagnostic Commands

```bash
# Check DNS resolution
dig pub-dev.sacredvows.io
dig +short pub-dev.sacredvows.io CNAME

# Test HTTP access
curl -I https://pub-dev.sacredvows.io/defaults/couple1/bride/1.jpeg
curl -v https://pub-dev.sacredvows.io/defaults/couple1/bride/1.jpeg

# Check SSL certificate
openssl s_client -connect pub-dev.sacredvows.io:443 -servername pub-dev.sacredvows.io
```

## Expected Behavior After Fix

1. **DNS Resolution**: Should resolve to Cloudflare IPs (104.21.x.x, 172.67.x.x)
2. **CNAME Record**: Should show `pub-dev.sacredvows.io.cdn.cloudflare.net`
3. **HTTP Response**: Should return `200 OK` with image content
4. **Content-Type**: Should be `image/jpeg` or appropriate image type

## Most Likely Fix (In Order of Probability)

Based on the `HTTP/2 404` error from Cloudflare edge, the most likely issues are:

1. **Custom domain edge routing not attached** (90% probability for APAC buckets)
   - **Fix**: Rebind custom domain (delete and re-add) - see Section 3
   - This is especially common for Terraform-created buckets in APAC region

2. **Public access not explicitly set in Terraform** (for Terraform-managed buckets)
   - **Fix**: Add `public = true` to `cloudflare_r2_bucket` resource - see Section 2
   - Even if UI shows "Enabled", Terraform needs explicit parameter

3. **Object doesn't exist at that exact path**
   - **Fix**: Verify object path in R2 dashboard (case-sensitive)

4. **Conflicting Workers route or Access policy**
   - **Fix**: Check Workers routes and Zero Trust policies - see Section 6

## Quick Fix Checklist

For APAC buckets with custom domains showing 404:

- [ ] Verify object exists in R2 dashboard
- [ ] Add `public = true` to Terraform R2 bucket resource
- [ ] Run `terraform apply` and wait 60-120 seconds
- [ ] Rebind custom domain (delete and re-add in R2 settings)
- [ ] Wait 2-3 minutes for edge routing to attach
- [ ] Test: `curl -I https://pub-dev.sacredvows.io/defaults/couple1/bride/1.jpeg`
- [ ] Should return `HTTP/2 200` with `content-type: image/jpeg`

## Architecture Notes

**Recommended Setup for Production:**
- ✅ One public R2 bucket per environment
- ✅ Custom domain managed via Cloudflare Dashboard (auto-creates locked DNS)
- ✅ `public = true` in Terraform for all public asset buckets
- ✅ No Workers routes on asset domains
- ✅ No Access policies on asset domains
- ✅ CORS enabled for frontend access

**Proxy Settings:**
- Custom domains created via R2 automatically set proxy to "Auto"
- For public assets, this is fine - Cloudflare handles routing correctly
- You cannot manually change proxy status for R2-managed DNS records

