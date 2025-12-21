variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
  sensitive   = true
}

variable "zone_name" {
  description = "Cloudflare zone name (domain)"
  type        = string
  default     = "sacredvows.io"
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
}

variable "api_subdomain" {
  description = "API subdomain (e.g., 'api' or 'api.dev')"
  type        = string
}

variable "api_cname_target" {
  description = "CNAME target for API (from Google Cloud Run domain mapping, e.g., ghs.googlehosted.com)"
  type        = string
}

variable "published_base_domain" {
  description = "Published sites base domain"
  type        = string
  default     = "sacredvows.io"
}

variable "r2_bucket_name" {
  description = "R2 bucket name for published sites (required if using worker for published sites)"
  type        = string
  default     = ""
}

variable "r2_bucket_location" {
  description = "R2 bucket location. Options: APAC (Asia Pacific), WEUR (Western Europe), WNAM (Western North America), ENAM (Eastern North America)"
  type        = string
  default     = "APAC"  # Default to Asia Pacific for asia-northeast1 deployments
}

variable "enable_worker_route" {
  description = "Enable worker route for published sites (wildcard subdomain routing)"
  type        = bool
  default     = true
}

variable "resolve_cache_ttl_seconds" {
  description = "Cache TTL for worker resolve operations"
  type        = string
  default     = "30"
}

variable "public_assets_r2_bucket_name" {
  description = "R2 bucket name for public assets (default images, layouts, etc.)"
  type        = string
  default     = ""
}

variable "public_assets_cdn_target" {
  description = "CNAME target for public assets CDN (R2 custom domain). This is provided by R2 when you configure the custom domain in the Cloudflare Dashboard. Format: usually {domain}.cdn.cloudflare.net. Leave empty if custom domain is not yet configured."
  type        = string
  default     = ""
}

variable "skip_worker_route_if_exists" {
  description = "Skip creating worker route if it already exists (set to true if route was created manually or already imported)"
  type        = bool
  default     = false
}

