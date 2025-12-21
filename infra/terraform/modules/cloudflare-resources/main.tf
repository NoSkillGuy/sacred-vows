terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.40"
    }
  }
}

# Get zone ID for your domain
data "cloudflare_zone" "main" {
  name = var.zone_name  # e.g., "sacredvows.io"
}

# DNS Records for API (CNAME to Cloud Run)
resource "cloudflare_record" "api" {
  zone_id        = data.cloudflare_zone.main.id
  name           = var.api_subdomain  # e.g., "api" or "api.dev"
  type           = "CNAME"
  content        = var.api_cname_target  # From Google Cloud Run domain mapping
  proxied        = true  # Enable Cloudflare proxy (orange cloud)
  ttl            = 1     # Auto (when proxied)
  allow_overwrite = true  # Allow overwriting existing DNS record
  comment        = "API endpoint for ${var.environment} environment"
}

# R2 Bucket for Published Sites
resource "cloudflare_r2_bucket" "published_sites" {
  count = var.r2_bucket_name != "" ? 1 : 0

  account_id = var.cloudflare_account_id
  name       = var.r2_bucket_name
  location   = var.r2_bucket_location  # R2 bucket location (APAC for Asia, WNAM for US West, etc.)
}

# R2 Bucket for Public Assets (default images, layouts, etc.)
resource "cloudflare_r2_bucket" "public_assets" {
  count = var.public_assets_r2_bucket_name != "" ? 1 : 0

  account_id = var.cloudflare_account_id
  name       = var.public_assets_r2_bucket_name
  location   = var.r2_bucket_location  # Use same location as published sites
}

# DNS Record for Public Assets CDN (R2 Custom Domain)
# IMPORTANT: Before this can work, you must configure the R2 custom domain in the Cloudflare Dashboard:
# 1. Go to R2 → sacred-vows-public-assets-dev → Settings → Custom Domain
# 2. Add custom domain: pub-dev.sacredvows.io (or pub.sacredvows.io for prod)
# 3. Cloudflare will provide a CNAME target (usually {domain}.cdn.cloudflare.net)
# 4. Set public_assets_cdn_target in terraform.tfvars to that target value
# 5. Then run terraform apply to create/manage the DNS record
resource "cloudflare_record" "public_assets_cdn" {
  count = var.public_assets_r2_bucket_name != "" && var.public_assets_cdn_target != "" ? 1 : 0

  zone_id        = data.cloudflare_zone.main.id
  name           = var.environment == "dev" ? "pub-dev" : "pub"
  type           = "CNAME"
  content        = var.public_assets_cdn_target
  proxied        = true  # Enable Cloudflare proxy for CDN benefits
  ttl            = 1     # Auto (when proxied)
  allow_overwrite = true
  comment        = "R2 Custom Domain for public assets CDN (${var.environment})"
}

# Worker Route for published sites (wildcard subdomain)
# Note: The worker script itself is deployed via Wrangler (not Terraform)
# This resource only manages the route configuration
#
# IMPORTANT: If the route already exists and you get an error, you have two options:
#
# Option 1: Import the existing route (RECOMMENDED)
#   terraform import 'module.cloudflare_resources.cloudflare_workers_route.published_sites[0]' <zone_id>/<route_id>
#   
#   To find the route ID:
#   curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/workers/routes" \
#     -H "Authorization: Bearer {api_token}" \
#     -H "Content-Type: application/json"
#
# Option 2: Skip route creation (set skip_worker_route_if_exists = true in terraform.tfvars)
#   This will skip creating the route if it already exists, but Terraform won't manage it.
resource "cloudflare_workers_route" "published_sites" {
  count = var.enable_worker_route && var.r2_bucket_name != "" && !var.skip_worker_route_if_exists ? 1 : 0

  zone_id     = data.cloudflare_zone.main.id
  # For dev: use *-dev.sacredvows.io pattern (single-level subdomain, covered by Universal SSL)
  # For prod: use *.sacredvows.io pattern
  pattern     = var.environment == "dev" ? "*-dev.${var.zone_name}/*" : "*.${var.published_base_domain}/*"
  script_name = "${var.environment}-published-sites"  # Worker name deployed via Wrangler
}

# Note: For Cloudflare Workers with custom routes, DNS resolution is handled automatically
# by Cloudflare when the route is configured. No explicit DNS record is needed.
# However, if DNS isn't resolving, verify:
# 1. The route pattern matches: *.dev.sacredvows.io/*
# 2. The Worker is deployed and active
# 3. The domain zone is active in Cloudflare

