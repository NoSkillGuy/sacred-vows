output "api_dns_record_id" {
  description = "API DNS record ID"
  value       = cloudflare_record.api.id
}

output "api_dns_record_name" {
  description = "API DNS record name"
  value       = cloudflare_record.api.name
}

output "zone_id" {
  description = "Cloudflare zone ID"
  value       = data.cloudflare_zone.main.id
}

output "r2_bucket_name" {
  description = "R2 bucket name for published sites"
  value       = var.r2_bucket_name != "" ? cloudflare_r2_bucket.published_sites[0].name : null
}

output "worker_script_name" {
  description = "Cloudflare Worker script name (deployed via Wrangler, not Terraform)"
  value       = var.r2_bucket_name != "" ? "${var.environment}-published-sites" : null
}

output "worker_route_pattern" {
  description = "Worker route pattern (if enabled)"
  value       = var.enable_worker_route && var.r2_bucket_name != "" ? "*.${var.published_base_domain}/*" : null
}

output "public_assets_r2_bucket_name" {
  description = "R2 bucket name for public assets"
  value       = var.public_assets_r2_bucket_name != "" ? cloudflare_r2_bucket.public_assets[0].name : null
}

output "public_assets_cdn_dns_record_id" {
  description = "Public assets CDN DNS record ID (R2 custom domain)"
  value       = var.public_assets_r2_bucket_name != "" && var.public_assets_cdn_target != "" ? cloudflare_record.public_assets_cdn[0].id : null
}

output "public_assets_cdn_domain" {
  description = "Public assets CDN domain name"
  value       = var.public_assets_r2_bucket_name != "" ? (var.environment == "dev" ? "dev-pub.sacredvows.io" : "pub.sacredvows.io") : null
}

