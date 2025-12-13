package auth

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

type LoginUseCase struct {
	userRepo repository.UserRepository
}

func NewLoginUseCase(userRepo repository.UserRepository) *LoginUseCase {
	return &LoginUseCase{
		userRepo: userRepo,
	}
}

type LoginInput struct {
	Email    string
	Password string
}

type LoginOutput struct {
	Token string
	User  *UserDTO
}

func (uc *LoginUseCase) Execute(ctx context.Context, input LoginInput) (*LoginOutput, error) {
	// Find user by email
	user, err := uc.userRepo.FindByEmail(ctx, input.Email)
	if err != nil || user == nil {
		return nil, errors.Wrap(errors.ErrUnauthorized.Code, "Invalid credentials", err)
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, errors.Wrap(errors.ErrUnauthorized.Code, "Invalid credentials", err)
	}

	// Token generation will be handled by handler
	return &LoginOutput{
		User: toUserDTO(user),
	}, nil
}
