package observability

import (
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.27.0"
)

// NewResource creates a new OpenTelemetry resource with service attributes
func NewResource(serviceName, serviceVersion, deploymentEnvironment string) (*resource.Resource, error) {
	attrs := []attribute.KeyValue{
		semconv.ServiceNameKey.String(serviceName),
		semconv.ServiceVersionKey.String(serviceVersion),
		attribute.String("deployment.environment", deploymentEnvironment),
	}

	// Create resource directly with semconv schema to avoid conflicts with resource.Default()
	// which may use a different schema version
	return resource.NewWithAttributes(
		semconv.SchemaURL,
		attrs...,
	), nil
}
