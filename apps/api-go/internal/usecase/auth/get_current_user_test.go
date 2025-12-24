package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetCurrentUserUseCase_Execute_UserFound_ReturnsUser(t *testing.T) {
	// Arrange
	userID := "user-123"
	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
		Name:  stringPtr("Test User"),
	}

	mockRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			if id == userID {
				return user, nil
			}
			return nil, nil
		},
	}

	useCase := NewGetCurrentUserUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), userID)

	// Assert
	require.NoError(t, err, "User found should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.User, "User should not be nil")
	assert.Equal(t, user.ID, output.User.ID, "User ID should match")
	assert.Equal(t, user.Email, output.User.Email, "User email should match")
	assert.Equal(t, user.Name, output.User.Name, "User name should match")
}

func TestGetCurrentUserUseCase_Execute_UserNotFound_ReturnsError(t *testing.T) {
	// Arrange
	userID := "nonexistent-123"

	mockRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			return nil, nil
		},
	}

	useCase := NewGetCurrentUserUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), userID)

	// Assert
	require.Error(t, err, "User not found should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestGetCurrentUserUseCase_Execute_RepositoryError_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	repoError := errors.New("repository error")

	mockRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			return nil, repoError
		},
	}

	useCase := NewGetCurrentUserUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), userID)

	// Assert
	require.Error(t, err, "Repository error should return error")
	assert.Nil(t, output, "Output should be nil on error")
}
