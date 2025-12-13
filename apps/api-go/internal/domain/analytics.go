package domain

import (
	"time"
)

// AnalyticsType represents the type of analytics event
type AnalyticsType string

const (
	AnalyticsTypeView  AnalyticsType = "view"
	AnalyticsTypeRSVP  AnalyticsType = "rsvp"
	AnalyticsTypeShare AnalyticsType = "share"
)

// Analytics represents an analytics entity
type Analytics struct {
	ID           string
	InvitationID string
	Type         AnalyticsType
	Referrer     *string
	UserAgent    *string
	IPAddress    *string
	Timestamp    time.Time
}

// Validate validates analytics entity
func (a *Analytics) Validate() error {
	if a.InvitationID == "" {
		return ErrInvalidInvitationID
	}
	if a.Type == "" {
		return ErrInvalidAnalyticsType
	}
	return nil
}

// NewAnalytics creates a new analytics entity
func NewAnalytics(invitationID string, analyticsType AnalyticsType, referrer, userAgent, ipAddress *string) (*Analytics, error) {
	analytics := &Analytics{
		InvitationID: invitationID,
		Type:         analyticsType,
		Referrer:     referrer,
		UserAgent:    userAgent,
		IPAddress:    ipAddress,
	}

	if err := analytics.Validate(); err != nil {
		return nil, err
	}

	return analytics, nil
}
