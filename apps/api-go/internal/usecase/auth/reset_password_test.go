package auth

import (
	"context"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
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

	mockTokenRepo := &MockPasswordResetRepository{
		FindByTokenHashFn: func(ctx context.Context, hash string) (*domain.PasswordResetToken, error) {
			return validToken, nil
		},
		MarkAsUsedFn: func(ctx context.Context, tokenID string) error {
			return nil
		},
	}
	mockUserRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			if id == userID {
				return user, nil
			}
			return nil, nil
		},
		UpdateFn: func(ctx context.Context, u *domain.User) error {
			if u.ID != userID || u.Password == "" {
				return assert.AnError
			}
			return nil
		},
	}

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
}

func TestResetPasswordUseCase_Execute_InvalidPassword_ReturnsError(t *testing.T) {
	// Arrange
	token := "valid-reset-token"
	password := "weak" // Too weak password

	mockTokenRepo := &MockPasswordResetRepository{}
	mockUserRepo := &MockUserRepository{}

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

	mockTokenRepo := &MockPasswordResetRepository{
		FindByTokenHashFn: func(ctx context.Context, hash string) (*domain.PasswordResetToken, error) {
			return nil, nil
		},
	}
	mockUserRepo := &MockUserRepository{}

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

	mockTokenRepo := &MockPasswordResetRepository{
		FindByTokenHashFn: func(ctx context.Context, hash string) (*domain.PasswordResetToken, error) {
			return expiredToken, nil
		},
	}
	mockUserRepo := &MockUserRepository{}

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
}

