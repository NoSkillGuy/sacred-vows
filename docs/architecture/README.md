# Architecture

This section covers the system architecture, design decisions, and technical overview of Sacred Vows.

## Documentation

- [System Overview](./system-overview.md) - High-level architecture and component diagram
- [Project Goals](./goal.md) - Vision, objectives, and success metrics
- [Publish Architecture](./publish-architecture.md) - Comprehensive technical documentation of the invitation publishing system
- [Authentication](./authentication/) - Authentication system design and API documentation
- [Builder Asset Architecture](./builder-asset-architecture.md) - Asset management and storage architecture

## System Components

The Sacred Vows platform consists of:

1. **Builder App** - React/Vite frontend for creating invitations
2. **API Server** - Go backend providing REST API
3. **Edge Worker** - Cloudflare Workers for serving published sites
4. **Infrastructure** - GCP (Cloud Run, Firestore) and Cloudflare (R2, Pages, Workers)

## Related Documentation

- [Application Documentation](../applications/README.md) - Detailed docs for each application
- [Infrastructure Documentation](../infrastructure/README.md) - Deployment and infrastructure setup
- [Development Practices](../development/README.md) - Development workflows and testing

