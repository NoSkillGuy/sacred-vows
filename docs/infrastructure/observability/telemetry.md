# OpenTelemetry Observability

This document describes the OpenTelemetry observability implementation for the Sacred Vows application. The implementation follows vendor-neutral best practices, emitting OTLP data that can be consumed by Tempo, Jaeger, Datadog, or any OTLP-compatible backend.

## Architecture Overview

```
[ React Frontend ]  →  OTLP Export (HTTP)  →  [ Tempo / Jaeger / Datadog ]
[ Go Backend ]      →  OTLP Export (gRPC)  →  [ Tempo / Jaeger / Datadog ]
```

Both applications emit OpenTelemetry data via OTLP. The backend decides where it goes via environment variables. **No vendor-specific code** exists in the applications - this gives you vendor freedom later.

## Request ID & Trace Correlation

### Request ID Flow

1. **Frontend** generates UUID request ID for each API call
2. **Frontend** sends `X-Request-ID` header + `traceparent` header (W3C Trace Context)
3. **Backend** extracts/uses request ID, continues trace with same trace ID
4. **Request ID appears in:**
   - Trace attributes (`http.request_id`)
   - All log entries (via zap logger context)
   - Response headers (for client correlation)

### Trace Propagation

- Frontend creates root span with trace ID
- `traceparent` header propagates trace ID to backend
- Backend continues same trace (child spans share trace ID)
- End-to-end trace: Browser → API → Database (single trace ID)

### Why Both?

- **Trace ID**: Links spans across services (when traces are sampled)
- **Request ID**: Correlates logs and traces even when sampling drops traces
- Request ID is human-readable and can be searched in logs
- Trace ID enables distributed tracing visualization

## Configuration

### Backend Configuration

Environment variables (in `apps/api-go/.env` or `docker-compose.yml`):

```bash
# Enable/disable observability (default: true in dev/local, false in prod)
OTEL_ENABLED=true

# OTLP exporter endpoint
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317  # Local
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317      # Docker Compose

# Protocol: grpc (default) or http
OTEL_EXPORTER_OTLP_PROTOCOL=grpc

# Service identification
OTEL_SERVICE_NAME=sacred-vows-api
OTEL_SERVICE_VERSION=unknown  # Set to git SHA in production
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=local

# Sampling configuration
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% sampling rate
```

### Frontend Configuration

Environment variables (in `apps/builder/.env`):

```bash
# Enable/disable observability (default: true in dev, false in prod)
VITE_OTEL_ENABLED=true

# OTLP exporter endpoint (HTTP only for frontend)
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318  # Local
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318  # Docker Compose (browser connects to host)

# Service identification
VITE_OTEL_SERVICE_NAME=sacred-vows-web
VITE_OTEL_SERVICE_VERSION=unknown
VITE_OTEL_DEPLOYMENT_ENVIRONMENT=local

# Sampling configuration (frontend should be heavily sampled)
VITE_OTEL_TRACES_SAMPLER_RATIO=0.01  # 1% sampling rate
```

## Disabling Observability

To completely disable observability (no overhead when disabled):

**Backend:**
```bash
OTEL_ENABLED=false
```

**Frontend:**
```bash
VITE_OTEL_ENABLED=false
```

When disabled:
- No telemetry is emitted
- No errors are thrown
- No performance overhead
- All instrumentation becomes no-ops

## Local Development Setup

### Using Docker Compose

The `docker-compose.yml` includes Tempo, Prometheus, and Grafana services for local development:

```bash
# Start all services including observability stack
docker-compose up -d

# Or start just the observability services
docker-compose up -d tempo prometheus grafana
```

### Access Points

- **Grafana**: http://localhost:3001 (admin/admin)
  - Use Grafana to view traces from Tempo
  - Navigate to **Explore** → Select **Tempo** data source
- **Tempo API**: http://localhost:3200
  - API endpoints for querying traces programmatically
  - Note: Tempo does not have a built-in web UI; use Grafana to view traces
