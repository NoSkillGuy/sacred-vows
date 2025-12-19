# Infrastructure Layer

## Purpose

The infrastructure layer contains implementations of external frameworks and services. This is the outermost layer of Clean Architecture and handles all technical concerns like databases, authentication, file storage, and configuration.

## Responsibilities

- Implement repository interfaces
- Handle database connections and operations
- Implement authentication services (JWT, OAuth)
- Manage file storage
- Load and validate configuration
- Provide adapters for external services

## Key Principles

1. **Implements Interfaces**: Provides concrete implementations of repository and service interfaces
2. **Framework Details**: Contains all framework-specific code
3. **External Dependencies**: Can depend on external libraries
4. **Technical Concerns**: Handles all technical implementation details

## Structure

```
infrastructure/
├── database/
│   └── firestore/     # Firestore implementation
├── auth/              # Authentication services
├── config/            # Configuration management
└── storage/           # File storage
```

## Components

### Database (`database/firestore/`)

Firestore database implementation:
- Firestore client connection management
- Repository implementations
- Migration support (Go-based migrations)

### Authentication (`auth/`)

Authentication service implementations:
- `jwt.go` - JWT token generation and validation
- `google.go` - Google OAuth client

### Configuration (`config/`)

Configuration management:
- Environment variable loading
- Configuration validation
- Type-safe configuration structs

### Storage (`storage/`)

File storage implementation:
- `filesystem.go` - Local file system storage
- File validation
- Upload handling

## Dependencies

This layer can depend on:
- External frameworks (Gin, Firestore, JWT libraries)
- Database clients
- OAuth libraries
- File system operations
- Environment variable loaders

## Related Layers

- **Repository Interfaces**: Implements interfaces from `internal/interfaces/repository/`
- **Domain**: Uses domain entities (for mapping)
- **Use Cases**: Provides services used by use cases
- **Handlers**: Provides services used by handlers

## Best Practices

1. Keep framework code isolated here
2. Map between domain entities and database models
3. Handle all technical errors
4. Provide clean interfaces to other layers
5. Make implementations easily swappable
6. Handle connection pooling and resource management
