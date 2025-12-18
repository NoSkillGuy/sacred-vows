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
  google_client_id    = var.google_client_id
  google_client_secret = var.google_client_secret
}

