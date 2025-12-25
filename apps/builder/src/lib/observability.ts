/**
 * OpenTelemetry Observability Setup
 * Initializes tracing for the frontend application
 */

import { WebTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ZoneContextManager } from "@opentelemetry/context-zone-peer-dep";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-base";

let tracerProvider: WebTracerProvider | null = null;

/**
 * Generate a UUID for request ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Initialize OpenTelemetry observability
 * Returns early if disabled via environment variable
 */
export function initObservability(): void {
  // Check if observability is enabled
  const enabled = import.meta.env.VITE_OTEL_ENABLED !== "false";
  if (!enabled) {
    console.log("[Observability] Disabled via VITE_OTEL_ENABLED=false");
    return;
  }

  const endpoint = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";
  const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME || "sacred-vows-web";
  const serviceVersion = import.meta.env.VITE_OTEL_SERVICE_VERSION || "unknown";
  const deploymentEnvironment =
    import.meta.env.VITE_OTEL_DEPLOYMENT_ENVIRONMENT || import.meta.env.MODE || "development";
  const samplingRatio = parseFloat(import.meta.env.VITE_OTEL_TRACES_SAMPLER_RATIO || "0.01");

  console.log("[Observability] Initializing...", {
    endpoint,
    serviceName,
    serviceVersion,
    deploymentEnvironment,
    samplingRatio,
  });

  try {
    // Create OTLP trace exporter
    const exporter = new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    });

    // Create resource with service attributes
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
      "deployment.environment": deploymentEnvironment,
    });

    // Create tracer provider with sampling
    tracerProvider = new WebTracerProvider({
      resource,
      sampler: new TraceIdRatioBasedSampler(samplingRatio),
    });

    // Add OTLP exporter
    tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter));

    // Register instrumentations
    registerInstrumentations({
      instrumentations: [
        new DocumentLoadInstrumentation(),
        new FetchInstrumentation({
          // Automatically propagate trace context via traceparent header
          propagateTraceHeaderCorsUrls: [
            /^https?:\/\/localhost/,
            /^https?:\/\/.*\.localhost/,
            new RegExp(import.meta.env.VITE_API_URL || "http://localhost:3000"),
          ],
        }),
        new UserInteractionInstrumentation(),
      ],
    });

    // Register the tracer provider
    tracerProvider.register({
      contextManager: new ZoneContextManager(),
    });

    console.log("[Observability] Initialized successfully");
  } catch (error) {
    console.error("[Observability] Failed to initialize:", error);
  }
}

/**
 * Shutdown observability (flush remaining spans)
 */
export function shutdownObservability(): Promise<void> {
  if (tracerProvider) {
    return tracerProvider.shutdown();
  }
  return Promise.resolve();
}
