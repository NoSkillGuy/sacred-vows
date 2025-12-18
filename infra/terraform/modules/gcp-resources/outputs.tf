output "cloud_run_service_url" {
  value = google_cloud_run_v2_service.api.uri
}

output "cloud_run_service_name" {
  value = google_cloud_run_v2_service.api.name
}

output "artifact_registry_repository" {
  value = google_artifact_registry_repository.api.name
}

output "gcs_assets_bucket" {
  value = google_storage_bucket.assets.name
}

output "firestore_database" {
  value = google_firestore_database.database.name
}

output "service_account_email" {
  value = google_service_account.cloud_run.email
}

