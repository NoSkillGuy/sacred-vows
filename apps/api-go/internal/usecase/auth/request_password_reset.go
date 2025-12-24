package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	emailInterface "github.com/sacred-vows/api-go/internal/interfaces/email"
	"github.com/sacred-vows/api-go/internal/interfaces/clock"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/segmentio/ksuid"
)

type RequestPasswordResetUseCase struct {
	userRepo    repository.UserRepository
	tokenRepo   repository.PasswordResetRepository
	emailService emailInterface.EmailService
	clock       clock.Clock
	frontendURL string
}

func NewRequestPasswordResetUseCase(
	userRepo repository.UserRepository,
	tokenRepo repository.PasswordResetRepository,
	emailService emailInterface.EmailService,
	clk clock.Clock,
	frontendURL string,
) *RequestPasswordResetUseCase {
	return &RequestPasswordResetUseCase{
		userRepo:     userRepo,
		tokenRepo:    tokenRepo,
		emailService: emailService,
		clock:        clk,
		frontendURL:  frontendURL,
	}
}

type RequestPasswordResetInput struct {
	Email string
}

type RequestPasswordResetOutput struct {
	Success bool
}

func (uc *RequestPasswordResetUseCase) Execute(ctx context.Context, input RequestPasswordResetInput) (*RequestPasswordResetOutput, error) {
	// Check if user exists
	user, err := uc.userRepo.FindByEmail(ctx, input.Email)
	if err != nil {
		// Return success even if error (security best practice - don't reveal if email exists)
		return &RequestPasswordResetOutput{Success: true}, nil
	}

	// If user doesn't exist, still return success (security best practice)
	if user == nil {
		return &RequestPasswordResetOutput{Success: true}, nil
	}

	// Generate secure random token (32 bytes)
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to generate reset token", err)
	}

	// Encode token as base64 URL-safe string
	rawToken := base64.URLEncoding.EncodeToString(tokenBytes)

	// Hash token using SHA-256 for deterministic lookup (unlike bcrypt which is non-deterministic)
	// We use SHA-256 because we need to be able to look up tokens by hash
	tokenHash := auth.HashTokenForStorage(rawToken)

	// Set expiry to 24 hours from now
	expiresAt := uc.clock.Now().Add(24 * time.Hour)

	// Create password reset token entity
	token, err := domain.NewPasswordResetToken(
		ksuid.New().String(),
		user.ID,
		tokenHash,
		expiresAt,
	)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid token data", err)
	}

	// Store token in database
	if err := uc.tokenRepo.Create(ctx, token); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to store reset token", err)
	}

	// Build reset link
	resetLink := uc.frontendURL + "/reset-password?token=" + rawToken

	// Send email (don't fail if email sending fails - token is already stored)
	// User can request another reset if needed
	if err := uc.emailService.SendPasswordResetEmail(ctx, input.Email, resetLink); err != nil {
		// Log error but don't fail the request
		// Token is already stored, user can request another email if needed
		// In production, you might want to log this error
	}

	// Always return success (security best practice - don't reveal if email exists)
	return &RequestPasswordResetOutput{Success: true}, nil
}

