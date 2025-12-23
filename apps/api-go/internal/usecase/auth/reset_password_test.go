package auth

import (
	"context"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestResetPasswordUseCase_Execute_ValidToken_ResetsPassword(t *testing.T) {
	// Arrange
	token := "valid-reset-token"
	password := "NewValidPass123"
	userID := "user-123"
	tokenHash := "hashed-token"

	validToken := &domain.PasswordResetToken{
		ID:        "token-123",
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Used:      false,
	}

	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockTokenRepo := new(mockPasswordResetRepository)
	mockUserRepo := new(mockUserRepository)

	mockTokenRepo.On("FindByTokenHash", mock.Anything, mock.Anything).Return(validToken, nil)
	mockUserRepo.On("FindByID", mock.Anything, userID).Return(user, nil)
	mockUserRepo.On("Update", mock.Anything, mock.MatchedBy(func(u *domain.User) bool {
		return u.ID == userID && u.Password != ""
	})).Return(nil)
	mockTokenRepo.On("MarkAsUsed", mock.Anything, validToken.ID).Return(nil)

	useCase := NewResetPasswordUseCase(mockTokenRepo, mockUserRepo)
	input := ResetPasswordInput{
		Token:    token,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid reset should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.True(t, output.Success, "Success should be true")
	mockTokenRepo.AssertExpectations(t)
	mockUserRepo.AssertExpectations(t)
}

func TestResetPasswordUseCase_Execute_InvalidPassword_ReturnsError(t *testing.T) {
	// Arrange
	token := "valid-reset-token"
	password := "weak" // Too weak password

	mockTokenRepo := new(mockPasswordResetRepository)
	mockUserRepo := new(mockUserRepository)

	useCase := NewResetPasswordUseCase(mockTokenRepo, mockUserRepo)
	input := ResetPasswordInput{
		Token:    token,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Invalid password should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestResetPasswordUseCase_Execute_TokenNotFound_ReturnsError(t *testing.T) {
	// Arrange
	token := "nonexistent-token"
	password := "NewValidPass123"

	mockTokenRepo := new(mockPasswordResetRepository)
	mockUserRepo := new(mockUserRepository)

	mockTokenRepo.On("FindByTokenHash", mock.Anything, mock.Anything).Return(nil, nil)

	useCase := NewResetPasswordUseCase(mockTokenRepo, mockUserRepo)
	input := ResetPasswordInput{
		Token:    token,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Token not found should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockTokenRepo.AssertExpectations(t)
}

func TestResetPasswordUseCase_Execute_ExpiredToken_ReturnsError(t *testing.T) {
	// Arrange
	token := "expired-token"
	password := "NewValidPass123"
	userID := "user-123"
	tokenHash := "hashed-token"

	expiredToken := &domain.PasswordResetToken{
		ID:        "token-123",
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(-24 * time.Hour), // Expired
		Used:      false,
	}

	mockTokenRepo := new(mockPasswordResetRepository)
	mockUserRepo := new(mockUserRepository)

	mockTokenRepo.On("FindByTokenHash", mock.Anything, mock.Anything).Return(expiredToken, nil)

	useCase := NewResetPasswordUseCase(mockTokenRepo, mockUserRepo)
	input := ResetPasswordInput{
		Token:    token,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Expired token should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockTokenRepo.AssertExpectations(t)
}

