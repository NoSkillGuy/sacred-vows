package auth

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestDeleteUserUseCase_Execute_UserExists_DeletesUser(t *testing.T) {
	// Arrange
	userID := "user-123"
	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByID", mock.Anything, userID).Return(user, nil)
	mockRepo.On("Delete", mock.Anything, userID).Return(nil)

	useCase := NewDeleteUserUseCase(mockRepo)

	// Act
	err := useCase.Execute(context.Background(), userID)

	// Assert
	require.NoError(t, err, "Successful deletion should not return error")
	mockRepo.AssertExpectations(t)
}

func TestDeleteUserUseCase_Execute_UserNotFound_ReturnsError(t *testing.T) {
	// Arrange
	userID := "nonexistent-123"

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByID", mock.Anything, userID).Return(nil, nil)

	useCase := NewDeleteUserUseCase(mockRepo)

	// Act
	err := useCase.Execute(context.Background(), userID)

	// Assert
	require.Error(t, err, "User not found should return error")
	mockRepo.AssertExpectations(t)
}

func TestDeleteUserUseCase_Execute_FindByIDError_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByID", mock.Anything, userID).Return(nil, assert.AnError)

	useCase := NewDeleteUserUseCase(mockRepo)

	// Act
	err := useCase.Execute(context.Background(), userID)

	// Assert
	require.Error(t, err, "Repository error on FindByID should return error")
	mockRepo.AssertExpectations(t)
}

func TestDeleteUserUseCase_Execute_DeleteError_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockRepo := new(mockUserRepository)
	mockRepo.On("FindByID", mock.Anything, userID).Return(user, nil)
	mockRepo.On("Delete", mock.Anything, userID).Return(assert.AnError)

	useCase := NewDeleteUserUseCase(mockRepo)

	// Act
	err := useCase.Execute(context.Background(), userID)

	// Assert
	require.Error(t, err, "Repository error on Delete should return error")
	mockRepo.AssertExpectations(t)
}

