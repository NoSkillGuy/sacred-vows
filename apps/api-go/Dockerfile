# syntax=docker/dockerfile:1.4
# ==============================================================================
# Stage 1: Build Stage
# ==============================================================================
# This stage compiles the Go application into a static binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies in a single layer
# Cache apk packages for faster rebuilds
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache git

# Install swag CLI for Swagger documentation generation
# Cache this layer separately as it rarely changes
RUN --mount=type=cache,target=/root/.cache/go-build \
    go install github.com/swaggo/swag/cmd/swag@latest

# Copy go mod files first for better layer caching
# This allows Docker to cache the dependency download layer separately
# Build context is repo root, so paths are relative to that
COPY apps/api-go/go.mod apps/api-go/go.sum ./

# Download Go module dependencies with BuildKit cache mount
# This dramatically speeds up builds by caching downloaded modules
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy source code (from apps/api-go directory)
COPY apps/api-go/ .

# Generate Swagger documentation
# This ensures docs are always up-to-date in the Docker image
# Use || true to continue if swag fails (docs may already exist)
RUN swag init -g cmd/server/main.go -o docs || true

# Build the application as a static binary with BuildKit cache mount
# CGO_ENABLED=0 creates a statically linked binary that doesn't require C libraries
# Using cache mounts for both module cache and build cache significantly speeds up builds
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/server ./cmd/server

# ==============================================================================
# Stage 2: Runtime Stage
# ==============================================================================
# This stage creates a minimal runtime image with only the compiled binary
FROM alpine:latest

# Install runtime dependencies
# ca-certificates: Required for HTTPS/TLS connections
# tzdata: Required for timezone data
# nodejs and npm: Required for snapshot renderer script
# Cache apk packages for faster rebuilds
RUN --mount=type=cache,target=/var/cache/apk \
    apk --no-cache add ca-certificates tzdata nodejs npm

# Create a non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/bin/server /app/server

# Copy generated Swagger documentation from the builder stage
COPY --from=builder /app/docs /app/docs

# Copy config files (YAML configs for different environments)
COPY --from=builder /app/config /app/config

# Build renderer package
# Build context is repo root, so we can access apps/renderer
FROM node:20-alpine AS renderer-builder
WORKDIR /app
COPY apps/renderer/package.json apps/renderer/pnpm-lock.yaml* ./
COPY apps/shared/package.json ../shared/
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm && \
    pnpm install --frozen-lockfile
COPY apps/renderer/ ./apps/renderer/
COPY apps/shared/ ./apps/shared/
WORKDIR /app/apps/renderer
RUN pnpm run build:ssr

# Copy renderer build artifacts from renderer-builder stage
COPY --from=renderer-builder /app/apps/renderer/dist-ssr /app/renderer/dist-ssr

# Return to app directory
WORKDIR /app

# Create directories that will be mounted as volumes
# These will be mounted to /app/uploads and /app/layouts
RUN mkdir -p /app/uploads /app/layouts

# Ensure the binary is executable
RUN chmod +x /app/server

# Change ownership to non-root user (including builder template engine)
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["/app/server"]
