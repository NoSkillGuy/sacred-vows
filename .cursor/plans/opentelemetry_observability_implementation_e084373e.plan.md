---
name: OpenTelemetry Observability Implementation
overview: Implement OpenTelemetry observability for both Go backend and React frontend following vendor-neutral best practices. The implementation will emit OTLP data that can be consumed by Tempo, Jaeger, Datadog, or any OTLP-compatible backend.
todos:
  - id: backend-deps
    content: Add OpenTelemetry dependencies to go.mod (make indirect deps direct)
    status: completed
  - id: backend-config
    content: Add ObservabilityConfig to config.go with env var support
    status: completed
  - id: backend-observability-pkg
    content: Create observability package with tracer, meter, resource, and shutdown modules
    status: completed
    dependencies:
      - backend-deps
      - backend-config
  - id: backend-http-instrumentation
    content: Add otelgin middleware to router.go for HTTP instrumentation
    status: completed
    dependencies:
      - backend-observability-pkg
  - id: backend-request-id-middleware
    content: Create request ID middleware that generates/extracts X-Request-ID, adds to traces and logs
    status: completed
    dependencies:
      - backend-observability-pkg
  - id: backend-db-instrumentation
    content: Create Firestore wrapper with OpenTelemetry spans for DB operations
    status: completed
    dependencies:
      - backend-observability-pkg
  - id: backend-metrics
    content: Implement RED metrics (request count, error count, duration histogram)
    status: completed
    dependencies:
      - backend-observability-pkg
  - id: backend-main-init
    content: Initialize observability in main.go with graceful shutdown hooks
    status: completed
  - id: frontend-deps
    content: Add OpenTelemetry web SDK dependencies to package.json
    status: completed
  - id: frontend-observability
    content: Create observability.ts with OTLP exporter, sampling, and resource setup
    status: completed
    dependencies:
      - frontend-deps
  - id: frontend-api-instrumentation
    content: Ensure apiClient.ts generates request IDs, propagates trace context (traceparent header), and includes request ID in spans
    status: completed
    dependencies:
      - frontend-observability
  - id: frontend-router-instrumentation
    content: Create observabilityRouter.tsx to instrument React Router route changes
    status: completed
    dependencies:
      - frontend-observability
  - id: frontend-main-init
    content: Initialize observability in main.tsx before React render
    status: completed
    dependencies:
      - frontend-observability
      - frontend-api-instrumentation
      - frontend-router-instrumentation
  - id: docker-compose-services
    content: Add Tempo, Prometheus, and Grafana services to docker-compose.yml with proper configuration
    status: completed
  - id: tempo-config
    content: Create Tempo configuration file with OTLP receiver setup
    status: completed
  - id: prometheus-config
    content: Create Prometheus configuration file with Tempo scraping and exemplar setup
    status: completed
  - id: grafana-provisioning
    content: Create Grafana datasource provisioning configuration for Tempo and Prometheus
    status: completed
  - id: env-config
    content: Add OTEL environment variables to env.example files and docker-compose.yml with enable/disable flag
    status: completed
  - id: testing-validation
    content: Test end-to-end trace propagation and verify traces appear in Tempo
    status: completed
    dependencies:
      - backend-main-init
      - frontend-main-init
---

# OpenTe

lemetry Observability Implementation

## Architecture Overview

```javascript
[ React Frontend ]  →  OTLP Export  →  [ Tempo / Jaeger / Datadog ]
[ Go Backend ]      →  OTLP Export  →  [ Tempo / Jaeger / Datadog ]
```

Both applications emit OpenTelemetry data via OTLP. The backend decides where it goes via environment variables. No vendor-specific code in applications.

## Request ID & Trace Correlation

**Request ID Flow:**

1. Frontend generates UUID request ID for each API call
2. Frontend sends `X-Request-ID` header + `traceparent` header (W3C Trace Context)
3. Backend extracts/uses request ID, continues trace with same trace ID
4. Request ID appears in:

- Trace attributes (`http.request_id`)
- All log entries (via zap logger context)
- Response headers (for client correlation)

**Trace Propagation:**

- Frontend creates root span with trace ID
- `traceparent` header propagates trace ID to backend
- Backend continues same trace (child spans share trace ID)
- End-to-end trace: Browser → API → Database (single trace ID)

