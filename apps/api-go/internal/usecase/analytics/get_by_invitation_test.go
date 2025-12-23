package analytics

import (
	"context"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetAnalyticsByInvitationUseCase_Execute_InvitationHasAnalytics_ReturnsAnalytics(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	analyticsList := []*domain.Analytics{
		{
			ID:           "analytics-1",
			InvitationID: invitationID,
			Type:         domain.AnalyticsTypeView,
			Timestamp:    time.Now(),
		},
		{
			ID:           "analytics-2",
			InvitationID: invitationID,
			Type:         domain.AnalyticsTypeRSVP,
			Timestamp:    time.Now(),
		},
	}

	mockRepo := new(mockAnalyticsRepository)
	mockRepo.On("FindByInvitationID", mock.Anything, invitationID).Return(analyticsList, nil)
	mockRepo.On("CountByType", mock.Anything, invitationID, domain.AnalyticsTypeView).Return(int64(1), nil)
	mockRepo.On("CountByType", mock.Anything, invitationID, domain.AnalyticsTypeRSVP).Return(int64(1), nil)

	useCase := NewGetAnalyticsByInvitationUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), invitationID)

	// Assert
	require.NoError(t, err, "Get analytics should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.Equal(t, invitationID, output.InvitationID, "Invitation ID should match")
	assert.Equal(t, 1, output.Views, "Views count should be 1")
	assert.Equal(t, 1, output.RSVPs, "RSVPs count should be 1")
	require.Len(t, output.Analytics, 2, "Should return 2 analytics")
	mockRepo.AssertExpectations(t)
}

