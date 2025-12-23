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
	if protocol == "http" || protocol == "http/protobuf" {
		exporter, err = otlptracehttp.New(
			ctx,
			otlptracehttp.WithEndpoint(cfg.Endpoint),
			otlptracehttp.WithInsecure(), // Use insecure for local development
		)
	} else {
		// Default to gRPC
		exporter, err = otlptracegrpc.New(
			ctx,
			otlptracegrpc.WithEndpoint(cfg.Endpoint),
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
	Enabled              bool
	Endpoint             string
	Protocol             string // "grpc" or "http"
	ServiceName          string
	ServiceVersion       string
	DeploymentEnvironment string
	SamplingRate         float64
}

