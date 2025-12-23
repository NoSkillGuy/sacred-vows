package auth

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestJWTService_GenerateAccessToken_ValidInput_ReturnsToken(t *testing.T) {
	// Arrange
	secret := "test-secret-key-32-characters-long"
	service := NewJWTService(secret, 15*time.Minute, 30*24*time.Hour, "test-issuer", "test-audience", 60*time.Second)
	userID := "user-123"
	email := "test@example.com"

	// Act
	token, err := service.GenerateAccessToken(userID, email)

	// Assert
	require.NoError(t, err, "Token generation should not return error")
	assert.NotEmpty(t, token, "Token should not be empty")
}

func TestJWTService_ValidateAccessToken_ValidToken_ReturnsClaims(t *testing.T) {
	// Arrange
	secret := "test-secret-key-32-characters-long"
	service := NewJWTService(secret, 15*time.Minute, 30*24*time.Hour, "test-issuer", "test-audience", 60*time.Second)
	userID := "user-123"
	email := "test@example.com"

	token, err := service.GenerateAccessToken(userID, email)
	require.NoError(t, err, "Token generation should not return error")

	// Act
	claims, err := service.ValidateAccessToken(token)

	// Assert
	require.NoError(t, err, "Token validation should not return error")
	require.NotNil(t, claims, "Claims should not be nil")
	assert.Equal(t, userID, claims.UserID, "User ID should match")
	assert.Equal(t, email, claims.Email, "Email should match")
}

func TestJWTService_ValidateAccessToken_InvalidToken_ReturnsError(t *testing.T) {
	// Arrange
	secret := "test-secret-key-32-characters-long"
	service := NewJWTService(secret, 15*time.Minute, 30*24*time.Hour, "test-issuer", "test-audience", 60*time.Second)
	invalidToken := "invalid.token.string"

	// Act
	claims, err := service.ValidateAccessToken(invalidToken)

	// Assert
	require.Error(t, err, "Invalid token should return error")
	assert.Nil(t, claims, "Claims should be nil on error")
}

func TestJWTService_GenerateRefreshToken_ValidInput_ReturnsToken(t *testing.T) {
	// Arrange
	secret := "test-secret-key-32-characters-long"
	service := NewJWTService(secret, 15*time.Minute, 30*24*time.Hour, "test-issuer", "test-audience", 60*time.Second)
	userID := "user-123"
	email := "test@example.com"

	// Act
	tokenID, token, err := service.GenerateRefreshToken(userID, email)

	// Assert
	require.NoError(t, err, "Refresh token generation should not return error")
	assert.NotEmpty(t, tokenID, "Token ID should not be empty")
	assert.NotEmpty(t, token, "Token should not be empty")
}

