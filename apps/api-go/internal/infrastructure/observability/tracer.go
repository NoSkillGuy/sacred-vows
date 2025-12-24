package observability

import (
	"context"
	"fmt"
	"strings"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

// normalizeEndpoint normalizes the endpoint based on protocol:
// - For gRPC: strips http:// or https:// prefix and returns host:port (no path)
// - For HTTP: keeps the full URL format
func normalizeEndpoint(endpoint, protocol string) string {
	protocol = strings.ToLower(protocol)

	// For gRPC, we need just host:port, not a full URL
	if protocol != "http" && protocol != "http/protobuf" {
		// Remove http:// or https:// prefix if present
		endpoint = strings.TrimPrefix(endpoint, "http://")
		endpoint = strings.TrimPrefix(endpoint, "https://")
		// Remove any path component (gRPC only needs host:port)
		if idx := strings.Index(endpoint, "/"); idx != -1 {
			endpoint = endpoint[:idx]
		}
		return endpoint
	}

	// For HTTP, ensure we have a proper URL format
	if !strings.HasPrefix(endpoint, "http://") && !strings.HasPrefix(endpoint, "https://") {
		// If no scheme, assume http://
		endpoint = "http://" + endpoint
	}

	return endpoint
}

var (
	tracerProvider *sdktrace.TracerProvider
)

// InitTracer initializes the global tracer provider with OTLP exporter
func InitTracer(ctx context.Context, cfg TracerConfig) error {
	if !cfg.Enabled {
		// Return no-op tracer provider when disabled
		tracerProvider = sdktrace.NewTracerProvider()
		otel.SetTracerProvider(tracerProvider)
		return nil
	}

	// Create OTLP trace exporter based on protocol
	var exporter sdktrace.SpanExporter
	var err error

	protocol := strings.ToLower(cfg.Protocol)
	endpoint := normalizeEndpoint(cfg.Endpoint, protocol)

	if protocol == "http" || protocol == "http/protobuf" {
		exporter, err = otlptracehttp.New(
			ctx,
			otlptracehttp.WithEndpoint(endpoint),
			otlptracehttp.WithInsecure(), // Use insecure for local development
		)
	} else {
		// Default to gRPC - gRPC expects host:port format, not URL
		exporter, err = otlptracegrpc.New(
			ctx,
			otlptracegrpc.WithEndpoint(endpoint),
			otlptracegrpc.WithInsecure(), // Use insecure for local development
		)
	}
	if err != nil {
		return fmt.Errorf("failed to create OTLP trace exporter: %w", err)
	}

	// Create resource
	res, err := NewResource(cfg.ServiceName, cfg.ServiceVersion, cfg.DeploymentEnvironment)
	if err != nil {
		return fmt.Errorf("failed to create resource: %w", err)
	}

	// Create sampler
	sampler := sdktrace.TraceIDRatioBased(cfg.SamplingRate)

	// Create tracer provider
	tracerProvider = sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
		sdktrace.WithSampler(sampler),
	)

	// Set global tracer provider
	otel.SetTracerProvider(tracerProvider)

	return nil
}

// GetTracerProvider returns the global tracer provider
func GetTracerProvider() *sdktrace.TracerProvider {
	return tracerProvider
}

// Tracer returns a tracer for the given name
func Tracer(name string) trace.Tracer {
	return otel.Tracer(name)
}

// TracerConfig holds configuration for tracer initialization
type TracerConfig struct {
	Enabled               bool
	Endpoint              string
	Protocol              string // "grpc" or "http"
	ServiceName           string
	ServiceVersion        string
	DeploymentEnvironment string
	SamplingRate          float64
}
