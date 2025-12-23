package rsvp

import (
	"context"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetRSVPByInvitationUseCase_Execute_InvitationHasRSVPs_ReturnsRSVPs(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	email1 := "john@example.com"
	email2 := "jane@example.com"

	rsvps := []*domain.RSVPResponse{
		{
			ID:           "rsvp-1",
			InvitationID: invitationID,
			Name:         "John Doe",
			Date:         "2024-06-15",
			Email:        &email1,
			SubmittedAt:  time.Now(),
		},
		{
			ID:           "rsvp-2",
			InvitationID: invitationID,
			Name:         "Jane Doe",
			Date:         "2024-06-15",
			Email:        &email2,
			SubmittedAt:  time.Now(),
		},
	}

	mockRepo := new(mockRSVPRepository)
	mockRepo.On("FindByInvitationID", mock.Anything, invitationID).Return(rsvps, nil)

	useCase := NewGetRSVPByInvitationUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), invitationID)

	// Assert
	require.NoError(t, err, "Get RSVPs should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.Len(t, output.Responses, 2, "Should return 2 RSVPs")
	assert.Equal(t, 2, output.Count, "Count should be 2")
	assert.Equal(t, "rsvp-1", output.Responses[0].ID, "First RSVP ID should match")
	assert.Equal(t, "rsvp-2", output.Responses[1].ID, "Second RSVP ID should match")
	mockRepo.AssertExpectations(t)
}

