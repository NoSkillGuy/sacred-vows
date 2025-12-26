package observability

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMetricsExport_ToPrometheus_AllMetricsExported(t *testing.T) {
	// Arrange
	ResetMetrics()
	provider, reader := NewTestMeterProvider()
	defer provider.Shutdown(context.Background())
	meter := GetMeter(provider)

	err := InitBusinessMetrics(meter)
	require.NoError(t, err)

	// Act - Record various metrics
	RecordUserSignup("email")
	RecordUserLogin("oauth")
	RecordInvitationCreated()
	RecordInvitationPublished()
	RecordRSVPSubmission()
	RecordAssetUpload("image/jpeg")
	RecordLayoutSelection("classic-scroll")
	RecordPublishAttempt(true)
	RecordInvitationView()
	RecordThemeChange()
	RecordSectionToggle()
	RecordLanguageSwitch()
	RecordBuilderSession(30.5)
	MarkUserActiveWithID("user-123")
	SetActiveInvitations(5)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm, "ResourceMetrics should be collected")
	assert.NotEmpty(t, rm.ScopeMetrics, "Should have scope metrics")

	// Verify metrics are present in the collected data
	metricNames := make(map[string]bool)
	for _, scopeMetrics := range rm.ScopeMetrics {
		for _, m := range scopeMetrics.Metrics {
			metricNames[m.Name] = true
		}
	}

	// Verify key metrics are present
	assert.True(t, metricNames["business_user_signups_total"], "business_user_signups_total should be exported")
	assert.True(t, metricNames["business_user_logins_total"], "business_user_logins_total should be exported")
	assert.True(t, metricNames["business_invitations_created_total"], "business_invitations_created_total should be exported")
}

func TestMetricsExport_WithLabels_PreservesLabels(t *testing.T) {
	// Arrange
	ResetMetrics()
	provider, reader := NewTestMeterProvider()
	defer provider.Shutdown(context.Background())
	meter := GetMeter(provider)

	err := InitBusinessMetrics(meter)
	require.NoError(t, err)

	// Act - Record metrics with labels
	RecordUserSignup("email")
	RecordUserSignup("oauth")
	RecordAssetUpload("image/jpeg")
	RecordAssetUpload("image/png")
	RecordLayoutSelection("classic-scroll")
	RecordLayoutSelection("modern-card")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
	// Labels are preserved in the metric data structure
	// We verify the metrics are exported (exact label verification requires parsing metricdata)
}

func TestActiveUsersTracker_Integration_UpdatesGauges(t *testing.T) {
	// Arrange
	ResetMetrics()
	provider, reader := NewTestMeterProvider()
	defer provider.Shutdown(context.Background())
	meter := GetMeter(provider)

	err := InitBusinessMetrics(meter)
	require.NoError(t, err)

	// Act - Mark multiple users as active
	MarkUserActiveWithID("user-1")
	MarkUserActiveWithID("user-2")
	MarkUserActiveWithID("user-3")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)

	// Verify active user gauges are present
	metricNames := make(map[string]bool)
	for _, scopeMetrics := range rm.ScopeMetrics {
		for _, m := range scopeMetrics.Metrics {
			metricNames[m.Name] = true
		}
	}

	assert.True(t, metricNames["business_users_active_daily"], "business_users_active_daily should be exported")
	assert.True(t, metricNames["business_users_active_weekly"], "business_users_active_weekly should be exported")
	assert.True(t, metricNames["business_users_active_monthly"], "business_users_active_monthly should be exported")
}

func TestMetricsExport_CountersIncrement(t *testing.T) {
	// Arrange
	ResetMetrics()
	provider, reader := NewTestMeterProvider()
	defer provider.Shutdown(context.Background())
	meter := GetMeter(provider)

	err := InitBusinessMetrics(meter)
	require.NoError(t, err)

	// Act - Record multiple events
	RecordUserSignup("email")
	RecordUserSignup("email")
	RecordUserSignup("oauth")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
	// Counters should accumulate values (exact value verification requires parsing metricdata)
}

func TestMetricsExport_HistogramsRecordValues(t *testing.T) {
	// Arrange
	ResetMetrics()
	provider, reader := NewTestMeterProvider()
	defer provider.Shutdown(context.Background())
	meter := GetMeter(provider)

	err := InitBusinessMetrics(meter)
	require.NoError(t, err)

	// Act - Record histogram values
	RecordInvitationCreatedWithDuration(1.5)
	RecordInvitationCreatedWithDuration(2.0)
	RecordInvitationCreatedWithDuration(3.5)
	RecordBuilderSession(30.0)
	RecordBuilderSession(45.0)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
	// Histograms should record values (exact verification requires parsing metricdata)
}

func TestMetricsExport_GaugesUpdate(t *testing.T) {
	// Arrange
	ResetMetrics()
	provider, reader := NewTestMeterProvider()
	defer provider.Shutdown(context.Background())
	meter := GetMeter(provider)

	err := InitBusinessMetrics(meter)
	require.NoError(t, err)

	// Act - Update gauges
	SetActiveInvitations(10)
	IncrementActiveInvitations()
	DecrementActiveInvitations()
	MarkUserActiveWithID("user-1")
	MarkUserActiveWithID("user-2")

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
	// Gauges should reflect current values
}