**Why Both?**

- **Trace ID**: Links spans across services (when traces are sampled)
- **Request ID**: Correlates logs and traces even when sampling drops traces
- Request ID is human-readable and can be searched in logs
- Trace ID enables distributed tracing visualization

## Implementation Plan

### Phase 1: Backend Observability (Go API)

#### 1.1 Add OpenTelemetry Dependencies

- Add required OpenTelemetry packages to `apps/api-go/go.mod`:
- `go.opentelemetry.io/otel` (already present as indirect)
- `go.opentelemetry.io/otel/sdk` (already present as indirect)
- `go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`
- `go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`
- `go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp` (already present)
- `go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc` (already present)
- `go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin`
- `go.opentelemetry.io/contrib/detectors/gcp` (already present)

#### 1.2 Create Observability Package

Create `apps/api-go/internal/infrastructure/observability/` with:

- `tracer.go`: Global tracer provider setup with OTLP exporter
- `meter.go`: Global meter provider setup with OTLP exporter
- `resource.go`: Resource detection (service.name, service.version, deployment.environment)
- `shutdown.go`: Graceful shutdown hooks for flushing telemetry

Key principles:

- Initialize TracerProvider and MeterProvider once at startup
- Shutdown gracefully on SIGTERM (flush data)
- Never create tracers in handlers - always pass context.Context
- Use semantic conventions: `service.name`, `service.version`, `deployment.environment`, `http.method`, `http.route`, `http.status_code`

#### 1.3 Add Observability Configuration

Extend `apps/api-go/internal/infrastructure/config/config.go`:

- Add `ObservabilityConfig` struct with:
- `Enabled bool` (OTEL_ENABLED, default: true in dev/local, false in prod unless explicitly enabled)
- `ExporterEndpoint string` (OTEL_EXPORTER_OTLP_ENDPOINT)
- `ExporterProtocol string` (OTEL_EXPORTER_OTLP_PROTOCOL, default: grpc)
- `ServiceName string` (OTEL_SERVICE_NAME, default: sacred-vows-api)
- `ServiceVersion string` (from git SHA or build info)
- `DeploymentEnvironment string` (OTEL_RESOURCE_ATTRIBUTES or APP_ENV)
- `SamplingRate float64` (traces, default: 1.0 for errors, 0.1 for normal)

Load from environment variables with sensible defaults. **Critical**: When `Enabled=false`, observability initialization should be a no-op (no telemetry emitted, no errors).

#### 1.4 Instrument HTTP Server

Modify `apps/api-go/internal/interfaces/http/router.go`:

- Add OpenTelemetry Gin middleware using `otelgin` package **only if observability is enabled**
- Middleware should be added early in the chain (after Recovery, before CORS)
- This automatically instruments all HTTP routes with traces and metrics
- Check `config.Observability.Enabled` before adding middleware (no-op if disabled)

#### 1.4.1 Request ID Middleware

Create `apps/api-go/internal/interfaces/http/middleware/request_id_middleware.go`:

- Generate or extract `X-Request-ID` header from incoming requests
- If header exists (from frontend), use it; otherwise generate new UUID
- Store request ID in Gin context for use in handlers
- Add request ID to trace attributes: `http.request_id` (semantic convention)
- Add request ID to all log entries via zap logger context
- Ensure request ID is included in response headers for correlation
- This enables end-to-end request tracking across frontend → backend → database

#### 1.5 Instrument Database Calls

Create `apps/api-go/internal/infrastructure/database/firestore/otel_wrapper.go`:

- Wrap Firestore client operations with spans
- Instrument: Create, Read, Update, Delete operations
- Add span attributes: `db.system=firestore`, `db.operation`, `db.collection`

#### 1.6 Instrument External HTTP Calls

- If any external HTTP calls exist (email service, etc.), wrap with `otelhttp` transport
- Ensure trace context propagation via headers

#### 1.7 Add RED Metrics

Create `apps/api-go/internal/infrastructure/observability/metrics.go`:

- Request count (counter)
- Error count (counter)
- Request duration (histogram)
- Use low-cardinality labels only: `http.method`, `http.route`, `http.status_code`
- Avoid: user IDs, emails, dynamic URLs
- **Note**: Request ID is NOT included in metric labels (too high cardinality), but IS included in trace attributes and logs for correlation

