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

func TestGetInvitationByIDUseCase_Execute(t *testing.T) {
	tests := []struct {
		name      string
		mockSetup func() *MockInvitationRepository
		input     string
		wantErr   bool
		validate  func(*testing.T, *GetInvitationByIDOutput)
	}{
		{
			name: "invitation found returns invitation",
			mockSetup: func() *MockInvitationRepository {
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
				return &MockInvitationRepository{
					FindByIDFn: func(ctx context.Context, id string) (*domain.Invitation, error) {
						if id == invitationID {
							return invitation, nil
						}
						return nil, nil
					},
				}
			},
			input:   "invitation-123",
			wantErr: false,
			validate: func(t *testing.T, output *GetInvitationByIDOutput) {
				require.NotNil(t, output, "Output should not be nil")
				require.NotNil(t, output.Invitation, "Invitation should not be nil")
				assert.Equal(t, "invitation-123", output.Invitation.ID, "Invitation ID should match")
				assert.Equal(t, "user-123", output.Invitation.UserID, "User ID should match")
				assert.Equal(t, "classic-scroll", output.Invitation.LayoutID, "Layout ID should match")
			},
		},
		{
			name: "invitation not found returns error",
			mockSetup: func() *MockInvitationRepository {
				return &MockInvitationRepository{
					FindByIDFn: func(ctx context.Context, id string) (*domain.Invitation, error) {
						return nil, nil
					},
				}
			},
			input:   "nonexistent-123",
			wantErr: true,
			validate: func(t *testing.T, output *GetInvitationByIDOutput) {
				assert.Nil(t, output, "Output should be nil on error")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Arrange
			mockRepo := tt.mockSetup()
			useCase := NewGetInvitationByIDUseCase(mockRepo)

			// Act
			output, err := useCase.Execute(context.Background(), tt.input)

			// Assert
			if tt.wantErr {
				require.Error(t, err, "Expected error but got none")
			} else {
				require.NoError(t, err, "Expected no error but got one")
			}
			if tt.validate != nil {
				tt.validate(t, output)
			}
		})
	}
}

