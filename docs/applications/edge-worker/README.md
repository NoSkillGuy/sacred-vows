# Edge Worker

The Edge Worker is a Cloudflare Workers service that serves published invitation sites directly from Cloudflare R2 storage.

## Features

- Subdomain-based routing for published sites
- Direct R2 integration for artifact serving
- Automatic version resolution
- Caching strategies for optimal performance
- Security headers for public sites

## How It Works

1. Extracts subdomain from the `Host` header
2. Resolves current version from the API
3. Serves artifacts from R2 using versioned paths
4. Applies appropriate caching headers

## Related Documentation

- [Publishing Process](../../architecture/publishing-process.md) - How publishing works end-to-end
- [Deployment Guide](../../infrastructure/deployment/overview.md) - Deployment procedures
- [Cloudflare Setup](../../infrastructure/deployment/cloudflare-setup.md) - Cloudflare configuration

