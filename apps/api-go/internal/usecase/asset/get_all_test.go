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

func TestGetAllAssetsUseCase_Execute_UserHasAssets_ReturnsAssets(t *testing.T) {
	// Arrange
	userID := "user-123"
	assets := []*domain.Asset{
		{
			ID:           "asset-1",
			URL:          "/uploads/asset1.jpg",
			Filename:     "asset1.jpg",
			OriginalName: "photo1.jpg",
			MimeType:     "image/jpeg",
			Size:         1024,
			UserID:       userID,
			CreatedAt:    time.Now(),
		},
		{
			ID:           "asset-2",
			URL:          "/uploads/asset2.png",
			Filename:     "asset2.png",
			OriginalName: "photo2.png",
			MimeType:     "image/png",
			Size:         2048,
			UserID:       userID,
			CreatedAt:    time.Now(),
		},
	}

	mockRepo := new(mockAssetRepositoryForUpload)
	mockRepo.On("FindByUserID", mock.Anything, userID).Return(assets, nil)

	useCase := NewGetAllAssetsUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), userID)

	// Assert
	require.NoError(t, err, "Get all assets should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.Len(t, output.Assets, 2, "Should return 2 assets")
	assert.Equal(t, "asset-1", output.Assets[0].ID, "First asset ID should match")
	assert.Equal(t, "asset-2", output.Assets[1].ID, "Second asset ID should match")
	mockRepo.AssertExpectations(t)
}

