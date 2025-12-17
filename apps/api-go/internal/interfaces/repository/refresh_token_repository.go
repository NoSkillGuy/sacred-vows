package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// RefreshTokenRepository defines the interface for refresh token data operations
type RefreshTokenRepository interface {
	Create(ctx context.Context, token *domain.RefreshToken) error
	FindByTokenFingerprint(ctx context.Context, fingerprint []byte) (*domain.RefreshToken, error)
	FindByID(ctx context.Context, id string) (*domain.RefreshToken, error)
	RevokeByUserID(ctx context.Context, userID string) error
	RevokeByID(ctx context.Context, id string) error
	DeleteExpired(ctx context.Context) error
}
