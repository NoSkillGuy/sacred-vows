package auth

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// mockPasswordResetRepository is a mock implementation of PasswordResetRepository
type mockPasswordResetRepository struct {
	mock.Mock
}

func (m *mockPasswordResetRepository) Create(ctx context.Context, token *domain.PasswordResetToken) error {
	args := m.Called(ctx, token)
	return args.Error(0)
}

func (m *mockPasswordResetRepository) FindByTokenHash(ctx context.Context, hash string) (*domain.PasswordResetToken, error) {
	args := m.Called(ctx, hash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PasswordResetToken), args.Error(1)
}

func (m *mockPasswordResetRepository) MarkAsUsed(ctx context.Context, tokenID string) error {
	args := m.Called(ctx, tokenID)
	return args.Error(0)
}

func (m *mockPasswordResetRepository) DeleteExpired(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

// mockEmailService is a mock implementation of EmailService
type mockEmailService struct {
	mock.Mock
}

func (m *mockEmailService) SendPasswordResetEmail(ctx context.Context, toEmail string, resetLink string) error {
	args := m.Called(ctx, toEmail, resetLink)
	return args.Error(0)
}

func TestRequestPasswordResetUseCase_Execute_UserExists_ReturnsSuccess(t *testing.T) {
	// Arrange
	email := "test@example.com"
	frontendURL := "https://example.com"
	user := &domain.User{
		ID:    "user-123",
		Email: email,
	}

	mockUserRepo := new(mockUserRepository)
	mockTokenRepo := new(mockPasswordResetRepository)
	mockEmailSvc := new(mockEmailService)

	mockUserRepo.On("FindByEmail", mock.Anything, email).Return(user, nil)
	mockTokenRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.PasswordResetToken")).Return(nil)
	mockEmailSvc.On("SendPasswordResetEmail", mock.Anything, email, mock.MatchedBy(func(link string) bool {
		return len(link) > 0 && assert.Contains(t, link, frontendURL)
	})).Return(nil)

	useCase := NewRequestPasswordResetUseCase(mockUserRepo, mockTokenRepo, mockEmailSvc, frontendURL)
	input := RequestPasswordResetInput{
		Email: email,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Request password reset should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.True(t, output.Success, "Success should be true")
	mockUserRepo.AssertExpectations(t)
	mockTokenRepo.AssertExpectations(t)
	mockEmailSvc.AssertExpectations(t)
}

func TestRequestPasswordResetUseCase_Execute_UserNotFound_ReturnsSuccess(t *testing.T) {
	// Arrange
	email := "nonexistent@example.com"
	frontendURL := "https://example.com"

	mockUserRepo := new(mockUserRepository)
	mockTokenRepo := new(mockPasswordResetRepository)
	mockEmailSvc := new(mockEmailService)

	mockUserRepo.On("FindByEmail", mock.Anything, email).Return(nil, nil)

	useCase := NewRequestPasswordResetUseCase(mockUserRepo, mockTokenRepo, mockEmailSvc, frontendURL)
	input := RequestPasswordResetInput{
		Email: email,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Request password reset should not return error even if user not found")
	require.NotNil(t, output, "Output should not be nil")
	assert.True(t, output.Success, "Success should be true (security best practice)")
	mockUserRepo.AssertExpectations(t)
}

