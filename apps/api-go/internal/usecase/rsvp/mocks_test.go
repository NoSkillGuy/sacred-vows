package rsvp

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// MockRSVPRepository is a hand-written mock implementation of RSVPRepository
type MockRSVPRepository struct {
	CreateFn              func(ctx context.Context, rsvp *domain.RSVPResponse) error
	FindByInvitationIDFn func(ctx context.Context, invitationID string) ([]*domain.RSVPResponse, error)
	FindByIDFn           func(ctx context.Context, id string) (*domain.RSVPResponse, error)
}

func (m *MockRSVPRepository) Create(ctx context.Context, rsvp *domain.RSVPResponse) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, rsvp)
	}
	return nil
}

func (m *MockRSVPRepository) FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.RSVPResponse, error) {
	if m.FindByInvitationIDFn != nil {
		return m.FindByInvitationIDFn(ctx, invitationID)
	}
	return nil, nil
}

func (m *MockRSVPRepository) FindByID(ctx context.Context, id string) (*domain.RSVPResponse, error) {
	if m.FindByIDFn != nil {
		return m.FindByIDFn(ctx, id)
	}
	return nil, nil
}

