package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadObservabilityConfig_MetricsEndpoint_DefaultsToTracesEndpoint(t *testing.T) {
	// Arrange
	os.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
	os.Unsetenv("OTEL_METRICS_EXPORTER_OTLP_ENDPOINT")
	defer os.Unsetenv("OTEL_EXPORTER_OTLP_ENDPOINT")

	// Act
	cfg := loadObservabilityConfig(nil)

	// Assert
	assert.Equal(t, "http://localhost:4317", cfg.MetricsEndpoint, "Metrics endpoint should default to traces endpoint")
}

func TestLoadObservabilityConfig_MetricsEndpoint_ExplicitlySet(t *testing.T) {
	// Arrange
	os.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
	os.Setenv("OTEL_METRICS_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318")
	defer func() {
		os.Unsetenv("OTEL_EXPORTER_OTLP_ENDPOINT")
		os.Unsetenv("OTEL_METRICS_EXPORTER_OTLP_ENDPOINT")
	}()

	// Act
	cfg := loadObservabilityConfig(nil)

	// Assert
	assert.Equal(t, "http://localhost:4318", cfg.MetricsEndpoint, "Metrics endpoint should use explicitly set value")
	assert.Equal(t, "http://localhost:4317", cfg.ExporterEndpoint, "Traces endpoint should remain unchanged")
}

func TestLoadObservabilityConfig_MetricsProtocol_DefaultsToTracesProtocol(t *testing.T) {
	// Arrange
	os.Setenv("OTEL_EXPORTER_OTLP_PROTOCOL", "grpc")
	os.Unsetenv("OTEL_METRICS_EXPORTER_OTLP_PROTOCOL")
	defer os.Unsetenv("OTEL_EXPORTER_OTLP_PROTOCOL")

	// Act
	cfg := loadObservabilityConfig(nil)

	// Assert
	assert.Equal(t, "grpc", cfg.MetricsProtocol, "Metrics protocol should default to traces protocol")
}

func TestLoadObservabilityConfig_MetricsProtocol_ExplicitlySet(t *testing.T) {
	// Arrange
	os.Setenv("OTEL_EXPORTER_OTLP_PROTOCOL", "grpc")
	os.Setenv("OTEL_METRICS_EXPORTER_OTLP_PROTOCOL", "http")
	defer func() {
		os.Unsetenv("OTEL_EXPORTER_OTLP_PROTOCOL")
		os.Unsetenv("OTEL_METRICS_EXPORTER_OTLP_PROTOCOL")
	}()

	// Act
	cfg := loadObservabilityConfig(nil)

	// Assert
	assert.Equal(t, "http", cfg.MetricsProtocol, "Metrics protocol should use explicitly set value")
	assert.Equal(t, "grpc", cfg.ExporterProtocol, "Traces protocol should remain unchanged")
}

func TestLoadObservabilityConfig_MetricsEndpoint_TempoEndpoint_DisablesMetrics(t *testing.T) {
	// Arrange
	os.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://tempo:4317")
	os.Unsetenv("OTEL_METRICS_EXPORTER_OTLP_ENDPOINT")
	defer os.Unsetenv("OTEL_EXPORTER_OTLP_ENDPOINT")

	// Act
	cfg := loadObservabilityConfig(nil)

	// Assert
	// When metrics endpoint defaults to Tempo endpoint, InitMeter will detect Tempo and use no-op
	// The config itself doesn't disable metrics, but the meter initialization will
	assert.Equal(t, "http://tempo:4317", cfg.MetricsEndpoint, "Metrics endpoint should default to Tempo endpoint")
}

func TestLoadObservabilityConfig_MetricsEndpoint_ExplicitCollectorEndpoint(t *testing.T) {
	// Arrange
	os.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://tempo:4317")
	os.Setenv("OTEL_METRICS_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")
	defer func() {
		os.Unsetenv("OTEL_EXPORTER_OTLP_ENDPOINT")
		os.Unsetenv("OTEL_METRICS_EXPORTER_OTLP_ENDPOINT")
	}()

	// Act
	cfg := loadObservabilityConfig(nil)

	// Assert
	assert.Equal(t, "http://otel-collector:4317", cfg.MetricsEndpoint, "Metrics endpoint should use collector endpoint")
	assert.Equal(t, "http://tempo:4317", cfg.ExporterEndpoint, "Traces endpoint should use Tempo")
}
