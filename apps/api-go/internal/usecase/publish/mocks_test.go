package publish

import (
	"context"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/clock"
)

// MockPublishedSiteRepository is a hand-written mock implementation of PublishedSiteRepository
type MockPublishedSiteRepository struct {
	FindBySubdomainFn    func(ctx context.Context, subdomain string) (*domain.PublishedSite, error)
	FindByInvitationIDFn func(ctx context.Context, invitationID string) (*domain.PublishedSite, error)
	CreateFn             func(ctx context.Context, site *domain.PublishedSite) error
	UpdateFn             func(ctx context.Context, site *domain.PublishedSite) error
}

func (m *MockPublishedSiteRepository) FindBySubdomain(ctx context.Context, subdomain string) (*domain.PublishedSite, error) {
	if m.FindBySubdomainFn != nil {
		return m.FindBySubdomainFn(ctx, subdomain)
	}
	return nil, nil
}

func (m *MockPublishedSiteRepository) FindByInvitationID(ctx context.Context, invitationID string) (*domain.PublishedSite, error) {
	if m.FindByInvitationIDFn != nil {
		return m.FindByInvitationIDFn(ctx, invitationID)
	}
	return nil, nil
}

func (m *MockPublishedSiteRepository) Create(ctx context.Context, site *domain.PublishedSite) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, site)
	}
	return nil
}

func (m *MockPublishedSiteRepository) Update(ctx context.Context, site *domain.PublishedSite) error {
	if m.UpdateFn != nil {
		return m.UpdateFn(ctx, site)
	}
	return nil
}

// MockClock is a hand-written mock implementation of Clock for publish tests
type MockClock struct {
	NowFn func() time.Time
}

func (m *MockClock) Now() time.Time {
	if m.NowFn != nil {
		return m.NowFn()
	}
	return time.Now()
}

// Ensure MockClock implements clock.Clock interface
var _ clock.Clock = (*MockClock)(nil)

