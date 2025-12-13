package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// AssetRepository defines the interface for asset data operations
type AssetRepository interface {
	Create(ctx context.Context, asset *domain.Asset) error
	FindByID(ctx context.Context, id string) (*domain.Asset, error)
	FindByUserID(ctx context.Context, userID string) ([]*domain.Asset, error)
	FindByURL(ctx context.Context, url string) (*domain.Asset, error)
	Delete(ctx context.Context, id string) error
	DeleteByURL(ctx context.Context, url string) error
}
