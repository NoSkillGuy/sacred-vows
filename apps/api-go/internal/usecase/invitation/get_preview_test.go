package invitation

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetInvitationPreviewUseCase_Execute_InvitationFound_ReturnsPreview(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	userID := "user-123"
	layoutID := "classic-scroll"
	data := json.RawMessage(`{"title": "My Wedding"}`)

	invitation := &domain.Invitation{
		ID:       invitationID,
		UserID:   userID,
		LayoutID: layoutID,
		Data:     data,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	mockRepo := new(mockInvitationRepository)
	mockRepo.On("FindByID", mock.Anything, invitationID).Return(invitation, nil)

	useCase := NewGetInvitationPreviewUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), invitationID)

	// Assert
	require.NoError(t, err, "Invitation found should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.Invitation, "Preview should not be nil")
	assert.Equal(t, invitationID, output.Invitation.ID, "Invitation ID should match")
	assert.Equal(t, layoutID, output.Invitation.LayoutID, "Layout ID should match")
	assert.Equal(t, data, output.Invitation.Data, "Data should match")
	mockRepo.AssertExpectations(t)
}

func TestGetInvitationPreviewUseCase_Execute_InvitationNotFound_ReturnsError(t *testing.T) {
	// Arrange
	invitationID := "nonexistent-123"

	mockRepo := new(mockInvitationRepository)
	mockRepo.On("FindByID", mock.Anything, invitationID).Return(nil, nil)

	useCase := NewGetInvitationPreviewUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), invitationID)

	// Assert
	require.Error(t, err, "Invitation not found should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockRepo.AssertExpectations(t)
}

