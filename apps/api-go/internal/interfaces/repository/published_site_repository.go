package repository

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// PublishedSiteRepository defines subdomain/custom domain mapping operations.
type PublishedSiteRepository interface {
	FindBySubdomain(ctx context.Context, subdomain string) (*domain.PublishedSite, error)
	FindByInvitationID(ctx context.Context, invitationID string) (*domain.PublishedSite, error)
	Create(ctx context.Context, site *domain.PublishedSite) error
	Update(ctx context.Context, site *domain.PublishedSite) error
}


