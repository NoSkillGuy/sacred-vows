package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// TemplateRepository defines the interface for template data operations
type TemplateRepository interface {
	Create(ctx context.Context, template *domain.Template) error
	FindByID(ctx context.Context, id string) (*domain.Template, error)
	FindAll(ctx context.Context) ([]*domain.Template, error)
	Update(ctx context.Context, template *domain.Template) error
	Delete(ctx context.Context, id string) error
}
