package analytics

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// MockAnalyticsRepository is a hand-written mock implementation of AnalyticsRepository
type MockAnalyticsRepository struct {
	CreateFn            func(ctx context.Context, analytics *domain.Analytics) error
	FindByInvitationIDFn func(ctx context.Context, invitationID string) ([]*domain.Analytics, error)
	CountByTypeFn       func(ctx context.Context, invitationID string, analyticsType domain.AnalyticsType) (int64, error)
}

func (m *MockAnalyticsRepository) Create(ctx context.Context, analytics *domain.Analytics) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, analytics)
	}
	return nil
}

func (m *MockAnalyticsRepository) FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.Analytics, error) {
	if m.FindByInvitationIDFn != nil {
		return m.FindByInvitationIDFn(ctx, invitationID)
	}
	return nil, nil
}

func (m *MockAnalyticsRepository) CountByType(ctx context.Context, invitationID string, analyticsType domain.AnalyticsType) (int64, error) {
	if m.CountByTypeFn != nil {
		return m.CountByTypeFn(ctx, invitationID, analyticsType)
	}
	return 0, nil
}

