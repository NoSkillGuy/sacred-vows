package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// AnalyticsRepository defines the interface for analytics data operations
type AnalyticsRepository interface {
	Create(ctx context.Context, analytics *domain.Analytics) error
	FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.Analytics, error)
	CountByType(ctx context.Context, invitationID string, analyticsType domain.AnalyticsType) (int64, error)
}
