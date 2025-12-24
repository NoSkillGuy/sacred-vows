package auth

import (
	"context"

	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/sacred-vows/api-go/pkg/validator"
	"golang.org/x/crypto/bcrypt"
)

type ResetPasswordUseCase struct {
	tokenRepo repository.PasswordResetRepository
	userRepo  repository.UserRepository
}

func NewResetPasswordUseCase(
	tokenRepo repository.PasswordResetRepository,
	userRepo repository.UserRepository,
) *ResetPasswordUseCase {
	return &ResetPasswordUseCase{
		tokenRepo: tokenRepo,
		userRepo:  userRepo,
	}
}

type ResetPasswordInput struct {
	Token    string
	Password string
}

type ResetPasswordOutput struct {
	Success bool
}

func (uc *ResetPasswordUseCase) Execute(ctx context.Context, input ResetPasswordInput) (*ResetPasswordOutput, error) {
	// Validate password strength
	_, err := validator.NewPassword(input.Password)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, err.Error(), err)
	}

	// Hash the provided token using the same method as storage (SHA-256)
	tokenHash := auth.HashTokenForStorage(input.Token)

	// Find token by hash
	token, err := uc.tokenRepo.FindByTokenHash(ctx, tokenHash)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find reset token", err)
	}

	// Check if token exists
	if token == nil {
		return nil, errors.New(errors.ErrUnauthorized.Code, "Invalid or expired reset token")
	}

	// Verify token is valid (not expired and not used)
	if !token.IsValid() {
		if token.IsExpired() {
			return nil, errors.New(errors.ErrUnauthorized.Code, "Reset token has expired")
		}
		if token.Used {
			return nil, errors.New(errors.ErrUnauthorized.Code, "Reset token has already been used")
		}
		return nil, errors.New(errors.ErrUnauthorized.Code, "Invalid reset token")
	}

	// Find user
	user, err := uc.userRepo.FindByID(ctx, token.UserID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find user", err)
	}

	if user == nil {
		return nil, errors.New(errors.ErrNotFound.Code, "User not found")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to hash password", err)
	}

	// Update user password
	user.Password = string(hashedPassword)
	if err := uc.userRepo.Update(ctx, user); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to update password", err)
	}

	// Mark token as used
	if err := uc.tokenRepo.MarkAsUsed(ctx, token.ID); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to mark token as used", err)
	}

	return &ResetPasswordOutput{Success: true}, nil
}
