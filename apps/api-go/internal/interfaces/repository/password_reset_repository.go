package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// PasswordResetRepository defines the interface for password reset token data operations
type PasswordResetRepository interface {
	Create(ctx context.Context, token *domain.PasswordResetToken) error
	FindByTokenHash(ctx context.Context, hash string) (*domain.PasswordResetToken, error)
	MarkAsUsed(ctx context.Context, tokenID string) error
	DeleteExpired(ctx context.Context) error
}
