package asset

import (
	"context"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestDeleteAssetUseCase_Execute_AssetExists_DeletesAsset(t *testing.T) {
	// Arrange
	url := "/uploads/test.jpg"
	asset := &domain.Asset{
		ID:           "asset-123",
		URL:          url,
		Filename:     "test.jpg",
		OriginalName: "photo.jpg",
		MimeType:     "image/jpeg",
		Size:         1024,
		UserID:       "user-123",
		CreatedAt:    time.Now(),
	}

	mockRepo := new(mockAssetRepositoryForUpload)
	mockRepo.On("FindByURL", mock.Anything, url).Return(asset, nil)
	mockRepo.On("DeleteByURL", mock.Anything, url).Return(nil)

	useCase := NewDeleteAssetUseCase(mockRepo)

	// Act
	result, err := useCase.Execute(context.Background(), url)

	// Assert
	require.NoError(t, err, "Successful deletion should not return error")
	require.NotNil(t, result, "Result should not be nil")
	assert.Equal(t, asset.ID, result.ID, "Asset ID should match")
	mockRepo.AssertExpectations(t)
}

func TestDeleteAssetUseCase_Execute_AssetNotFound_ReturnsError(t *testing.T) {
	// Arrange
	url := "/uploads/nonexistent.jpg"

	mockRepo := new(mockAssetRepositoryForUpload)
	mockRepo.On("FindByURL", mock.Anything, url).Return(nil, nil)

	useCase := NewDeleteAssetUseCase(mockRepo)

	// Act
	result, err := useCase.Execute(context.Background(), url)

	// Assert
	require.Error(t, err, "Asset not found should return error")
	assert.Nil(t, result, "Result should be nil on error")
	mockRepo.AssertExpectations(t)
}

