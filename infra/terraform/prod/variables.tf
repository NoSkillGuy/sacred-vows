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

