package asset

import (
	"context"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetAssetsByURLsUseCase_Execute_AssetsFound_ReturnsAssets(t *testing.T) {
	// Arrange
	urls := []string{"/uploads/test1.jpg", "/uploads/test2.png"}
	assets := []*domain.Asset{
		{
			ID:           "asset-1",
			URL:          "/uploads/test1.jpg",
			Filename:     "test1.jpg",
			OriginalName: "photo1.jpg",
			MimeType:     "image/jpeg",
			Size:         1024,
			UserID:       "user-123",
			CreatedAt:    time.Now(),
		},
		{
			ID:           "asset-2",
			URL:          "/uploads/test2.png",
			Filename:     "test2.png",
			OriginalName: "photo2.png",
			MimeType:     "image/png",
			Size:         2048,
			UserID:       "user-123",
			CreatedAt:    time.Now(),
		},
	}

	mockRepo := &MockAssetRepository{
		FindByURLsFn: func(ctx context.Context, urlList []string) ([]*domain.Asset, error) {
			return assets, nil
		},
	}

	useCase := NewGetAssetsByURLsUseCase(mockRepo)
	input := GetAssetsByURLsInput{
		URLs: urls,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Get assets by URLs should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.Equal(t, 2, output.Count, "Count should be 2")
	require.Len(t, output.Assets, 2, "Should return 2 assets")
	assert.Equal(t, "asset-1", output.Assets[0].ID, "First asset ID should match")
	assert.Equal(t, "asset-2", output.Assets[1].ID, "Second asset ID should match")
}
