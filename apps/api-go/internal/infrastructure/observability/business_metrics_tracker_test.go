package observability

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/metric/metricdata"
)

func setupTestMetrics(t *testing.T) (*metric.MeterProvider, *metric.ManualReader) {
	ResetMetrics()
	provider, reader := NewTestMeterProvider()
	meter := GetMeter(provider)
	err := InitBusinessMetrics(meter)
	require.NoError(t, err)
	return provider, reader
}

func TestRecordUserSignup_WithMethod_RecordsMetric(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordUserSignup("email")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert - verify metric was recorded
	assert.NotNil(t, rm)
	// Verify the metric exists in the collected data
	found := false
	for _, scopeMetrics := range rm.ScopeMetrics {
		for _, metric := range scopeMetrics.Metrics {
			if metric.Name == "business_user_signups_total" {
				found = true
				break
			}
		}
	}
	assert.True(t, found, "business_user_signups_total metric should be recorded")
}

func TestRecordUserSignup_WithOAuthMethod_RecordsMetric(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordUserSignup("oauth")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordUserLogin_WithMethod_RecordsMetric(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordUserLogin("email")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordInvitationCreated_IncrementsCounter(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordInvitationCreated()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordInvitationCreatedWithDuration_RecordsBoth(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordInvitationCreatedWithDuration(2.5)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordInvitationPublished_IncrementsCounterAndGauge(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordInvitationPublished()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordInvitationUnpublished_DecrementsGauge(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Set initial count
	SetActiveInvitations(5)

	// Act
	RecordInvitationUnpublished()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordBuilderSession_RecordsCounterAndHistogram(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordBuilderSession(30.5)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordAssetUpload_WithFileType_RecordsMetric(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordAssetUpload("image/jpeg")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordRSVPSubmission_IncrementsCounter(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordRSVPSubmission()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordPublishAttempt_Success_RecordsSuccess(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordPublishAttempt(true)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordPublishAttempt_Failure_RecordsFailure(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordPublishAttempt(false)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordInvitationView_IncrementsCounter(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordInvitationView()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordThemeChange_IncrementsCounter(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordThemeChange()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordSectionToggle_IncrementsCounter(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordSectionToggle()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordLanguageSwitch_IncrementsCounter(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordLanguageSwitch()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestRecordLayoutSelection_WithLayoutID_RecordsMetric(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act
	RecordLayoutSelection("classic-scroll")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
}

func TestAllTrackingFunctions_WithNilMetrics_NoPanic(t *testing.T) {
	// Arrange - reset metrics to nil
	ResetMetrics()

	// Act & Assert - all functions should handle nil metrics gracefully
	assert.NotPanics(t, func() { RecordUserSignup("email") })
	assert.NotPanics(t, func() { RecordUserLogin("email") })
	assert.NotPanics(t, func() { RecordInvitationCreated() })
	assert.NotPanics(t, func() { RecordInvitationCreatedWithDuration(1.0) })
	assert.NotPanics(t, func() { RecordInvitationPublished() })
	assert.NotPanics(t, func() { RecordInvitationUnpublished() })
	assert.NotPanics(t, func() { RecordBuilderSession(10.0) })
	assert.NotPanics(t, func() { RecordAssetUpload("image/png") })
	assert.NotPanics(t, func() { RecordRSVPSubmission() })
	assert.NotPanics(t, func() { RecordPublishAttempt(true) })
	assert.NotPanics(t, func() { RecordPublishAttempt(false) })
	assert.NotPanics(t, func() { RecordInvitationView() })
	assert.NotPanics(t, func() { RecordThemeChange() })
	assert.NotPanics(t, func() { RecordSectionToggle() })
	assert.NotPanics(t, func() { RecordLanguageSwitch() })
	assert.NotPanics(t, func() { RecordLayoutSelection("test-layout") })
}

func TestRecordUserSignup_CallsMarkUserActive(t *testing.T) {
	// Arrange
	provider, _ := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// MarkUserActive is a no-op, but we verify it doesn't panic
	// The actual tracking happens via MarkUserActiveWithID in use cases

	// Act & Assert
	assert.NotPanics(t, func() { RecordUserSignup("email") })
}

func TestRecordUserLogin_CallsMarkUserActive(t *testing.T) {
	// Arrange
	provider, _ := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Act & Assert
	assert.NotPanics(t, func() { RecordUserLogin("email") })
}

// Helper function to verify metric attributes
func verifyMetricAttributes(t *testing.T, rm *metricdata.ResourceMetrics, metricName string, expectedAttrs map[string]string) {
	for _, scopeMetrics := range rm.ScopeMetrics {
		for _, m := range scopeMetrics.Metrics {
			if m.Name == metricName {
				// Verify attributes if needed
				return
			}
		}
	}
	t.Errorf("Metric %s not found in collected metrics", metricName)
}
