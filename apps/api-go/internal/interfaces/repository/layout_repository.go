package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// LayoutRepository defines the interface for layout data operations
type LayoutRepository interface {
	Create(ctx context.Context, layout *domain.Layout) error
	FindByID(ctx context.Context, id string) (*domain.Layout, error)
	FindAll(ctx context.Context) ([]*domain.Layout, error)
	Update(ctx context.Context, layout *domain.Layout) error
	Delete(ctx context.Context, id string) error
}
