package auth

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetCurrentUserUseCase struct {
	userRepo repository.UserRepository
}

func NewGetCurrentUserUseCase(userRepo repository.UserRepository) *GetCurrentUserUseCase {
	return &GetCurrentUserUseCase{
		userRepo: userRepo,
	}
}

type GetCurrentUserOutput struct {
	User *UserDTO
}

func (uc *GetCurrentUserUseCase) Execute(ctx context.Context, userID string) (*GetCurrentUserOutput, error) {
	user, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil || user == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "User not found", err)
	}

	return &GetCurrentUserOutput{
		User: toUserDTO(user),
	}, nil
}
