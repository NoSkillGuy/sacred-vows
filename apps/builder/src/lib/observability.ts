/**
 * OpenTelemetry Observability Setup
 * Initializes tracing and metrics for the frontend application
 */

import { WebTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ZoneContextManager } from "@opentelemetry/context-zone-peer-dep";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-base";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics-web";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";

let tracerProvider: WebTracerProvider | null = null;
let meterProvider: MeterProvider | null = null;

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

    // Note: Resource class is not exported from @opentelemetry/resources ESM build (v2.2.0)
    // This is a known issue with the package's ESM build
    // Using default resource - service attributes can be set via OTEL_RESOURCE_ATTRIBUTES
    // environment variable if needed
    // See: https://github.com/open-telemetry/opentelemetry-js/issues/4642
    tracerProvider = new WebTracerProvider({
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

    // Initialize metrics meter provider
    try {
      const metricsExporter = new OTLPMetricExporter({
        url: `${endpoint}/v1/metrics`,
      });

      meterProvider = new MeterProvider({
        readers: [
          new PeriodicExportingMetricReader({
            exporter: metricsExporter,
            exportIntervalMillis: 60000, // Export every 60 seconds
          }),
        ],
      });

      console.log("[Observability] Metrics initialized successfully");
    } catch (error) {
      console.error("[Observability] Failed to initialize metrics:", error);
      // Don't fail observability initialization if metrics fail
    }

    console.log("[Observability] Initialized successfully");
  } catch (error) {
    console.error("[Observability] Failed to initialize:", error);
  }
}

/**
 * Get the meter provider for metrics
 */
export function getMeterProvider(): MeterProvider | null {
  return meterProvider;
}

/**
 * Shutdown observability (flush remaining spans and metrics)
 */
export function shutdownObservability(): Promise<void> {
  const promises: Promise<void>[] = [];
  if (tracerProvider) {
    promises.push(tracerProvider.shutdown());
  }
  if (meterProvider) {
    promises.push(meterProvider.shutdown());
  }
  return Promise.all(promises).then(() => undefined);
}
