package observability

import (
	"context"
	"fmt"
	"time"
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
func Init(ctx context.Context, tracerCfg TracerConfig, meterCfg MeterConfig) error {
	if err := InitTracer(ctx, tracerCfg); err != nil {
		return fmt.Errorf("failed to initialize tracer: %w", err)
	}

	if err := InitMeter(ctx, meterCfg); err != nil {
		return fmt.Errorf("failed to initialize meter: %w", err)
	}

	return nil
}
