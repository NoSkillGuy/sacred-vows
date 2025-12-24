package analytics

import (
	"context"
	"errors"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/require"
)

func TestTrackViewUseCase_Execute_ValidView_TracksView(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	referrer := "https://google.com"
	userAgent := "Mozilla/5.0"
	ipAddress := "192.168.1.1"

	mockRepo := &MockAnalyticsRepository{
		CreateFn: func(ctx context.Context, analytics *domain.Analytics) error {
			if analytics.InvitationID != invitationID || analytics.Type != domain.AnalyticsTypeView {
				return errors.New("unexpected analytics data")
			}
			return nil
		},
	}

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
}

