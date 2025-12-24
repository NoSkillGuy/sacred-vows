package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// PasswordChangeOTPRepository defines the interface for password change OTP data operations
type PasswordChangeOTPRepository interface {
	Create(ctx context.Context, otp *domain.PasswordChangeOTP) error
	FindByUserID(ctx context.Context, userID string) (*domain.PasswordChangeOTP, error)
	FindByOTPHash(ctx context.Context, hash string) (*domain.PasswordChangeOTP, error)
	InvalidateByUserID(ctx context.Context, userID string) error
	IncrementAttempts(ctx context.Context, otpID string) error
	MarkAsUsed(ctx context.Context, otpID string) error
}

