# ==============================================================================
# Stage 1: Build Stage
# ==============================================================================
# This stage compiles the Go application into a static binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Install swag CLI for Swagger documentation generation
RUN go install github.com/swaggo/swag/cmd/swag@latest

# Copy go mod files first for better layer caching
# This allows Docker to cache the dependency download layer separately
COPY go.mod go.sum ./

# Download Go module dependencies
# This layer will be cached unless go.mod or go.sum changes
RUN go mod download

# Copy source code
COPY . .

# Generate Swagger documentation
# This ensures docs are always up-to-date in the Docker image
# Use || true to continue if swag fails (docs may already exist)
RUN swag init -g cmd/server/main.go -o docs || true

# Build the application as a static binary
# CGO_ENABLED=0 creates a statically linked binary that doesn't require C libraries
# This makes the binary portable and suitable for minimal runtime images
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/server ./cmd/server

# ==============================================================================
# Stage 2: Runtime Stage
# ==============================================================================
# This stage creates a minimal runtime image with only the compiled binary
FROM alpine:latest

# Install runtime dependencies
# ca-certificates: Required for HTTPS/TLS connections
# tzdata: Required for timezone data
RUN apk --no-cache add ca-certificates tzdata

# Create a non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/bin/server /app/server

# Copy generated Swagger documentation from the builder stage
COPY --from=builder /app/docs /app/docs

# Create directories that will be mounted as volumes
# These will be mounted to /app/uploads and /app/layouts
RUN mkdir -p /app/uploads /app/layouts

# Ensure the binary is executable
RUN chmod +x /app/server

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["/app/server"]
