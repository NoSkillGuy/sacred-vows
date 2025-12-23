package observability

import (
	"context"
	"fmt"
	"strings"

	"go.opentelemetry.io/otel"
	otelmetric "go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
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

	// Create OTLP metric exporter based on protocol
	var exporter metric.Reader
	var err error

	protocol := strings.ToLower(cfg.Protocol)
	if protocol == "http" || protocol == "http/protobuf" {
		exp, err := otlpmetrichttp.New(
			ctx,
			otlpmetrichttp.WithEndpoint(cfg.Endpoint),
			otlpmetrichttp.WithInsecure(), // Use insecure for local development
		)
		if err != nil {
			return fmt.Errorf("failed to create OTLP metric exporter: %w", err)
		}
		exporter = metric.NewPeriodicReader(exp)
	} else {
		// Default to gRPC
		exp, err := otlpmetricgrpc.New(
			ctx,
			otlpmetricgrpc.WithEndpoint(cfg.Endpoint),
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
	Enabled              bool
	Endpoint             string
	Protocol             string // "grpc" or "http"
	ServiceName          string
	ServiceVersion       string
	DeploymentEnvironment string
}

