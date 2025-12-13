package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// RSVPRepository defines the interface for RSVP data operations
type RSVPRepository interface {
	Create(ctx context.Context, rsvp *domain.RSVPResponse) error
	FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.RSVPResponse, error)
	FindByID(ctx context.Context, id string) (*domain.RSVPResponse, error)
}
