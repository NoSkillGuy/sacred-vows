terraform {
  backend "gcs" {
    bucket = "sacred-vows-terraform-state"
    prefix = "terraform/state/dev"
  }
}