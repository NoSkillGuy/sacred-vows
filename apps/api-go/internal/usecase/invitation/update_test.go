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

// mockAssetRepository is a mock implementation of AssetRepository
type mockAssetRepository struct {
	mock.Mock
}

func (m *mockAssetRepository) Create(ctx context.Context, asset *domain.Asset) error {
	args := m.Called(ctx, asset)
	return args.Error(0)
}

func (m *mockAssetRepository) FindByID(ctx context.Context, id string) (*domain.Asset, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Asset), args.Error(1)
}

func (m *mockAssetRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Asset, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Asset), args.Error(1)
}

func (m *mockAssetRepository) FindByURL(ctx context.Context, url string) (*domain.Asset, error) {
	args := m.Called(ctx, url)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Asset), args.Error(1)
}

func (m *mockAssetRepository) FindByURLs(ctx context.Context, urls []string) ([]*domain.Asset, error) {
	args := m.Called(ctx, urls)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Asset), args.Error(1)
}

func (m *mockAssetRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *mockAssetRepository) DeleteByURL(ctx context.Context, url string) error {
	args := m.Called(ctx, url)
	return args.Error(0)
}

func (m *mockAssetRepository) FindUsedInInvitations(ctx context.Context, assetID string) ([]string, error) {
	args := m.Called(ctx, assetID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]string), args.Error(1)
}

func (m *mockAssetRepository) TrackUsage(ctx context.Context, assetID, invitationID string) error {
	args := m.Called(ctx, assetID, invitationID)
	return args.Error(0)
}

func (m *mockAssetRepository) UntrackUsage(ctx context.Context, assetID, invitationID string) error {
	args := m.Called(ctx, assetID, invitationID)
	return args.Error(0)
}

func (m *mockAssetRepository) UntrackAllUsage(ctx context.Context, invitationID string) error {
	args := m.Called(ctx, invitationID)
	return args.Error(0)
}

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

	mockInvitationRepo := new(mockInvitationRepository)
	mockAssetRepo := new(mockAssetRepository)

	mockInvitationRepo.On("FindByID", mock.Anything, invitationID).Return(existingInvitation, nil)
	mockInvitationRepo.On("Update", mock.Anything, mock.AnythingOfType("*domain.Invitation")).Return(nil)
	mockAssetRepo.On("UntrackAllUsage", mock.Anything, invitationID).Return(nil)

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
	mockInvitationRepo.AssertExpectations(t)
	mockAssetRepo.AssertExpectations(t)
}
