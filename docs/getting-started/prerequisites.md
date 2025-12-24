# Prerequisites

This document lists all required tools, accounts, and system requirements for developing and deploying Sacred Vows.

## Required Tools

### Development Tools

- **Node.js**: Version 20.19.0 or higher (required by vite 7.3.0 and vitest 4.0.16)
  - Install from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **npm**: Comes with Node.js
  - Verify: `npm --version`

- **Go**: Version 1.21 or higher
  - Install from [golang.org](https://golang.org/dl/)
  - Verify: `go version`

- **Docker**: Version 20.10 or higher
  - Install from [docker.com](https://www.docker.com/get-started)
  - Verify: `docker --version`

- **Docker Compose**: Version 2.0 or higher
  - Usually included with Docker Desktop
  - Verify: `docker compose version`

- **Git**: Version 2.30 or higher
  - Install from [git-scm.com](https://git-scm.com/downloads)
  - Verify: `git --version`

### Optional Development Tools

- **MinIO Client (`mc`)**: For managing local R2/MinIO storage
  - macOS: `brew install minio/stable/mc`
  - Linux: Download from [min.io](https://min.io/docs/minio/linux/reference/minio-mc.html)

- **Air**: For Go hot reloading
  - Install: `go install github.com/cosmtrek/air@latest`

- **gcloud CLI**: For GCP operations (if deploying)
  - Install from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install)

- **Wrangler CLI**: For Cloudflare Workers (usually via npm)
  - Install: `npm install -g wrangler`

## Required Accounts

### For Local Development

- **GitHub Account**: For repository access
  - Sign up at [github.com](https://github.com)

### For Deployment

- **Google Cloud Platform Account**
  - Project ID: `sacred-vows`
  - Billing enabled
  - Required APIs enabled (see deployment docs)

- **Cloudflare Account**
  - Domain `sacredvows.io` added
  - API token with Workers permissions

## System Requirements

### Operating System

- **macOS**: 10.15 (Catalina) or higher
- **Linux**: Ubuntu 20.04+ or equivalent
- **Windows**: Windows 10/11 (WSL2 recommended)

### Hardware

- **RAM**: Minimum 8GB, recommended 16GB
- **Disk Space**: At least 10GB free for dependencies and Docker images
- **CPU**: Multi-core processor recommended for Docker

## Required Permissions

### GitHub

- Repository read/write access
- Ability to configure GitHub Secrets (for deployment)

### Google Cloud Platform

- Project owner or editor role
- Service account creation permissions
- Cloud Run deployment permissions
- Artifact Registry access

### Cloudflare

- Account admin or Workers edit permissions
- DNS management permissions
- R2 bucket access

## Environment Setup

After installing prerequisites, proceed to:

- [Local Development Setup](./local-development.md) - Set up your local environment
- [Deployment Guide](../infrastructure/deployment/overview.md) - Set up deployment (if needed)

## Verification

Run these commands to verify your setup:

```bash
# Check Node.js
node --version  # Should be 20.19.0+

# Check Go
go version  # Should be 1.21+

# Check Docker
docker --version
docker compose version

# Check Git
git --version
```

## Next Steps

1. Clone the repository
2. Follow the [Local Development Setup](./local-development.md) guide
3. Review [Architecture Documentation](../architecture/README.md) to understand the system

