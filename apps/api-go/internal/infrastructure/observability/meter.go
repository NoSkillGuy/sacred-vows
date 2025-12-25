package observability

import (
	"context"
	"fmt"
	"strings"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	otelmetric "go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/sdk/metric"
)

var (
	meterProvider *metric.MeterProvider
)

// InitMeter initializes the global meter provider with OTLP exporter
func InitMeter(ctx context.Context, cfg MeterConfig) error {
	if !cfg.Enabled {
		// Return no-op meter provider when disabled
		meterProvider = metric.NewMeterProvider()
		otel.SetMeterProvider(meterProvider)
		return nil
	}

	protocol := strings.ToLower(cfg.Protocol)
	endpoint := normalizeEndpoint(cfg.Endpoint, protocol)

	// Tempo only supports traces, not OTLP metrics - automatically disable metrics if endpoint is Tempo
	// Note: Metrics should use OpenTelemetry Collector endpoint (otel-collector:4317) instead
	// Check if endpoint contains "tempo" (case-insensitive)
	if strings.Contains(strings.ToLower(cfg.Endpoint), "tempo") {
		// Silently use no-op meter provider - this is expected behavior for Tempo
		// Metrics should be sent to OpenTelemetry Collector, not Tempo
		meterProvider = metric.NewMeterProvider()
		otel.SetMeterProvider(meterProvider)
		// Return nil to indicate success (no-op is valid for Tempo)
		return nil
	}

	// Create OTLP metric exporter based on protocol
	var exporter metric.Reader
	var err error

	if protocol == "http" || protocol == "http/protobuf" {
		exp, err := otlpmetrichttp.New(
			ctx,
			otlpmetrichttp.WithEndpoint(endpoint),
			otlpmetrichttp.WithInsecure(), // Use insecure for local development
		)
		if err != nil {
			return fmt.Errorf("failed to create OTLP metric exporter: %w", err)
		}
		exporter = metric.NewPeriodicReader(exp)
	} else {
		// Default to gRPC - gRPC expects host:port format, not URL
		exp, err := otlpmetricgrpc.New(
			ctx,
			otlpmetricgrpc.WithEndpoint(endpoint),
			otlpmetricgrpc.WithInsecure(), // Use insecure for local development
		)
		if err != nil {
			return fmt.Errorf("failed to create OTLP metric exporter: %w", err)
		}
		exporter = metric.NewPeriodicReader(exp)
	}

	// Create resource
	res, err := NewResource(cfg.ServiceName, cfg.ServiceVersion, cfg.DeploymentEnvironment)
	if err != nil {
		return fmt.Errorf("failed to create resource: %w", err)
	}

	// Create meter provider
	meterProvider = metric.NewMeterProvider(
		metric.WithReader(exporter),
		metric.WithResource(res),
	)

	// Set global meter provider
	otel.SetMeterProvider(meterProvider)

	return nil
}

// GetMeterProvider returns the global meter provider
func GetMeterProvider() *metric.MeterProvider {
	return meterProvider
}

// Meter returns a meter for the given name
func Meter(name string) otelmetric.Meter {
	return otel.Meter(name)
}

// MeterConfig holds configuration for meter initialization
type MeterConfig struct {
	Enabled               bool
	Endpoint              string
	Protocol              string // "grpc" or "http"
	ServiceName           string
	ServiceVersion        string
	DeploymentEnvironment string
}
