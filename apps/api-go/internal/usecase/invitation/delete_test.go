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

func TestDeleteInvitationUseCase_Execute_InvitationExists_DeletesInvitation(t *testing.T) {
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

	mockInvitationRepo := new(mockInvitationRepository)
	mockAssetRepo := new(mockAssetRepository)

	mockInvitationRepo.On("FindByID", mock.Anything, invitationID).Return(invitation, nil)
	mockInvitationRepo.On("Delete", mock.Anything, invitationID).Return(nil)
	mockAssetRepo.On("UntrackAllUsage", mock.Anything, invitationID).Return(nil)

	useCase := NewDeleteInvitationUseCase(mockInvitationRepo, mockAssetRepo, nil)

	// Act
	output, err := useCase.Execute(context.Background(), invitationID)

	// Assert
	require.NoError(t, err, "Successful deletion should not return error")
	require.NotNil(t, output, "Output should not be nil")
	mockInvitationRepo.AssertExpectations(t)
	mockAssetRepo.AssertExpectations(t)
}

func TestDeleteInvitationUseCase_Execute_InvitationNotFound_ReturnsError(t *testing.T) {
	// Arrange
	invitationID := "nonexistent-123"

	mockInvitationRepo := new(mockInvitationRepository)
	mockAssetRepo := new(mockAssetRepository)

	mockInvitationRepo.On("FindByID", mock.Anything, invitationID).Return(nil, nil)

	useCase := NewDeleteInvitationUseCase(mockInvitationRepo, mockAssetRepo, nil)

	// Act
	output, err := useCase.Execute(context.Background(), invitationID)

	// Assert
	require.Error(t, err, "Invitation not found should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockInvitationRepo.AssertExpectations(t)
}

