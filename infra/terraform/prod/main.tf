module "gcp_resources" {
  source = "../modules/gcp-resources"

  project_id          = var.project_id
  region              = var.region
  environment         = var.environment
  api_domain          = var.api_domain
  builder_domain      = var.builder_domain
  published_base_domain = var.published_base_domain
  min_instances       = var.min_instances
  max_instances       = var.max_instances
  cpu                 = var.cpu
  memory              = var.memory
  timeout_seconds     = var.timeout_seconds
  # Note: Google OAuth credentials are now in Secret Manager
}

module "cloudflare_resources" {
  source = "../modules/cloudflare-resources"

  cloudflare_account_id = var.cloudflare_account_id
  zone_name             = var.cloudflare_zone_name
  environment           = var.environment
  api_subdomain         = var.cloudflare_api_subdomain
  api_cname_target      = var.cloudflare_api_cname_target
  published_base_domain  = var.published_base_domain
  r2_bucket_name        = var.cloudflare_r2_bucket_name
  r2_bucket_location    = var.cloudflare_r2_bucket_location
  enable_worker_route   = var.cloudflare_enable_worker_route
  resolve_cache_ttl_seconds = var.cloudflare_resolve_cache_ttl_seconds

  depends_on = [module.gcp_resources]
}

