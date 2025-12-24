package auth

import (
	"context"
	"crypto/rand"
	"fmt"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	emailInterface "github.com/sacred-vows/api-go/internal/interfaces/email"
	"github.com/sacred-vows/api-go/internal/interfaces/clock"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/segmentio/ksuid"
)

const (
	OTPResendCooldown = 30 * time.Second
)

type RequestPasswordChangeOTPUseCase struct {
	userRepo    repository.UserRepository
	otpRepo     repository.PasswordChangeOTPRepository
	emailService emailInterface.EmailService
	clock       clock.Clock
}

func NewRequestPasswordChangeOTPUseCase(
	userRepo repository.UserRepository,
	otpRepo repository.PasswordChangeOTPRepository,
	emailService emailInterface.EmailService,
	clk clock.Clock,
) *RequestPasswordChangeOTPUseCase {
	return &RequestPasswordChangeOTPUseCase{
		userRepo:     userRepo,
		otpRepo:       otpRepo,
		emailService: emailService,
		clock:         clk,
	}
}

type RequestPasswordChangeOTPInput struct {
	UserID string
	Email  string
}

type RequestPasswordChangeOTPOutput struct {
	Success bool
}

func (uc *RequestPasswordChangeOTPUseCase) Execute(ctx context.Context, input RequestPasswordChangeOTPInput) (*RequestPasswordChangeOTPOutput, error) {
	// Find user to get email
	user, err := uc.userRepo.FindByID(ctx, input.UserID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find user", err)
	}
	if user == nil {
		return nil, errors.New(errors.ErrNotFound.Code, "User not found")
	}

	// Use user's email from database (more secure than trusting input)
	userEmail := user.Email

	// Check for existing OTP and enforce cooldown
	existingOTP, err := uc.otpRepo.FindByUserID(ctx, input.UserID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to check existing OTP", err)
	}

	if existingOTP != nil {
		// Check if cooldown period has passed (30 seconds)
		timeSinceCreation := uc.clock.Now().Sub(existingOTP.CreatedAt)
		if timeSinceCreation < OTPResendCooldown {
			remainingTime := OTPResendCooldown - timeSinceCreation
			return nil, errors.New(errors.ErrTooManyRequests.Code, fmt.Sprintf("Please wait %d seconds before requesting a new OTP", int(remainingTime.Seconds())+1))
		}
	}

	// Invalidate any existing OTPs for this user
	if err := uc.otpRepo.InvalidateByUserID(ctx, input.UserID); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to invalidate existing OTPs", err)
	}

	// Generate 6-digit numeric OTP (000000-999999)
	otpValue, err := generateNumericOTP(6)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to generate OTP", err)
	}

	// Hash OTP using SHA-256 for storage
	otpHash := auth.HashTokenForStorage(otpValue)

	// Set expiry to 5 minutes from now
	expiresAt := uc.clock.Now().Add(domain.OTPValidityDuration)

	// Create OTP entity
	otp, err := domain.NewPasswordChangeOTP(
		ksuid.New().String(),
		input.UserID,
		userEmail,
		otpHash,
		expiresAt,
	)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid OTP data", err)
	}

	// Store OTP in database
	if err := uc.otpRepo.Create(ctx, otp); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to store OTP", err)
	}

	// Send OTP email
	if err := uc.emailService.SendPasswordChangeOTPEmail(ctx, userEmail, otpValue); err != nil {
		// Log error but don't fail the request
		// OTP is already stored, user can request another email if needed
		// In production, you might want to log this error
	}

	// Always return success (security best practice - don't reveal if email exists)
	return &RequestPasswordChangeOTPOutput{Success: true}, nil
}

// generateNumericOTP generates a random numeric OTP of the specified length
func generateNumericOTP(length int) (string, error) {
	if length <= 0 {
		return "", fmt.Errorf("OTP length must be positive")
	}

	// Generate random bytes
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	// Convert to numeric string (0-9)
	otp := make([]byte, length)
	for i := 0; i < length; i++ {
		otp[i] = '0' + (bytes[i] % 10)
	}

	return string(otp), nil
}

