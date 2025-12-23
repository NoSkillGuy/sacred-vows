package analytics

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// mockAnalyticsRepository is a mock implementation of AnalyticsRepository
type mockAnalyticsRepository struct {
	mock.Mock
}

func (m *mockAnalyticsRepository) Create(ctx context.Context, analytics *domain.Analytics) error {
	args := m.Called(ctx, analytics)
	return args.Error(0)
}

func (m *mockAnalyticsRepository) FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.Analytics, error) {
	args := m.Called(ctx, invitationID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Analytics), args.Error(1)
}

func (m *mockAnalyticsRepository) CountByType(ctx context.Context, invitationID string, analyticsType domain.AnalyticsType) (int64, error) {
	args := m.Called(ctx, invitationID, analyticsType)
	return args.Get(0).(int64), args.Error(1)
}

func TestTrackViewUseCase_Execute_ValidView_TracksView(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	referrer := "https://google.com"
	userAgent := "Mozilla/5.0"
	ipAddress := "192.168.1.1"

	mockRepo := new(mockAnalyticsRepository)
	mockRepo.On("Create", mock.Anything, mock.MatchedBy(func(analytics *domain.Analytics) bool {
		return analytics.InvitationID == invitationID && analytics.Type == domain.AnalyticsTypeView
	})).Return(nil)

	useCase := NewTrackViewUseCase(mockRepo)
	input := TrackViewInput{
		InvitationID: invitationID,
		Referrer:     &referrer,
		UserAgent:    &userAgent,
		IPAddress:    &ipAddress,
	}

	// Act
	err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid view tracking should not return error")
	mockRepo.AssertExpectations(t)
}

