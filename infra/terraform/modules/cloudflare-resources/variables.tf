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

variable "api_url" {
  description = "API URL for builder app (full URL with /api suffix)"
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

variable "builder_domain" {
  description = "Builder app domain (e.g., 'dev.sacredvows.io' or 'sacredvows.io')"
  type        = string
}

variable "production_branch" {
  description = "Production branch name for Pages deployment"
  type        = string
  default     = "main"
}

variable "web_analytics_tag" {
  description = "Cloudflare Web Analytics tag (optional)"
  type        = string
  default     = ""
}

variable "published_base_domain" {
  description = "Published sites base domain"
  type        = string
  default     = "sacredvows.io"
}

variable "node_version" {
  description = "Node.js version for Pages build"
  type        = string
  default     = "18"
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

