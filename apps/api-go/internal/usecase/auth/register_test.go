package auth

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestRegisterUseCase_Execute_ValidRegistration_ReturnsUser(t *testing.T) {
	// Arrange
	email := "newuser@example.com"
	password := "ValidPass123"
	name := stringPtr("New User")

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByEmail", mock.Anything, email).Return(nil, nil)
	mockRepo.On("Create", mock.Anything, mock.MatchedBy(func(user *domain.User) bool {
		return user.Email == email && user.Password != "" && user.Name != nil && *user.Name == "New User"
	})).Return(nil)

	useCase := NewRegisterUseCase(mockRepo)
	input := RegisterInput{
		Email:    email,
		Password: password,
		Name:     name,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid registration should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.User, "User should not be nil")
	assert.Equal(t, email, output.User.Email, "User email should match")
	assert.Equal(t, name, output.User.Name, "User name should match")
	assert.NotEmpty(t, output.User.ID, "User ID should be generated")
	mockRepo.AssertExpectations(t)
}

func TestRegisterUseCase_Execute_DuplicateEmail_ReturnsError(t *testing.T) {
	// Arrange
	email := "existing@example.com"
	password := "ValidPass123"

	existingUser := &domain.User{
		ID:    "existing-user-123",
		Email: email,
	}

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByEmail", mock.Anything, email).Return(existingUser, nil)

	useCase := NewRegisterUseCase(mockRepo)
	input := RegisterInput{
		Email:    email,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Duplicate email should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockRepo.AssertExpectations(t)
}

func TestRegisterUseCase_Execute_WithoutName_ReturnsUser(t *testing.T) {
	// Arrange
	email := "noname@example.com"
	password := "ValidPass123"

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByEmail", mock.Anything, email).Return(nil, nil)
	mockRepo.On("Create", mock.Anything, mock.MatchedBy(func(user *domain.User) bool {
		return user.Email == email && user.Password != "" && user.Name == nil
	})).Return(nil)

	useCase := NewRegisterUseCase(mockRepo)
	input := RegisterInput{
		Email:    email,
		Password: password,
		Name:     nil,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Registration without name should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.User, "User should not be nil")
	assert.Equal(t, email, output.User.Email, "User email should match")
	assert.Nil(t, output.User.Name, "User name should be nil")
	mockRepo.AssertExpectations(t)
}

func TestRegisterUseCase_Execute_RepositoryCreateError_ReturnsError(t *testing.T) {
	// Arrange
	email := "error@example.com"
	password := "ValidPass123"

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByEmail", mock.Anything, email).Return(nil, nil)
	mockRepo.On("Create", mock.Anything, mock.Anything).Return(assert.AnError)

	useCase := NewRegisterUseCase(mockRepo)
	input := RegisterInput{
		Email:    email,
		Password: password,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Repository create error should return error")
	assert.Nil(t, output, "Output should be nil on error")
	mockRepo.AssertExpectations(t)
}

