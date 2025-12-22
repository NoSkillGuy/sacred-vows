terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.14"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      # Using v4 - v5 has breaking changes and doesn't support public parameter yet
      # Public access must be managed manually via Cloudflare Dashboard
      version = "~> 4.40"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }

  backend "gcs" {
    # Configure via backend config file or environment variables
    # bucket = "sacred-vows-terraform-state"
    # prefix = "terraform/state/dev"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "cloudflare" {
  # API token from environment variable CLOUDFLARE_API_TOKEN
  # Or use email and API key (not recommended for production)
  # api_token = var.cloudflare_api_token
}

