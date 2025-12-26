package observability

import (
	"context"

	"go.opentelemetry.io/otel"
	otelmetric "go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/metric/metricdata"
	"go.opentelemetry.io/otel/sdk/resource"
)

// NewTestMeterProvider creates a test meter provider with manual reader for testing
func NewTestMeterProvider() (*metric.MeterProvider, *metric.ManualReader) {
	reader := metric.NewManualReader()
	res, _ := resource.New(context.Background())
	provider := metric.NewMeterProvider(
		metric.WithReader(reader),
		metric.WithResource(res),
	)
	otel.SetMeterProvider(provider)
	return provider, reader
}

// ResetMetrics resets all metric variables to nil for test isolation
func ResetMetrics() {
	// Reset business metrics
	businessUserSignupsTotal = nil
	businessUserLoginsTotal = nil
	businessUsersActiveDaily = nil
	businessUsersActiveWeekly = nil
	businessUsersActiveMonthly = nil
	businessInvitationsCreatedTotal = nil
	businessInvitationsPublishedTotal = nil
	businessInvitationsActive = nil
	businessInvitationCreationDurationSeconds = nil
	businessBuilderSessionsTotal = nil
	businessBuilderSessionDurationSeconds = nil
	businessAssetUploadsTotal = nil
	businessLayoutSelectionsTotal = nil
	businessPublishAttemptsTotal = nil
	businessPublishSuccessTotal = nil
	businessPublishFailuresTotal = nil
	businessInvitationViewsTotal = nil
	businessRSVPSubmissionsTotal = nil
	businessThemeChangesTotal = nil
	businessSectionTogglesTotal = nil
	businessLanguageSwitchesTotal = nil
}

// CollectMetrics collects metrics from the manual reader
func CollectMetrics(reader *metric.ManualReader) (*metricdata.ResourceMetrics, error) {
	var rm metricdata.ResourceMetrics
	ctx := context.Background()
	if err := reader.Collect(ctx, &rm); err != nil {
		return nil, err
	}
	return &rm, nil
}

// GetMeter returns a test meter from the provider
func GetMeter(provider *metric.MeterProvider) otelmetric.Meter {
	return provider.Meter("test-meter")
}
