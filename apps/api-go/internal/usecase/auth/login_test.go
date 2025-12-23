package auth

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

// mockUserRepository is a mock implementation of UserRepository
type mockUserRepository struct {
	mock.Mock
}

func (m *mockUserRepository) Create(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *mockUserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *mockUserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *mockUserRepository) Update(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *mockUserRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestLoginUseCase_Execute_ValidCredentials_ReturnsUser(t *testing.T) {
	// Arrange
	email := "test@example.com"
	password := "ValidPass123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	require.NoError(t, err, "Failed to hash password for test")

	user := &domain.User{
		ID:       "user-123",
		Email:    email,
		Password: string(hashedPassword),
		Name:     stringPtr("Test User"),
	}

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByEmail", mock.Anything, email).Return(user, nil)

	useCase := NewLoginUseCase(mockRepo)
	input := LoginInput{
		Email:    email,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid login should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.User, "User should not be nil")
	assert.Equal(t, user.ID, output.User.ID, "User ID should match")
	assert.Equal(t, user.Email, output.User.Email, "User email should match")
	assert.Equal(t, user.Name, output.User.Name, "User name should match")
	mockRepo.AssertExpectations(t)
}

func TestLoginUseCase_Execute_UserNotFound_ReturnsError(t *testing.T) {
	// Arrange
	email := "notfound@example.com"
	password := "ValidPass123"

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByEmail", mock.Anything, email).Return(nil, nil)

	useCase := NewLoginUseCase(mockRepo)
	input := LoginInput{
		Email:    email,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "User not found should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockRepo.AssertExpectations(t)
}

func TestLoginUseCase_Execute_InvalidPassword_ReturnsError(t *testing.T) {
	// Arrange
	email := "test@example.com"
	correctPassword := "ValidPass123"
	wrongPassword := "WrongPass123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(correctPassword), bcrypt.DefaultCost)
	require.NoError(t, err, "Failed to hash password for test")

	user := &domain.User{
		ID:       "user-123",
		Email:    email,
		Password: string(hashedPassword),
	}

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByEmail", mock.Anything, email).Return(user, nil)

	useCase := NewLoginUseCase(mockRepo)
	input := LoginInput{
		Email:    email,
		Password: wrongPassword,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Invalid password should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockRepo.AssertExpectations(t)
}

func TestLoginUseCase_Execute_RepositoryError_ReturnsError(t *testing.T) {
	// Arrange
	email := "test@example.com"
	password := "ValidPass123"

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByEmail", mock.Anything, email).Return(nil, assert.AnError)

	useCase := NewLoginUseCase(mockRepo)
	input := LoginInput{
		Email:    email,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Repository error should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockRepo.AssertExpectations(t)
}

func stringPtr(s string) *string {
	return &s
}