- **Prometheus**: http://localhost:9090

### Viewing Traces

**Note**: Tempo does not have a built-in web UI. All trace viewing is done through Grafana.

1. Open Grafana at http://localhost:3001
2. Navigate to **Explore** (compass icon in left sidebar)
3. Select **Tempo** as the data source
4. Use the search to find traces:
   - Search by service name: `{service.name="sacred-vows-api"}`
   - Search by request ID: `{http.request_id="<uuid>"}`
   - Search by trace ID: `<trace-id>`

**Tempo API Endpoints** (for programmatic access):
- `GET /api/search` - Search for traces
- `GET /api/traces/{traceID}` - Get a specific trace by ID

### Viewing Metrics

1. Open Grafana at http://localhost:3001
2. Navigate to **Explore**
3. Select **Prometheus** as the data source
4. Query metrics:
   - `http_requests_total` - Total HTTP requests
   - `http_errors_total` - Total HTTP errors
   - `http_request_duration_seconds` - Request duration histogram

## Production Setup

### Backend

1. Set environment variables:
   ```bash
   OTEL_ENABLED=true
   OTEL_EXPORTER_OTLP_ENDPOINT=<your-tempo-jaeger-datadog-endpoint>
   OTEL_EXPORTER_OTLP_PROTOCOL=grpc  # or http
   OTEL_SERVICE_NAME=sacred-vows-api
   OTEL_SERVICE_VERSION=<git-sha>
   OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production
   OTEL_TRACES_SAMPLER_ARG=0.1  # Adjust based on traffic
   ```

2. The backend will automatically:
   - Initialize observability on startup
   - Emit traces and metrics via OTLP
   - Flush telemetry on graceful shutdown

### Frontend

1. Set environment variables (build-time):
   ```bash
   VITE_OTEL_ENABLED=true
   VITE_OTEL_EXPORTER_OTLP_ENDPOINT=<your-otlp-http-endpoint>
   VITE_OTEL_SERVICE_NAME=sacred-vows-web
   VITE_OTEL_SERVICE_VERSION=<git-sha>
   VITE_OTEL_DEPLOYMENT_ENVIRONMENT=production
   VITE_OTEL_TRACES_SAMPLER_RATIO=0.01  # 1% sampling for frontend
   ```

2. Rebuild the frontend with these environment variables

## Instrumentation Details

### Backend Instrumentation

#### HTTP Server
- All HTTP routes are automatically instrumented via `otelgin` middleware
- Traces include: method, route, status code, duration
- Metrics include: request count, error count, duration histogram

#### Request ID Middleware
- Generates or extracts `X-Request-ID` header
- Adds request ID to trace attributes
- Adds request ID to all log entries
- Returns request ID in response headers

#### Database Operations
- Firestore wrapper available via `CollectionWithTracing()` methods
- Spans include: operation type, collection name, document ID
- Attributes: `db.system=firestore`, `db.operation`, `db.collection`

**Example:**
```go
// Use instrumented collection
col := client.CollectionWithTracing("users")
err := col.SetWithTracing(ctx, userID, userData)
```

### Frontend Instrumentation

#### API Calls
- Fetch instrumentation automatically propagates trace context
- Request ID generated and sent as `X-Request-ID` header
- Request ID added to span attributes

#### Route Changes
- React Router changes are instrumented
- Spans created for each route change with route name

#### Page Loads
- Document load instrumentation tracks page load times
- User interaction instrumentation tracks major user actions

## Metrics

### RED Metrics

The backend emits standard RED (Rate, Errors, Duration) metrics:

- **Rate**: `http_requests_total` (counter)
- **Errors**: `http_errors_total` (counter)
- **Duration**: `http_request_duration_seconds` (histogram)

### Metric Labels

