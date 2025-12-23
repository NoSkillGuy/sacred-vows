package rsvp

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// mockRSVPRepository is a mock implementation of RSVPRepository
type mockRSVPRepository struct {
	mock.Mock
}

func (m *mockRSVPRepository) Create(ctx context.Context, rsvp *domain.RSVPResponse) error {
	args := m.Called(ctx, rsvp)
	return args.Error(0)
}

func (m *mockRSVPRepository) FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.RSVPResponse, error) {
	args := m.Called(ctx, invitationID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.RSVPResponse), args.Error(1)
}

func (m *mockRSVPRepository) FindByID(ctx context.Context, id string) (*domain.RSVPResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.RSVPResponse), args.Error(1)
}

func TestSubmitRSVPUseCase_Execute_ValidRSVP_ReturnsRSVP(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	name := "John Doe"
	date := "2024-06-15"
	email := "john@example.com"
	phone := "123-456-7890"
	message := "Looking forward to it!"

	mockRepo := new(mockRSVPRepository)
	mockRepo.On("Create", mock.Anything, mock.MatchedBy(func(rsvp *domain.RSVPResponse) bool {
		return rsvp.InvitationID == invitationID && rsvp.Name == name && rsvp.Date == date
	})).Return(nil)

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
	mockRepo.AssertExpectations(t)
}

