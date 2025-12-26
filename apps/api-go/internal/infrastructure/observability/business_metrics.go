package observability

import (
	otelmetric "go.opentelemetry.io/otel/metric"
)

var (
	// User Metrics
	businessUserSignupsTotal   otelmetric.Int64Counter
	businessUserLoginsTotal    otelmetric.Int64Counter
	businessUsersActiveDaily   otelmetric.Int64Gauge
	businessUsersActiveWeekly  otelmetric.Int64Gauge
	businessUsersActiveMonthly otelmetric.Int64Gauge

	// Invitation Metrics
	businessInvitationsCreatedTotal           otelmetric.Int64Counter
	businessInvitationsPublishedTotal         otelmetric.Int64Counter
	businessInvitationsActive                 otelmetric.Int64Gauge
	businessInvitationCreationDurationSeconds otelmetric.Float64Histogram

	// Engagement Metrics
	businessBuilderSessionsTotal          otelmetric.Int64Counter
	businessBuilderSessionDurationSeconds otelmetric.Float64Histogram
	businessAssetUploadsTotal             otelmetric.Int64Counter
	businessLayoutSelectionsTotal         otelmetric.Int64Counter

	// Conversion Metrics
	businessPublishAttemptsTotal otelmetric.Int64Counter
	businessPublishSuccessTotal  otelmetric.Int64Counter
	businessPublishFailuresTotal otelmetric.Int64Counter

	// Guest Engagement Metrics
	businessInvitationViewsTotal otelmetric.Int64Counter
	businessRSVPSubmissionsTotal otelmetric.Int64Counter

	// Feature Usage Metrics
	businessThemeChangesTotal     otelmetric.Int64Counter
	businessSectionTogglesTotal   otelmetric.Int64Counter
	businessLanguageSwitchesTotal otelmetric.Int64Counter
)

// InitBusinessMetrics initializes all business metrics
func InitBusinessMetrics(meter otelmetric.Meter) error {
	var err error

	// User Metrics
	businessUserSignupsTotal, err = meter.Int64Counter(
		"business_user_signups_total",
		otelmetric.WithDescription("Total number of user signups"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessUserLoginsTotal, err = meter.Int64Counter(
		"business_user_logins_total",
		otelmetric.WithDescription("Total number of user logins"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessUsersActiveDaily, err = meter.Int64Gauge(
		"business_users_active_daily",
		otelmetric.WithDescription("Number of daily active users"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessUsersActiveWeekly, err = meter.Int64Gauge(
		"business_users_active_weekly",
		otelmetric.WithDescription("Number of weekly active users"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessUsersActiveMonthly, err = meter.Int64Gauge(
		"business_users_active_monthly",
		otelmetric.WithDescription("Number of monthly active users"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	// Invitation Metrics
	businessInvitationsCreatedTotal, err = meter.Int64Counter(
		"business_invitations_created_total",
		otelmetric.WithDescription("Total number of invitations created"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessInvitationsPublishedTotal, err = meter.Int64Counter(
		"business_invitations_published_total",
		otelmetric.WithDescription("Total number of invitations published"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessInvitationsActive, err = meter.Int64Gauge(
		"business_invitations_active",
		otelmetric.WithDescription("Number of currently active published invitations"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessInvitationCreationDurationSeconds, err = meter.Float64Histogram(
		"business_invitation_creation_duration_seconds",
		otelmetric.WithDescription("Time taken to create an invitation in seconds"),
		otelmetric.WithUnit("s"),
	)
	if err != nil {
		return err
	}

	// Engagement Metrics
	businessBuilderSessionsTotal, err = meter.Int64Counter(
		"business_builder_sessions_total",
		otelmetric.WithDescription("Total number of builder sessions"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessBuilderSessionDurationSeconds, err = meter.Float64Histogram(
		"business_builder_session_duration_seconds",
		otelmetric.WithDescription("Duration of builder sessions in seconds"),
		otelmetric.WithUnit("s"),
	)
	if err != nil {
		return err
	}

	businessAssetUploadsTotal, err = meter.Int64Counter(
		"business_asset_uploads_total",
		otelmetric.WithDescription("Total number of asset uploads"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessLayoutSelectionsTotal, err = meter.Int64Counter(
		"business_layout_selections_total",
		otelmetric.WithDescription("Total number of layout selections"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	// Conversion Metrics
	businessPublishAttemptsTotal, err = meter.Int64Counter(
		"business_publish_attempts_total",
		otelmetric.WithDescription("Total number of publish attempts"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessPublishSuccessTotal, err = meter.Int64Counter(
		"business_publish_success_total",
		otelmetric.WithDescription("Total number of successful publishes"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessPublishFailuresTotal, err = meter.Int64Counter(
		"business_publish_failures_total",
		otelmetric.WithDescription("Total number of failed publishes"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	// Guest Engagement Metrics
	businessInvitationViewsTotal, err = meter.Int64Counter(
		"business_invitation_views_total",
		otelmetric.WithDescription("Total number of invitation views"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessRSVPSubmissionsTotal, err = meter.Int64Counter(
		"business_rsvp_submissions_total",
		otelmetric.WithDescription("Total number of RSVP submissions"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	// Feature Usage Metrics
	businessThemeChangesTotal, err = meter.Int64Counter(
		"business_theme_changes_total",
		otelmetric.WithDescription("Total number of theme changes"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessSectionTogglesTotal, err = meter.Int64Counter(
		"business_section_toggles_total",
		otelmetric.WithDescription("Total number of section enable/disable events"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	businessLanguageSwitchesTotal, err = meter.Int64Counter(
		"business_language_switches_total",
		otelmetric.WithDescription("Total number of language switching events"),
		otelmetric.WithUnit("1"),
	)
	if err != nil {
		return err
	}

	return nil
}
