package rsvp

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSubmitRSVPUseCase_Execute_ValidRSVP_ReturnsRSVP(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	name := "John Doe"
	date := "2024-06-15"
	email := "john@example.com"
	phone := "123-456-7890"
	message := "Looking forward to it!"

	mockRepo := &MockRSVPRepository{
		CreateFn: func(ctx context.Context, rsvp *domain.RSVPResponse) error {
			if rsvp.InvitationID != invitationID || rsvp.Name != name || rsvp.Date != date {
				return assert.AnError
			}
			return nil
		},
	}

	useCase := NewSubmitRSVPUseCase(mockRepo)
	input := SubmitRSVPInput{
		InvitationID: invitationID,
		Name:         name,
		Date:         date,
		Email:        &email,
		Phone:        &phone,
		Message:      &message,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid RSVP submission should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.RSVP, "RSVP should not be nil")
	assert.Equal(t, name, output.RSVP.Name, "Name should match")
	assert.Equal(t, date, output.RSVP.Date, "Date should match")
	assert.NotEmpty(t, output.RSVP.ID, "RSVP ID should be generated")
}

