package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRegisterUseCase_Execute_ValidRegistration_ReturnsUser(t *testing.T) {
	// Arrange
	email := "newuser@example.com"
	password := "ValidPass123"
	name := stringPtr("New User")

	mockRepo := &MockUserRepository{
		FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
			return nil, nil
		},
		CreateFn: func(ctx context.Context, user *domain.User) error {
			if user.Email != email || user.Password == "" || user.Name == nil || *user.Name != "New User" {
				return errors.New("unexpected user data")
			}
			return nil
		},
	}

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
	// Note: Metrics tracking (RecordUserSignup, MarkUserActiveWithID) is verified in integration tests
}

func TestRegisterUseCase_Execute_DuplicateEmail_ReturnsError(t *testing.T) {
	// Arrange
	email := "existing@example.com"
	password := "ValidPass123"

	existingUser := &domain.User{
		ID:    "existing-user-123",
		Email: email,
	}

	mockRepo := &MockUserRepository{
		FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
			if emailAddr == email {
				return existingUser, nil
			}
			return nil, nil
		},
	}

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
}

func TestRegisterUseCase_Execute_WithoutName_ReturnsUser(t *testing.T) {
	// Arrange
	email := "noname@example.com"
	password := "ValidPass123"

	mockRepo := &MockUserRepository{
		FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
			return nil, nil
		},
		CreateFn: func(ctx context.Context, user *domain.User) error {
			if user.Email != email || user.Password == "" || user.Name != nil {
				return errors.New("unexpected user data")
			}
			return nil
		},
	}

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
}

func TestRegisterUseCase_Execute_RepositoryCreateError_ReturnsError(t *testing.T) {
	// Arrange
	email := "error@example.com"
	password := "ValidPass123"
	createError := errors.New("create error")

	mockRepo := &MockUserRepository{
		FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
			return nil, nil
		},
		CreateFn: func(ctx context.Context, user *domain.User) error {
			return createError
		},
	}

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
}
