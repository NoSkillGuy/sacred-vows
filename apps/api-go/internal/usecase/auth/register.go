package auth

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

type RegisterUseCase struct {
	userRepo repository.UserRepository
}

func NewRegisterUseCase(userRepo repository.UserRepository) *RegisterUseCase {
	return &RegisterUseCase{
		userRepo: userRepo,
	}
}

type RegisterInput struct {
	Email    string
	Password string
	Name     *string
}

type RegisterOutput struct {
	Token string
	User  *UserDTO
}

func (uc *RegisterUseCase) Execute(ctx context.Context, input RegisterInput) (*RegisterOutput, error) {
	// Check if user already exists
	existingUser, err := uc.userRepo.FindByEmail(ctx, input.Email)
	if err == nil && existingUser != nil {
		return nil, errors.Wrap(errors.ErrConflict.Code, "User already exists", nil)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to hash password", err)
	}

	// Create user entity
	user, err := domain.NewUser(input.Email, string(hashedPassword), input.Name)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid user data", err)
	}

	// Save user
	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to create user", err)
	}

	// Generate token (will be done by auth service)
	// For now, return user data - token generation will be handled by handler

	return &RegisterOutput{
		User: toUserDTO(user),
	}, nil
}
