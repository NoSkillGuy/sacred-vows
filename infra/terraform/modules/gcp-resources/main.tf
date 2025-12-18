# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "api" {
  project       = var.project_id
  location      = var.region
  repository_id = "api-${var.environment}"
  description   = "Docker repository for api-go service (${var.environment})"
  format        = "DOCKER"
}

# Firestore Database (Native mode)
resource "google_firestore_database" "database" {
  project                     = var.project_id
  name                        = "sacred-vows-${var.environment}"
  location_id                 = var.region
  type                        = "FIRESTORE_NATIVE"
  concurrency_mode           = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"
}

# GCS Bucket for assets
resource "google_storage_bucket" "assets" {
  project       = var.project_id
  name          = "${var.project_id}-assets-${var.environment}"
  location      = var.region
  force_destroy = var.environment == "dev" # Allow force destroy in dev

  uniform_bucket_level_access = true

  cors {
    origin          = ["https://${var.builder_domain}", "https://*.${var.published_base_domain}"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
}

# Service Account for Cloud Run
resource "google_service_account" "cloud_run" {
  project      = var.project_id
  account_id   = "api-go-${var.environment}"
  display_name = "API Go Service Account (${var.environment})"
  description  = "Service account for api-go Cloud Run service"
}

# IAM: Cloud Run service account can access Firestore
resource "google_project_iam_member" "firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# IAM: Cloud Run service account can access GCS
resource "google_project_iam_member" "storage_object_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# IAM: Cloud Run service account can sign URLs
resource "google_project_iam_member" "storage_object_creator" {
  project = var.project_id
  role    = "roles/storage.objectCreator"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "api" {
  project           = var.project_id
  name              = "api-go-${var.environment}"
  location          = var.region
  deletion_protection = var.environment == "prod" # Only enable deletion protection for prod

  template {
    service_account = google_service_account.cloud_run.email

    containers {
      image = "${google_artifact_registry_repository.api.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.api.repository_id}/api-go:latest"

      resources {
        cpu_idle = true
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      env {
        name  = "DATABASE_TYPE"
        value = "firestore"
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "FIRESTORE_DATABASE"
        value = google_firestore_database.database.name  # Will be "sacred-vows-dev" or "sacred-vows-prod"
      }

      env {
        name  = "GCS_ASSETS_BUCKET"
        value = google_storage_bucket.assets.name
      }

      env {
        name  = "PUBLIC_ASSETS_BASE_URL"
        value = "https://storage.googleapis.com/${google_storage_bucket.assets.name}"
      }

      env {
        name  = "PUBLISHED_BASE_DOMAIN"
        value = var.published_base_domain
      }

      env {
        name  = "FRONTEND_URL"
        value = "https://${var.builder_domain}"
      }

      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "REFRESH_TOKEN_HMAC_KEYS"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.refresh_token_hmac_keys.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.refresh_token_hmac_active_key_id.secret_id
            version = "latest"
          }
        }
      }

      env {
        name  = "GOOGLE_CLIENT_ID"
        value = var.google_client_id
      }

      env {
        name  = "GOOGLE_CLIENT_SECRET"
        value = var.google_client_secret
      }

      env {
        name  = "GOOGLE_REDIRECT_URI"
        value = "https://${var.api_domain}/api/auth/google/callback"
      }

      env {
        name  = "PUBLISH_ARTIFACT_STORE"
        value = "r2" # Keep using R2 for published artifacts
      }
    }

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    timeout = "${var.timeout_seconds}s"
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Secret Manager secrets
resource "google_secret_manager_secret" "jwt_secret" {
  project   = var.project_id
  secret_id = "jwt-secret-${var.environment}"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "refresh_token_hmac_keys" {
  project   = var.project_id
  secret_id = "refresh-token-hmac-keys-${var.environment}"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "refresh_token_hmac_active_key_id" {
  project   = var.project_id
  secret_id = "refresh-token-hmac-active-key-id-${var.environment}"

  replication {
    auto {}
  }
}

# IAM: Service account can access secrets
resource "google_secret_manager_secret_iam_member" "jwt_secret_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "refresh_token_hmac_keys_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.refresh_token_hmac_keys.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "refresh_token_hmac_active_key_id_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.refresh_token_hmac_active_key_id.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Custom domain mapping for Cloud Run
resource "google_cloud_run_domain_mapping" "api" {
  project  = var.project_id
  location = var.region
  name     = var.api_domain

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.api.name
  }
}

# IAM: Allow unauthenticated access (or configure IAM as needed)
resource "google_cloud_run_service_iam_member" "public_access" {
  project  = var.project_id
  location = google_cloud_run_v2_service.api.location
  service  = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

