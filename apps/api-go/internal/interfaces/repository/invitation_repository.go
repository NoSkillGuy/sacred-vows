package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// InvitationRepository defines the interface for invitation data operations
type InvitationRepository interface {
	Create(ctx context.Context, invitation *domain.Invitation) error
	FindByID(ctx context.Context, id string) (*domain.Invitation, error)
	FindByUserID(ctx context.Context, userID string) ([]*domain.Invitation, error)
	Update(ctx context.Context, invitation *domain.Invitation) error
	Delete(ctx context.Context, id string) error
}
