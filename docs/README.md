# Sacred Vows Documentation

Welcome to the Sacred Vows documentation! This documentation covers everything you need to know about developing, deploying, and operating the Sacred Vows wedding invitation builder platform.

## Quick Links

- [Getting Started](./getting-started/README.md) - Start here if you're new to the project
- [Local Development Setup](./getting-started/local-development.md) - Set up your local development environment
- [Architecture Overview](./architecture/README.md) - Understand the system architecture
- [Deployment Guide](./infrastructure/deployment/overview.md) - Deploy to production
- [Testing Strategy](./development/testing-strategy.md) - Learn about our testing approach

## Documentation Structure

### [Getting Started](./getting-started/)
New to the project? Start here for setup instructions, prerequisites, and local development guides.

- [Prerequisites](./getting-started/prerequisites.md) - Required tools and accounts
- [Local Development](./getting-started/local-development.md) - Complete local setup guide

### [Architecture](./architecture/)
System design, architecture decisions, and technical overview.

- [System Overview](./architecture/system-overview.md) - High-level architecture
- [Project Goals](./architecture/goal.md) - Vision and objectives
- [Publish Architecture](./architecture/publish-architecture.md) - Comprehensive technical documentation of the invitation publishing system
- [Authentication](./architecture/authentication.md) - Auth system design
- [Builder Asset Architecture](./architecture/builder-asset-architecture.md) - Asset management

### [Applications](./applications/)
Documentation for each application in the monorepo.

- [Builder App](./applications/builder/README.md) - React/Vite frontend application
- [API Server](./applications/api-go/README.md) - Go backend API
- [Edge Worker](./applications/edge-worker/README.md) - Cloudflare Workers edge service

### [Infrastructure](./infrastructure/)
Deployment, infrastructure setup, and observability.

- [Deployment](./infrastructure/deployment/README.md) - Deployment guides and procedures
- [Terraform](./infrastructure/terraform/README.md) - Infrastructure as code
- [Observability](./infrastructure/observability/README.md) - Monitoring and telemetry

### [Development](./development/)
Development practices, testing, and workflows.

- [Testing Strategy](./development/testing-strategy.md) - Testing approach and best practices

### [Operations](./operations/)
Troubleshooting, service configurations, and operations guides.

- [Troubleshooting](./operations/troubleshooting/README.md) - Common issues and solutions
- [Services](./operations/services/README.md) - Third-party service configurations

### [Guides](./guides/)
Step-by-step tutorials and how-to guides.

## Contributing

When adding or updating documentation:

1. Follow the existing structure and naming conventions (kebab-case)
2. Update relevant README files with links to new documentation
3. Use relative paths for internal links
4. Keep documentation focused and scannable

## External Resources

- [UX/Design Documentation](../ux/) - Design system and UI guidelines
- [Terraform Documentation](../infra/terraform/) - Infrastructure as code details

