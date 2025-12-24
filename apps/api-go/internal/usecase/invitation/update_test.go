package invitation

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUpdateInvitationUseCase_Execute_ValidUpdate_ReturnsUpdatedInvitation(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	userID := "user-123"
	layoutID := "classic-scroll"
	newLayoutID := "editorial-elegance"
	newData := json.RawMessage(`{"title": "Updated Wedding"}`)

	existingInvitation := &domain.Invitation{
		ID:        invitationID,
		UserID:    userID,
		LayoutID:  layoutID,
		Data:      json.RawMessage(`{"title": "My Wedding"}`),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	mockInvitationRepo := &MockInvitationRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.Invitation, error) {
			if id == invitationID {
				return existingInvitation, nil
			}
			return nil, nil
		},
		UpdateFn: func(ctx context.Context, invitation *domain.Invitation) error {
			return nil
		},
	}
	mockAssetRepo := &MockAssetRepository{
		UntrackAllUsageFn: func(ctx context.Context, invitationID string) error {
			return nil
		},
	}

	useCase := NewUpdateInvitationUseCase(mockInvitationRepo, mockAssetRepo)
	input := UpdateInvitationInput{
		ID:       invitationID,
		LayoutID: &newLayoutID,
		Data:     &newData,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid update should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.Invitation, "Invitation should not be nil")
	assert.Equal(t, invitationID, output.Invitation.ID, "Invitation ID should match")
}