#### 1.8 Update Main Function

Modify `apps/api-go/cmd/server/main.go`:

- Initialize observability before starting server **only if enabled**
- Add graceful shutdown hook to flush telemetry (only if initialized)
- Ensure observability shutdown happens after HTTP server shutdown
- If observability is disabled, skip initialization entirely (no overhead)

### Phase 2: Frontend Observability (React)

#### 2.1 Add OpenTelemetry Dependencies

Add to `apps/builder/package.json`:

- `@opentelemetry/api`
- `@opentelemetry/sdk-web`
- `@opentelemetry/instrumentation`
- `@opentelemetry/instrumentation-fetch`
- `@opentelemetry/instrumentation-document-load`
- `@opentelemetry/instrumentation-user-interaction`
- `@opentelemetry/exporter-trace-otlp-http`
- `@opentelemetry/context-zone-peer-dep`

#### 2.2 Create Frontend Observability Module

Create `apps/builder/src/lib/observability.ts`:

- Initialize Web Tracer with OTLP HTTP exporter **only if enabled**
- Check `VITE_OTEL_ENABLED` environment variable (default: true in dev, false in prod unless set)
- Configure sampling: 1-5% for normal traffic, 100% for errors
- Set up resource attributes: `service.name=sacred-vows-web`, `service.version`, `deployment.environment`
- **Enable trace context propagation**: Configure W3C Trace Context propagation (traceparent header) - this is automatic with fetch instrumentation
- Export `initObservability()` function that returns early if disabled
- Export `generateRequestId()` helper function for creating UUID request IDs

#### 2.3 Instrument API Calls

Modify `apps/builder/src/services/apiClient.ts`:

- Ensure fetch instrumentation automatically propagates trace context (traceparent header)
- **Generate and propagate Request ID**: Create UUID for each request and send as `X-Request-ID` header
- Store request ID in span attributes: `http.request_id`
- Ensure request ID persists across retries (same ID for retry attempts)
- Add custom spans for major operations (login, register, upload, etc.) with request ID
- **Trace Context Propagation**: OpenTelemetry fetch instrumentation automatically adds `traceparent` header, which backend will use to continue the trace
- **Request ID Correlation**: Request ID allows correlation between frontend logs, backend logs, and traces even if trace sampling drops some traces

#### 2.4 Instrument React Router

Create `apps/builder/src/lib/observabilityRouter.tsx`:

- Wrap BrowserRouter with route change instrumentation
- Create spans for route changes with route name

#### 2.5 Instrument User Actions

Add instrumentation for:

- Page loads (document-load instrumentation)
- Major user actions (checkout, submit forms) - manual spans
- Avoid: every click, mouse movements, high-frequency events

#### 2.6 Frontend Metrics (Minimal)

Add minimal metrics:

- Page load time
- API latency (from browser POV)
- JS error counts
- Avoid: user-specific labels, session IDs

#### 2.7 Update Main Entry Point

Modify `apps/builder/src/main.tsx`:

- Initialize observability before React render
- Ensure observability is available throughout app lifecycle

### Phase 3: Configuration & Environment

#### 3.1 Backend Environment Variables

Add to `apps/api-go/env.example`:

```javascript
# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_SERVICE_NAME=sacred-vows-api
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=local
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```



#### 3.2 Frontend Environment Variables

Add to `apps/builder/.env.example` (or vite config):

```javascript
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
VITE_OTEL_SERVICE_NAME=sacred-vows-web
VITE_OTEL_DEPLOYMENT_ENVIRONMENT=local
VITE_OTEL_TRACES_SAMPLER_RATIO=0.01
```



#### 3.3 Update Configuration Files

- Add observability section to `apps/api-go/config/*.yaml` files (optional, env vars take precedence)
- Document configuration in README

### Phase 5: Testing & Validation

#### 5.1 Local Testing Setup

- Start all services: `docker-compose up -d`
- Access Grafana at `http://localhost:3001` (admin/admin)
- Access Tempo UI at `http://localhost:3200`
- Access Prometheus at `http://localhost:9090`
- Verify traces appear in Tempo UI via Grafana Explore
- Verify metrics are exported correctly in Prometheus

