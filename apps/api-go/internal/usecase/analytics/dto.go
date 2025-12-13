package analytics

import (
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
)

// AnalyticsDTO represents an analytics data transfer object
type AnalyticsDTO struct {
	ID           string    `json:"id"`
	InvitationID string    `json:"invitationId"`
	Type         string    `json:"type"`
	Referrer     *string   `json:"referrer,omitempty"`
	UserAgent    *string   `json:"userAgent,omitempty"`
	IPAddress    *string   `json:"ipAddress,omitempty"`
	Timestamp    time.Time `json:"timestamp"`
}

func toAnalyticsDTO(analytics *domain.Analytics) *AnalyticsDTO {
	return &AnalyticsDTO{
		ID:           analytics.ID,
		InvitationID: analytics.InvitationID,
		Type:         string(analytics.Type),
		Referrer:     analytics.Referrer,
		UserAgent:    analytics.UserAgent,
		IPAddress:    analytics.IPAddress,
		Timestamp:    analytics.Timestamp,
	}
}
