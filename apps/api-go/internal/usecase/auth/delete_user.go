package auth

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type DeleteUserUseCase struct {
	userRepo repository.UserRepository
}

func NewDeleteUserUseCase(userRepo repository.UserRepository) *DeleteUserUseCase {
	return &DeleteUserUseCase{
		userRepo: userRepo,
	}
}

func (uc *DeleteUserUseCase) Execute(ctx context.Context, userID string) error {
	// Check if user exists
	user, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		return errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find user", err)
	}
	if user == nil {
		return errors.Wrap(errors.ErrNotFound.Code, "User not found", nil)
	}

	// Delete user
	if err := uc.userRepo.Delete(ctx, userID); err != nil {
		return errors.Wrap(errors.ErrInternalServerError.Code, "Failed to delete user", err)
	}

	return nil
}

