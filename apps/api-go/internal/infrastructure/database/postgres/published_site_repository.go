package postgres

import (
	"context"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"gorm.io/gorm"
)

type publishedSiteRepository struct {
	db *gorm.DB
}

func NewPublishedSiteRepository(db *gorm.DB) repository.PublishedSiteRepository {
	return &publishedSiteRepository{db: db}
}

func (r *publishedSiteRepository) FindBySubdomain(ctx context.Context, subdomain string) (*domain.PublishedSite, error) {
	var model PublishedSiteModel
	if err := r.db.WithContext(ctx).Where("subdomain = ?", subdomain).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toPublishedSiteDomain(&model), nil
}

func (r *publishedSiteRepository) FindByInvitationID(ctx context.Context, invitationID string) (*domain.PublishedSite, error) {
	var model PublishedSiteModel
	if err := r.db.WithContext(ctx).Where("invitation_id = ?", invitationID).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toPublishedSiteDomain(&model), nil
}

func (r *publishedSiteRepository) Create(ctx context.Context, site *domain.PublishedSite) error {
	now := time.Now()
	model := &PublishedSiteModel{
		ID:             site.ID,
		InvitationID:   site.InvitationID,
		OwnerUserID:    site.OwnerUserID,
		Subdomain:      site.Subdomain,
		Published:      site.Published,
		CurrentVersion: site.CurrentVersion,
		CreatedAt:      now,
		UpdatedAt:      now,
		PublishedAt:    site.PublishedAt,
	}
	return r.db.WithContext(ctx).Create(model).Error
}

func (r *publishedSiteRepository) Update(ctx context.Context, site *domain.PublishedSite) error {
	model := &PublishedSiteModel{
		ID:             site.ID,
		InvitationID:   site.InvitationID,
		OwnerUserID:    site.OwnerUserID,
		Subdomain:      site.Subdomain,
		Published:      site.Published,
		CurrentVersion: site.CurrentVersion,
		UpdatedAt:      time.Now(),
		PublishedAt:    site.PublishedAt,
	}
	return r.db.WithContext(ctx).Model(&PublishedSiteModel{}).Where("id = ?", site.ID).Updates(model).Error
}

func toPublishedSiteDomain(model *PublishedSiteModel) *domain.PublishedSite {
	return &domain.PublishedSite{
		ID:             model.ID,
		InvitationID:   model.InvitationID,
		OwnerUserID:    model.OwnerUserID,
		Subdomain:      model.Subdomain,
		Published:      model.Published,
		CurrentVersion: model.CurrentVersion,
		CreatedAt:      model.CreatedAt,
		UpdatedAt:      model.UpdatedAt,
		PublishedAt:    model.PublishedAt,
	}
}