Metrics use low-cardinality labels only:
- `http.method` (GET, POST, etc.)
- `http.route` (e.g., `/api/auth/login`)
- `http.status_code` (200, 404, 500, etc.)

**Note**: Request ID is NOT included in metric labels (too high cardinality), but IS included in trace attributes and logs for correlation.

## Sampling

### Backend Sampling
- Default: 10% (`OTEL_TRACES_SAMPLER_ARG=0.1`)
- Errors: 100% (always sampled)
- Adjust based on traffic volume

### Frontend Sampling
- Default: 1% (`VITE_OTEL_TRACES_SAMPLER_RATIO=0.01`)
- Errors: 100% (always sampled)
- Frontend must be heavily sampled to avoid cost explosion

## Correlating Logs and Traces

### Using Request ID

1. **Find request ID** in application logs or response headers
2. **Search in Grafana/Tempo** using request ID:
   ```
   {http.request_id="<uuid>"}
   ```
3. **View full trace** with all spans and logs

### Using Trace ID

1. **Find trace ID** in logs (if added) or from trace UI
2. **Search in Grafana/Tempo** using trace ID
3. **View distributed trace** across all services

## Troubleshooting

### No Traces Appearing

1. **Check if observability is enabled:**
   ```bash
   # Backend
   echo $OTEL_ENABLED
   
   # Frontend
   echo $VITE_OTEL_ENABLED
   ```

2. **Check OTLP endpoint is reachable:**
   ```bash
   # For gRPC (backend)
   grpcurl -plaintext localhost:4317 list
   
   # For HTTP (frontend)
   curl http://localhost:4318/v1/traces
   ```

3. **Check Tempo is running:**
   ```bash
   docker-compose ps tempo
   curl http://localhost:3200/api/search
   ```
   If Tempo is running, you should get a JSON response with traces (may be empty if no traces have been sent yet).

4. **Check application logs** for observability initialization errors

### High Cardinality Warnings

If you see high cardinality warnings:
- Ensure request IDs are NOT in metric labels
- Use request IDs only in trace attributes and logs
- Keep metric labels to low-cardinality values (method, route, status)

### Performance Impact

Observability has minimal performance impact:
- Traces are sampled (10% backend, 1% frontend)
- Metrics are batched and exported periodically
- When disabled (`OTEL_ENABLED=false`), there is zero overhead

## Best Practices

1. **Vendor Neutrality**: Only use OTLP exporters, no vendor-specific code
2. **Semantic Conventions**: Use standard attribute names (`service.name`, `http.method`, etc.)
3. **Low Cardinality**: No user IDs or emails in metric labels
4. **Context Propagation**: Always pass `context.Context`, never create tracers in handlers
5. **Graceful Shutdown**: Telemetry is automatically flushed on SIGTERM
6. **Sampling**: Frontend heavily sampled (1-5%), errors at 100%
7. **Service Naming**: Consistent names across environments (`sacred-vows-api`, `sacred-vows-web`)
8. **Version Tracking**: Use git SHA for `service.version` in production

## Architecture Decisions

### Why OTLP?

- **Vendor Freedom**: Switch between Tempo, Jaeger, Datadog without code changes
- **Standard Protocol**: Industry-standard OpenTelemetry protocol
- **Future-Proof**: Works with any OTLP-compatible backend

### Why Request ID + Trace ID?

- **Request ID**: Human-readable, searchable in logs, works even when traces are sampled out
- **Trace ID**: Enables distributed tracing visualization, links spans across services
- **Both Together**: Maximum observability and correlation capabilities

### Why Sampling?

- **Cost Control**: Full tracing can be expensive at scale
- **Performance**: Reduces overhead on high-traffic services
- **Smart Sampling**: Errors always sampled (100%), normal traffic sampled (10% backend, 1% frontend)

## Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Grafana Tempo Documentation](https://grafana.com/docs/tempo/latest/)
- [W3C Trace Context Specification](https://www.w3.org/TR/trace-context/)

