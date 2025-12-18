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

# Cloudflare Pages Project for Builder App
resource "cloudflare_pages_project" "builder" {
  account_id        = var.cloudflare_account_id
  name              = "${var.environment}-builder"
  production_branch = var.production_branch

  build_config {
    build_command   = "cd apps/builder && npm ci && npm run build"
    destination_dir = "apps/builder/dist"
    root_dir        = "/"
    web_analytics_tag = var.web_analytics_tag != "" ? var.web_analytics_tag : null
  }

  deployment_configs {
    preview {
      environment_variables = {
        VITE_API_URL = var.api_url
        NODE_VERSION = var.node_version
      }
    }
    production {
      environment_variables = {
        VITE_API_URL = var.api_url
        NODE_VERSION = var.node_version
      }
    }
  }
}

# Custom Domain for Builder App
resource "cloudflare_pages_domain" "builder" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.builder.name
  domain       = var.builder_domain  # e.g., "dev.sacredvows.io" or "sacredvows.io"
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

# Worker Route for published sites (wildcard subdomain)
# Note: The worker script itself is deployed via Wrangler (not Terraform)
# This resource only manages the route configuration
resource "cloudflare_workers_route" "published_sites" {
  count = var.enable_worker_route && var.r2_bucket_name != "" ? 1 : 0

  zone_id     = data.cloudflare_zone.main.id
  pattern     = "*.${var.published_base_domain}/*"
  script_name = "${var.environment}-published-sites"  # Worker name deployed via Wrangler
}

