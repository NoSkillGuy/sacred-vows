package observability

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/sdk/metric"
)

// Shutdown gracefully shuts down the observability providers
func Shutdown(ctx context.Context) error {
	var errs []error

	// Shutdown tracer provider
	if tp := GetTracerProvider(); tp != nil {
		shutdownCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()
		if err := tp.Shutdown(shutdownCtx); err != nil {
			errs = append(errs, fmt.Errorf("failed to shutdown tracer provider: %w", err))
		}
	}

	// Shutdown meter provider
	if mp := GetMeterProvider(); mp != nil {
		shutdownCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()
		if err := mp.Shutdown(shutdownCtx); err != nil {
			errs = append(errs, fmt.Errorf("failed to shutdown meter provider: %w", err))
		}
	}

	if len(errs) > 0 {
		return fmt.Errorf("errors during shutdown: %v", errs)
	}

	return nil
}

// Init initializes both tracer and meter providers
// Meter initialization failures are non-fatal (e.g., if backend doesn't support metrics like Tempo)
// If meter init fails, a no-op meter provider is created so metrics can still be used (just not exported)
func Init(ctx context.Context, tracerCfg TracerConfig, meterCfg MeterConfig) error {
	if err := InitTracer(ctx, tracerCfg); err != nil {
		return fmt.Errorf("failed to initialize tracer: %w", err)
	}

	// Meter initialization is optional - some backends (like Tempo) only support traces, not metrics
	// InitMeter will automatically use no-op for Tempo (no error), or return error for other failures
	if err := InitMeter(ctx, meterCfg); err != nil {
		// Only log if it's a real error (not Tempo, which is handled silently)
		log.Printf("[Observability] Warning: Failed to initialize metrics exporter: %v. Using no-op meter provider. Traces will still work.", err)
		// Create no-op meter provider for other failures
		meterProvider = metric.NewMeterProvider()
		otel.SetMeterProvider(meterProvider)
		// Don't return error - traces will work, metrics will be no-op
	}

	return nil
}
