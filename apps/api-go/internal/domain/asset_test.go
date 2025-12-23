package domain

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAsset_Validate_ValidAsset_ReturnsNoError(t *testing.T) {
	// Arrange
	asset := &Asset{
		URL:      "/uploads/test.jpg",
		Filename: "test.jpg",
		UserID:   "user-123",
	}

	// Act
	err := asset.Validate()

	// Assert
	require.NoError(t, err, "Valid asset should not return error")
}

func TestAsset_Validate_EmptyURL_ReturnsError(t *testing.T) {
	// Arrange
	asset := &Asset{
		URL:      "",
		Filename: "test.jpg",
		UserID:   "user-123",
	}

	// Act
	err := asset.Validate()

	// Assert
	require.Error(t, err, "Asset with empty URL should return error")
	assert.Equal(t, ErrInvalidAssetURL, err, "Should return ErrInvalidAssetURL")
}

func TestAsset_Validate_EmptyFilename_ReturnsError(t *testing.T) {
	// Arrange
	asset := &Asset{
		URL:      "/uploads/test.jpg",
		Filename: "",
		UserID:   "user-123",
	}

	// Act
	err := asset.Validate()

	// Assert
	require.Error(t, err, "Asset with empty filename should return error")
	assert.Equal(t, ErrInvalidFilename, err, "Should return ErrInvalidFilename")
}

func TestAsset_Validate_EmptyUserID_ReturnsError(t *testing.T) {
	// Arrange
	asset := &Asset{
		URL:      "/uploads/test.jpg",
		Filename: "test.jpg",
		UserID:   "",
	}

	// Act
	err := asset.Validate()

	// Assert
	require.Error(t, err, "Asset with empty user ID should return error")
	assert.Equal(t, ErrInvalidUserID, err, "Should return ErrInvalidUserID")
}

func TestNewAsset_ValidData_ReturnsAsset(t *testing.T) {
	// Arrange
	url := "/uploads/test.jpg"
	filename := "test.jpg"
	originalName := "photo.jpg"
	mimeType := "image/jpeg"
	userID := "user-123"
	size := int64(1024)

	// Act
	asset, err := NewAsset(url, filename, originalName, mimeType, userID, size)

	// Assert
	require.NoError(t, err, "Valid asset creation should not return error")
	require.NotNil(t, asset, "Asset should not be nil")
	assert.Equal(t, url, asset.URL, "URL should match")
	assert.Equal(t, filename, asset.Filename, "Filename should match")
	assert.Equal(t, originalName, asset.OriginalName, "Original name should match")
	assert.Equal(t, mimeType, asset.MimeType, "Mime type should match")
	assert.Equal(t, userID, asset.UserID, "User ID should match")
	assert.Equal(t, size, asset.Size, "Size should match")
}

