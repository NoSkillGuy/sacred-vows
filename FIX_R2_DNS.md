# Fix R2 Custom Domain DNS Record

## Problem
- R2 custom domain is configured: `pub-dev.sacredvows.io`
- Object exists: `defaults/couple1/bride/1.jpeg`
- Public access is enabled
- But getting 404 errors

## Root Cause
Cloudflare created an "R2" type DNS record, but it needs to be a **CNAME** record pointing to the R2 custom domain endpoint.

## Solution Steps

### Step 1: Get the CNAME Target

1. Go to **Cloudflare Dashboard** → **R2** → `sacred-vows-public-assets-dev`
2. Click **Settings** → **Custom Domains**
3. Click on `pub-dev.sacredvows.io` to view details
4. Look for the **CNAME target** or **Endpoint**
   - It should be something like: `pub-dev.sacredvows.io.cdn.cloudflare.net`
   - Or check the "DNS" section in the custom domain details

**Alternative**: If you can't find it in the UI, check the DNS records. The R2 record might show the target in its details.

### Step 2: Delete the R2 Record and Create CNAME

1. Go to **DNS** → **Records**
2. Find the record for `pub-dev.sacredvows.io` (type: R2)
3. **Delete** that record
4. **Add Record**:
   - **Type**: `CNAME`
   - **Name**: `pub-dev`
   - **Target**: `{CNAME target from Step 1}` (e.g., `pub-dev.sacredvows.io.cdn.cloudflare.net`)
   - **Proxy status**: **Proxied** (orange cloud) ✅
   - **TTL**: Auto
5. **Save**

### Step 3: Update Terraform (Optional but Recommended)

Edit `infra/terraform/dev/terraform.tfvars`:

```hcl
cloudflare_public_assets_cdn_target = "pub-dev.sacredvows.io.cdn.cloudflare.net"  # Use the actual target from Step 1
```

Then apply:
```bash
cd infra/terraform/dev
terraform plan
terraform apply
```

### Step 4: Wait and Test

1. Wait 2-5 minutes for DNS propagation
2. Test the URL:
   ```bash
   curl -I https://pub-dev.sacredvows.io/defaults/couple1/bride/1.jpeg
   ```
3. Should return `200 OK` instead of `404`

## Verify DNS After Fix

```bash
# Should show CNAME record
dig +short pub-dev.sacredvows.io CNAME

# Should resolve to Cloudflare IPs
dig +short pub-dev.sacredvows.io
```

## Expected Results

- **CNAME record**: `pub-dev.sacredvows.io` → `pub-dev.sacredvows.io.cdn.cloudflare.net`
- **A records**: Cloudflare IPs (104.21.x.x, 172.67.x.x)
- **HTTP Status**: `200 OK` with image content

## If Still Not Working

1. **Check R2 Custom Domain Status**: Make sure it shows as "Active" (not "Pending")
2. **Check SSL Certificate**: Go to SSL/TLS → Overview, verify certificate is issued
3. **Check Wildcard A Record**: The `*` → `192.0.2.1` record shouldn't interfere, but if issues persist, consider removing it temporarily
4. **Verify Object Path**: Double-check the object path in R2 matches exactly (no leading/trailing slashes)
5. **Test Public Development URL**: Temporarily enable public development URL in R2 settings to test if objects are accessible

## Notes

- The "R2" DNS record type is a special Cloudflare record, but it may not route correctly in all cases
- Converting to a standard CNAME record is more reliable
- DNS changes can take a few minutes to propagate globally

