package auth

import (
	"context"
	"fmt"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/sacred-vows/api-go/pkg/validator"
	"golang.org/x/crypto/bcrypt"
)

type VerifyPasswordChangeOTPUseCase struct {
	userRepo repository.UserRepository
	otpRepo  repository.PasswordChangeOTPRepository
}

func NewVerifyPasswordChangeOTPUseCase(
	userRepo repository.UserRepository,
	otpRepo repository.PasswordChangeOTPRepository,
) *VerifyPasswordChangeOTPUseCase {
	return &VerifyPasswordChangeOTPUseCase{
		userRepo: userRepo,
		otpRepo:  otpRepo,
	}
}

type VerifyPasswordChangeOTPInput struct {
	UserID     string
	OTP        string
	NewPassword string
}

type VerifyPasswordChangeOTPOutput struct {
	Success bool
}

func (uc *VerifyPasswordChangeOTPUseCase) Execute(ctx context.Context, input VerifyPasswordChangeOTPInput) (*VerifyPasswordChangeOTPOutput, error) {
	// Validate password strength
	_, err := validator.NewPassword(input.NewPassword)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, err.Error(), err)
	}

	// Find OTP by user ID (get the active OTP for this user)
	otp, err := uc.otpRepo.FindByUserID(ctx, input.UserID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find OTP", err)
	}

	// Check if OTP exists
	if otp == nil {
		return nil, errors.New(errors.ErrUnauthorized.Code, "No active OTP found. Please request a new one.")
	}

	// Check if OTP is expired
	if otp.IsExpired() {
		return nil, errors.New(errors.ErrUnauthorized.Code, "OTP has expired. Please request a new one.")
	}

	// Check if OTP is already used
	if otp.Used {
		return nil, errors.New(errors.ErrUnauthorized.Code, "OTP has already been used. Please request a new one.")
	}

	// Check if max attempts reached
	if otp.IsMaxAttemptsReached() {
		return nil, errors.New(errors.ErrUnauthorized.Code, "Maximum attempts reached. Please request a new OTP.")
	}

	// Hash the provided OTP using the same method as storage (SHA-256)
	providedOTPHash := auth.HashTokenForStorage(input.OTP)

	// Compare hashes
	if providedOTPHash != otp.OTPHash {
		// Increment attempt count
		if err := uc.otpRepo.IncrementAttempts(ctx, otp.ID); err != nil {
			return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to increment attempt count", err)
		}

		// Get updated attempt count for error message
		updatedOTP, err := uc.otpRepo.FindByUserID(ctx, input.UserID)
		if err == nil && updatedOTP != nil {
			remainingAttempts := domain.MaxOTPAttempts - updatedOTP.AttemptCount
			if remainingAttempts > 0 {
				return nil, errors.New(errors.ErrUnauthorized.Code, fmt.Sprintf("Invalid OTP. %d attempt(s) remaining.", remainingAttempts))
			}
		}

		return nil, errors.New(errors.ErrUnauthorized.Code, "Invalid OTP. Maximum attempts reached. Please request a new OTP.")
	}

	// OTP is valid - mark as used
	if err := uc.otpRepo.MarkAsUsed(ctx, otp.ID); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to mark OTP as used", err)
	}

	// Find user
	user, err := uc.userRepo.FindByID(ctx, input.UserID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find user", err)
	}

	if user == nil {
		return nil, errors.New(errors.ErrNotFound.Code, "User not found")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to hash password", err)
	}

	// Update user password
	user.Password = string(hashedPassword)
	if err := uc.userRepo.Update(ctx, user); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to update password", err)
	}

	return &VerifyPasswordChangeOTPOutput{Success: true}, nil
}

