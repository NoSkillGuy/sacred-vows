package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/require"
)

func TestDeleteUserUseCase_Execute_UserExists_DeletesUser(t *testing.T) {
	// Arrange
	userID := "user-123"
	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			if id == userID {
				return user, nil
			}
			return nil, nil
		},
		DeleteFn: func(ctx context.Context, id string) error {
			return nil
		},
	}

	useCase := NewDeleteUserUseCase(mockRepo)

	// Act
	err := useCase.Execute(context.Background(), userID)

	// Assert
	require.NoError(t, err, "Successful deletion should not return error")
}

func TestDeleteUserUseCase_Execute_UserNotFound_ReturnsError(t *testing.T) {
	// Arrange
	userID := "nonexistent-123"

	mockRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			return nil, nil
		},
	}

	useCase := NewDeleteUserUseCase(mockRepo)

	// Act
	err := useCase.Execute(context.Background(), userID)

	// Assert
	require.Error(t, err, "User not found should return error")
}

func TestDeleteUserUseCase_Execute_FindByIDError_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	repoError := errors.New("repository error")

	mockRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			return nil, repoError
		},
	}

	useCase := NewDeleteUserUseCase(mockRepo)

	// Act
	err := useCase.Execute(context.Background(), userID)

	// Assert
	require.Error(t, err, "Repository error on FindByID should return error")
}

func TestDeleteUserUseCase_Execute_DeleteError_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}
	deleteError := errors.New("delete error")

	mockRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			if id == userID {
				return user, nil
			}
			return nil, nil
		},
		DeleteFn: func(ctx context.Context, id string) error {
			return deleteError
		},
	}

	useCase := NewDeleteUserUseCase(mockRepo)

	// Act
	err := useCase.Execute(context.Background(), userID)

	// Assert
	require.Error(t, err, "Repository error on Delete should return error")
}
