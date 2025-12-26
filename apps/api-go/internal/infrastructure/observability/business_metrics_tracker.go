package observability

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	otelmetric "go.opentelemetry.io/otel/metric"
)

// RecordUserSignup records a user signup event
// This tracks the event of a user signing up (counter metric).
// Active user tracking (daily/weekly/monthly active users) is separate and handled by
// use cases calling MarkUserActiveWithID directly. This separation exists because:
// - Signup/login metrics track events (how many signups/logins occurred)
// - Active user tracking tracks unique users over time periods (how many unique users were active)
func RecordUserSignup(method string) {
	if businessUserSignupsTotal != nil {
		attrs := []attribute.KeyValue{
			attribute.String("method", method), // "email" or "oauth"
		}
		businessUserSignupsTotal.Add(context.Background(), 1, otelmetric.WithAttributes(attrs...))
	}
}

// RecordUserLogin records a user login event
// This tracks the event of a user logging in (counter metric).
// Active user tracking (daily/weekly/monthly active users) is separate and handled by
// use cases calling MarkUserActiveWithID directly. This separation exists because:
// - Signup/login metrics track events (how many signups/logins occurred)
// - Active user tracking tracks unique users over time periods (how many unique users were active)
func RecordUserLogin(method string) {
	if businessUserLoginsTotal != nil {
		attrs := []attribute.KeyValue{
			attribute.String("method", method), // "email" or "oauth"
		}
		businessUserLoginsTotal.Add(context.Background(), 1, otelmetric.WithAttributes(attrs...))
	}
}

// RecordInvitationCreated records an invitation creation event
func RecordInvitationCreated() {
	if businessInvitationsCreatedTotal != nil {
		businessInvitationsCreatedTotal.Add(context.Background(), 1)
	}
}

// RecordInvitationCreatedWithDuration records an invitation creation event with duration
func RecordInvitationCreatedWithDuration(durationSeconds float64) {
	RecordInvitationCreated()
	if businessInvitationCreationDurationSeconds != nil {
		businessInvitationCreationDurationSeconds.Record(context.Background(), durationSeconds)
	}
}

// RecordInvitationPublished records an invitation publication event
func RecordInvitationPublished() {
	if businessInvitationsPublishedTotal != nil {
		businessInvitationsPublishedTotal.Add(context.Background(), 1)
	}
	// Update active invitations gauge (increment)
	IncrementActiveInvitations()
}

// RecordInvitationUnpublished records when an invitation is unpublished
func RecordInvitationUnpublished() {
	// Update active invitations gauge (decrement)
	DecrementActiveInvitations()
}

// RecordBuilderSession records a builder session event
func RecordBuilderSession(durationSeconds float64) {
	if businessBuilderSessionsTotal != nil {
		businessBuilderSessionsTotal.Add(context.Background(), 1)
	}
	if businessBuilderSessionDurationSeconds != nil {
		businessBuilderSessionDurationSeconds.Record(context.Background(), durationSeconds)
	}
}

// RecordAssetUpload records an asset upload event
func RecordAssetUpload(fileType string) {
	if businessAssetUploadsTotal != nil {
		attrs := []attribute.KeyValue{
			attribute.String("file_type", fileType),
		}
		businessAssetUploadsTotal.Add(context.Background(), 1, otelmetric.WithAttributes(attrs...))
	}
}

// RecordRSVPSubmission records an RSVP submission event
func RecordRSVPSubmission() {
	if businessRSVPSubmissionsTotal != nil {
		businessRSVPSubmissionsTotal.Add(context.Background(), 1)
	}
}

// RecordPublishAttempt records a publish attempt event
func RecordPublishAttempt(success bool) {
	if businessPublishAttemptsTotal != nil {
		businessPublishAttemptsTotal.Add(context.Background(), 1)
	}
	if success {
		if businessPublishSuccessTotal != nil {
			businessPublishSuccessTotal.Add(context.Background(), 1)
		}
	} else {
		if businessPublishFailuresTotal != nil {
			businessPublishFailuresTotal.Add(context.Background(), 1)
		}
	}
}

// RecordInvitationView records an invitation view event
func RecordInvitationView() {
	if businessInvitationViewsTotal != nil {
		businessInvitationViewsTotal.Add(context.Background(), 1)
	}
}

// RecordThemeChange records a theme change event
func RecordThemeChange() {
	if businessThemeChangesTotal != nil {
		businessThemeChangesTotal.Add(context.Background(), 1)
	}
}

// RecordSectionToggle records a section toggle event
func RecordSectionToggle() {
	if businessSectionTogglesTotal != nil {
		businessSectionTogglesTotal.Add(context.Background(), 1)
	}
}

// RecordLanguageSwitch records a language switch event
func RecordLanguageSwitch() {
	if businessLanguageSwitchesTotal != nil {
		businessLanguageSwitchesTotal.Add(context.Background(), 1)
	}
}

// RecordLayoutSelection records a layout selection event
func RecordLayoutSelection(layoutId string) {
	if businessLayoutSelectionsTotal != nil {
		attrs := []attribute.KeyValue{
			attribute.String("layout_id", layoutId),
		}
		businessLayoutSelectionsTotal.Add(context.Background(), 1, otelmetric.WithAttributes(attrs...))
	}
}
