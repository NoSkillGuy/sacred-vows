package observability

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	otelmetric "go.opentelemetry.io/otel/metric"
)

var (
	httpRequestCount    otelmetric.Int64Counter
	httpErrorCount      otelmetric.Int64Counter
	httpRequestDuration otelmetric.Float64Histogram
)

// InitMetrics initializes RED metrics (Rate, Errors, Duration)
func InitMetrics(meter otelmetric.Meter) error {
	var err error

	// Request count counter
	httpRequestCount, err = meter.Int64Counter(
		"http_requests_total",
		otelmetric.WithDescription("Total number of HTTP requests"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	// Error count counter
	httpErrorCount, err = meter.Int64Counter(
		"http_errors_total",
		otelmetric.WithDescription("Total number of HTTP errors"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	// Request duration histogram
	httpRequestDuration, err = meter.Float64Histogram(
		"http_request_duration_seconds",
		otelmetric.WithDescription("HTTP request duration in seconds"),
		otelmetric.WithUnit("s"),
	)
	if err != nil {
		return err
	}

	return nil
}

// RecordHTTPRequest records a successful HTTP request
func RecordHTTPRequest(method, route string, statusCode int, durationSeconds float64) {
	if httpRequestCount != nil {
		attrs := []attribute.KeyValue{
			attribute.String("http.method", method),
			attribute.String("http.route", route),
			attribute.Int("http.status_code", statusCode),
		}
		httpRequestCount.Add(context.Background(), 1, otelmetric.WithAttributes(attrs...))
	}

	if httpRequestDuration != nil {
		attrs := []attribute.KeyValue{
			attribute.String("http.method", method),
			attribute.String("http.route", route),
			attribute.Int("http.status_code", statusCode),
		}
		httpRequestDuration.Record(context.Background(), durationSeconds, otelmetric.WithAttributes(attrs...))
	}
}

// RecordHTTPError records an HTTP error
func RecordHTTPError(method, route string, statusCode int) {
	if httpErrorCount != nil {
		attrs := []attribute.KeyValue{
			attribute.String("http.method", method),
			attribute.String("http.route", route),
			attribute.Int("http.status_code", statusCode),
		}
		httpErrorCount.Add(context.Background(), 1, otelmetric.WithAttributes(attrs...))
	}
}

