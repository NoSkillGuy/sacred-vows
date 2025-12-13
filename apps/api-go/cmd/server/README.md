# Command Layer - Server Entry Point

## Purpose

This directory contains the application entry point (`main.go`) that initializes and starts the HTTP server. It's responsible for wiring together all the layers of the Clean Architecture.

## Responsibilities

- Load and validate configuration
- Initialize database connection
- Run database migrations
- Initialize repositories, use cases, and handlers
- Set up dependency injection
- Start HTTP server with graceful shutdown

## Key Components

### `main.go`

The main entry point that:

1. **Initializes Logger**: Sets up structured logging with Zap
2. **Loads Configuration**: Reads environment variables and validates them
3. **Connects to Database**: Establishes PostgreSQL connection pool
4. **Runs Migrations**: Automatically migrates database schema using GORM
5. **Creates Repositories**: Instantiates all repository implementations
6. **Creates Services**: Initializes JWT, OAuth, and file storage services
7. **Creates Use Cases**: Instantiates all use cases with their dependencies
8. **Creates Handlers**: Sets up HTTP handlers with use cases
9. **Sets Up Router**: Configures all routes and middleware
10. **Starts Server**: Begins listening for HTTP requests
11. **Handles Shutdown**: Gracefully shuts down on SIGINT/SIGTERM

## Dependency Injection Flow

```
Configuration
    ↓
Database Connection
    ↓
Repositories (infrastructure)
    ↓
Services (JWT, OAuth, Storage)
    ↓
Use Cases (application layer)
    ↓
Handlers (interface layer)
    ↓
Router (HTTP routes)
    ↓
HTTP Server
```

## Usage

The server can be started with:

```bash
go run cmd/server/main.go
```

Or built and run:

```bash
go build -o bin/server cmd/server/main.go
./bin/server
```

## Environment Variables

All configuration is loaded from environment variables. See the root `README.md` for the complete list.

## Graceful Shutdown

The server implements graceful shutdown:
- Listens for SIGINT/SIGTERM signals
- Allows up to 5 seconds for in-flight requests to complete
- Closes database connections properly
- Logs shutdown events

## Related Layers

- **Infrastructure**: Uses database, config, auth, and storage packages
- **Interfaces**: Uses HTTP router and handlers
- **Use Cases**: Instantiates all use case implementations
- **Domain**: Domain entities are used indirectly through repositories
