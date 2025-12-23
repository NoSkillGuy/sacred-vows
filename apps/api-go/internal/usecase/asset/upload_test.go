package asset

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// mockAssetRepositoryForUpload is a mock implementation of AssetRepository for upload tests
type mockAssetRepositoryForUpload struct {
	mock.Mock
}

func (m *mockAssetRepositoryForUpload) Create(ctx context.Context, asset *domain.Asset) error {
	args := m.Called(ctx, asset)
	return args.Error(0)
}

func (m *mockAssetRepositoryForUpload) FindByID(ctx context.Context, id string) (*domain.Asset, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Asset), args.Error(1)
}

func (m *mockAssetRepositoryForUpload) FindByUserID(ctx context.Context, userID string) ([]*domain.Asset, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Asset), args.Error(1)
}

func (m *mockAssetRepositoryForUpload) FindByURL(ctx context.Context, url string) (*domain.Asset, error) {
	args := m.Called(ctx, url)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Asset), args.Error(1)
}

func (m *mockAssetRepositoryForUpload) FindByURLs(ctx context.Context, urls []string) ([]*domain.Asset, error) {
	args := m.Called(ctx, urls)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Asset), args.Error(1)
}

func (m *mockAssetRepositoryForUpload) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *mockAssetRepositoryForUpload) DeleteByURL(ctx context.Context, url string) error {
	args := m.Called(ctx, url)
	return args.Error(0)
}

func (m *mockAssetRepositoryForUpload) FindUsedInInvitations(ctx context.Context, assetID string) ([]string, error) {
	args := m.Called(ctx, assetID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]string), args.Error(1)
}

func (m *mockAssetRepositoryForUpload) TrackUsage(ctx context.Context, assetID, invitationID string) error {
	args := m.Called(ctx, assetID, invitationID)
	return args.Error(0)
}

func (m *mockAssetRepositoryForUpload) UntrackUsage(ctx context.Context, assetID, invitationID string) error {
	args := m.Called(ctx, assetID, invitationID)
	return args.Error(0)
}

func (m *mockAssetRepositoryForUpload) UntrackAllUsage(ctx context.Context, invitationID string) error {
	args := m.Called(ctx, invitationID)
	return args.Error(0)
}

func TestUploadAssetUseCase_Execute_ValidAsset_ReturnsAsset(t *testing.T) {
	// Arrange
	filename := "test.jpg"
	originalName := "photo.jpg"
	mimeType := "image/jpeg"
	size := int64(1024)
	userID := "user-123"

	mockRepo := new(mockAssetRepositoryForUpload)
	mockRepo.On("Create", mock.Anything, mock.MatchedBy(func(asset *domain.Asset) bool {
		return asset.OriginalName == originalName && asset.MimeType == mimeType && asset.UserID == userID && asset.Size == size
	})).Return(nil)

	useCase := NewUploadAssetUseCase(mockRepo, 10*1024*1024, []string{"image/*"})
	input := UploadAssetInput{
		Filename:     filename,
		OriginalName: originalName,
		Size:         size,
		MimeType:     mimeType,
		UserID:       userID,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid upload should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.Asset, "Asset should not be nil")
	assert.NotEmpty(t, output.URL, "URL should be generated")
	assert.NotEmpty(t, output.Filename, "Filename should be generated")
	assert.Equal(t, originalName, output.Asset.OriginalName, "Original name should match")
	assert.Equal(t, mimeType, output.Asset.MimeType, "Mime type should match")
	assert.Equal(t, userID, output.Asset.UserID, "User ID should match")
	mockRepo.AssertExpectations(t)
}

func TestUploadAssetUseCase_Execute_RepositoryError_ReturnsError(t *testing.T) {
	// Arrange
	filename := "test.jpg"
	originalName := "photo.jpg"
	mimeType := "image/jpeg"
	size := int64(1024)
	userID := "user-123"

	mockRepo := new(mockAssetRepositoryForUpload)
	mockRepo.On("Create", mock.Anything, mock.Anything).Return(assert.AnError)

	useCase := NewUploadAssetUseCase(mockRepo, 10*1024*1024, []string{"image/*"})
	input := UploadAssetInput{
		Filename:     filename,
		OriginalName: originalName,
		Size:         size,
		MimeType:     mimeType,
		UserID:       userID,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Repository error should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockRepo.AssertExpectations(t)
}