#### 5.2 Integration Testing

- Test trace propagation: Frontend → Backend → Database
- Verify traceparent header is sent from frontend
- Verify backend continues the same trace (same trace ID)
- Verify request ID is present in both frontend and backend traces
- Verify request ID appears in logs and can be used to correlate logs with traces
- Verify error traces are sampled at 100%
- Verify normal traces are sampled at configured rate
- Test disabling OTEL: Set `OTEL_ENABLED=false` and verify no telemetry emitted
- **Request ID Correlation Test**:
- Make request from frontend
- Verify `X-Request-ID` header is sent
- Verify same request ID appears in backend logs
- Verify request ID is in trace attributes
- Verify request ID is in response headers
- Use request ID to find traces in Tempo/Grafana

#### 5.3 Documentation

- Update `docs/local-development.md` with observability setup instructions
- Document how to disable OTEL in production
- Document Grafana dashboards setup (RED metrics, latency, error rates)

## Files to Create/Modify

### Backend Files

- `apps/api-go/internal/infrastructure/observability/tracer.go` (new)
- `apps/api-go/internal/infrastructure/observability/meter.go` (new)
- `apps/api-go/internal/infrastructure/observability/resource.go` (new)
- `apps/api-go/internal/infrastructure/observability/shutdown.go` (new)
- `apps/api-go/internal/infrastructure/observability/metrics.go` (new)
- `apps/api-go/internal/infrastructure/database/firestore/otel_wrapper.go` (new)
- `apps/api-go/internal/infrastructure/config/config.go` (modify - add ObservabilityConfig)
- `apps/api-go/internal/interfaces/http/router.go` (modify - add otelgin middleware and request ID middleware)
- `apps/api-go/internal/interfaces/http/middleware/request_id_middleware.go` (new - request ID generation and propagation)
- `apps/api-go/cmd/server/main.go` (modify - initialize observability)
- `apps/api-go/go.mod` (modify - add direct dependencies)
- `apps/api-go/env.example` (modify - add OTEL env vars)
- `docker-compose.yml` (modify - add tempo, prometheus, grafana services)
- `docker/tempo/tempo.yml` (new - Tempo configuration)
- `docker/prometheus/prometheus.yml` (new - Prometheus configuration)
- `docker/grafana/provisioning/datasources/datasources.yml` (new - Grafana datasource provisioning)

### Frontend Files

- `apps/builder/src/lib/observability.ts` (new)
- `apps/builder/src/lib/observabilityRouter.tsx` (new)
- `apps/builder/src/services/apiClient.ts` (modify - ensure trace propagation)
- `apps/builder/src/main.tsx` (modify - initialize observability)
- `apps/builder/package.json` (modify - add dependencies)
- `apps/builder/vite.config.ts` (modify if needed for env vars)

## Key Best Practices to Follow

1. **Vendor Neutrality**: Only use OTLP exporters, no vendor-specific code
2. **Semantic Conventions**: Use standard attribute names (`service.name`, `http.method`, etc.)
3. **Low Cardinality**: No user IDs or emails in metric labels
4. **Context Propagation**: Always pass `context.Context`, never create tracers in handlers
5. **Graceful Shutdown**: Flush telemetry on SIGTERM
6. **Sampling**: Frontend heavily sampled (1-5%), errors at 100%
7. **Service Naming**: Consistent names across environments (`sacred-vows-api`, `sacred-vows-web`)
8. **Version Tracking**: Use git SHA for `service.version`
9. **Request ID & Trace Correlation**:

- Generate request ID in frontend (UUID)
- Propagate via `X-Request-ID` header
- Include in trace attributes (`http.request_id`)
- Include in all log entries
- Return in response headers for client correlation
- Use W3C Trace Context (traceparent) for trace propagation
- Request ID enables correlation even when traces are sampled out

## Success Criteria

- Backend emits traces and metrics via OTLP
- Frontend emits traces via OTLP with trace context propagation
- End-to-end traces work: Browser → API → Database (same trace ID across services)
- Request ID is generated in frontend and propagated to backend
- Request ID appears in traces, logs, and response headers for correlation
- RED metrics (Rate, Errors, Duration) are available
- Configuration is environment-based and vendor-neutral
- Graceful shutdown flushes all telemetry