variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-south1"  # Mumbai, India
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "api_domain" {
  description = "API domain"
  type        = string
}

variable "builder_domain" {
  description = "Builder domain"
  type        = string
  default     = "sacredvows.io"
}

variable "published_base_domain" {
  description = "Published sites base domain"
  type        = string
  default     = "sacredvows.io"
}

variable "min_instances" {
  description = "Minimum Cloud Run instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum Cloud Run instances"
  type        = number
  default     = 10
}

variable "cpu" {
  description = "CPU allocation"
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory allocation"
  type        = string
  default     = "512Mi"
}

variable "timeout_seconds" {
  description = "Request timeout"
  type        = number
  default     = 300
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

# Cloudflare Configuration
variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_name" {
  description = "Cloudflare zone name (domain)"
  type        = string
  default     = "sacredvows.io"
}

variable "cloudflare_api_subdomain" {
  description = "API subdomain for DNS record (e.g., 'api' for prod environment)"
  type        = string
  default     = "api"
}

variable "cloudflare_api_cname_target" {
  description = "CNAME target for API (from Google Cloud Run domain mapping, e.g., ghs.googlehosted.com). Get this from: gcloud run domain-mappings describe <api_domain> --region <region>"
  type        = string
}

variable "cloudflare_r2_bucket_name" {
  description = "R2 bucket name for published sites (optional, leave empty to disable)"
  type        = string
  default     = ""
}

variable "cloudflare_r2_bucket_location" {
  description = "R2 bucket location. Options: APAC (Asia Pacific), WEUR (Western Europe), WNAM (Western North America), ENAM (Eastern North America). Default: APAC for asia-northeast1"
  type        = string
  default     = "APAC"
}

variable "cloudflare_enable_worker_route" {
  description = "Enable worker route for published sites (wildcard subdomain routing)"
  type        = bool
  default     = true
}

variable "cloudflare_resolve_cache_ttl_seconds" {
  description = "Cache TTL for worker resolve operations"
  type        = string
  default     = "30"
}

