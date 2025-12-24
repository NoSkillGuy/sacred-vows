package auth

import (
	"context"
	"strings"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRequestPasswordResetUseCase_Execute_UserExists_ReturnsSuccess(t *testing.T) {
	// Arrange
	email := "test@example.com"
	frontendURL := "https://example.com"
	user := &domain.User{
		ID:    "user-123",
		Email: email,
	}

	mockUserRepo := &MockUserRepository{
		FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
			if emailAddr == email {
				return user, nil
			}
			return nil, nil
		},
	}
	mockTokenRepo := &MockPasswordResetRepository{
		CreateFn: func(ctx context.Context, token *domain.PasswordResetToken) error {
			return nil
		},
	}
	mockEmailSvc := &MockEmailService{
		SendPasswordResetEmailFn: func(ctx context.Context, toEmail string, resetLink string) error {
			if toEmail != email {
				return assert.AnError
			}
			if !strings.Contains(resetLink, frontendURL) {
				return assert.AnError
			}
			return nil
		},
	}
	mockClock := &MockClock{}

	useCase := NewRequestPasswordResetUseCase(mockUserRepo, mockTokenRepo, mockEmailSvc, mockClock, frontendURL)
	input := RequestPasswordResetInput{
		Email: email,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Request password reset should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.True(t, output.Success, "Success should be true")
}

func TestRequestPasswordResetUseCase_Execute_UserNotFound_ReturnsSuccess(t *testing.T) {
	// Arrange
	email := "nonexistent@example.com"
	frontendURL := "https://example.com"

	mockUserRepo := &MockUserRepository{
		FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
			return nil, nil
		},
	}
	mockTokenRepo := &MockPasswordResetRepository{}
	mockEmailSvc := &MockEmailService{}
	mockClock := &MockClock{}

	useCase := NewRequestPasswordResetUseCase(mockUserRepo, mockTokenRepo, mockEmailSvc, mockClock, frontendURL)
	input := RequestPasswordResetInput{
		Email: email,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Request password reset should not return error even if user not found")
	require.NotNil(t, output, "Output should not be nil")
	assert.True(t, output.Success, "Success should be true (security best practice)")
}
