package asset

import (
	"context"
	"errors"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUploadAssetUseCase_Execute_ValidAsset_ReturnsAsset(t *testing.T) {
	// Arrange
	filename := "test.jpg"
	originalName := "photo.jpg"
	mimeType := "image/jpeg"
	size := int64(1024)
	userID := "user-123"

	mockRepo := &MockAssetRepository{
		CreateFn: func(ctx context.Context, asset *domain.Asset) error {
			if asset.OriginalName != originalName || asset.MimeType != mimeType || asset.UserID != userID || asset.Size != size {
				return errors.New("unexpected asset data")
			}
			return nil
		},
	}

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
}

func TestUploadAssetUseCase_Execute_RepositoryError_ReturnsError(t *testing.T) {
	// Arrange
	filename := "test.jpg"
	originalName := "photo.jpg"
	mimeType := "image/jpeg"
	size := int64(1024)
	userID := "user-123"
	repoError := errors.New("repository error")

	mockRepo := &MockAssetRepository{
		CreateFn: func(ctx context.Context, asset *domain.Asset) error {
			return repoError
		},
	}

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
}
