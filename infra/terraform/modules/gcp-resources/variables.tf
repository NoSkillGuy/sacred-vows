variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "api_domain" {
  description = "API domain"
  type        = string
}

variable "builder_domain" {
  description = "Builder domain"
  type        = string
}

variable "published_base_domain" {
  description = "Published sites base domain"
  type        = string
}

variable "min_instances" {
  description = "Minimum Cloud Run instances"
  type        = number
}

variable "max_instances" {
  description = "Maximum Cloud Run instances"
  type        = number
}

variable "cpu" {
  description = "CPU allocation"
  type        = string
}

variable "memory" {
  description = "Memory allocation"
  type        = string
}

variable "timeout_seconds" {
  description = "Request timeout"
  type        = number
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

