package firestore

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type publishedSiteRepository struct {
	client *Client
}

// NewPublishedSiteRepository creates a new Firestore published site repository
func NewPublishedSiteRepository(client *Client) repository.PublishedSiteRepository {
	return &publishedSiteRepository{client: client}
}

func (r *publishedSiteRepository) FindBySubdomain(ctx context.Context, subdomain string) (*domain.PublishedSite, error) {
	iter := r.client.Collection("published_sites").Where("subdomain", "==", subdomain).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, nil
	}
	return r.docToPublishedSite(docs[0])
}

func (r *publishedSiteRepository) FindByInvitationID(ctx context.Context, invitationID string) (*domain.PublishedSite, error) {
	iter := r.client.Collection("published_sites").Where("invitation_id", "==", invitationID).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, nil
	}
	return r.docToPublishedSite(docs[0])
}

func (r *publishedSiteRepository) Create(ctx context.Context, site *domain.PublishedSite) error {
	now := time.Now()
	site.CreatedAt = now
	site.UpdatedAt = now

	data := map[string]interface{}{
		"id":              site.ID,
		"invitation_id":   site.InvitationID,
		"owner_user_id":   site.OwnerUserID,
		"subdomain":       site.Subdomain,
		"published":       site.Published,
		"current_version": site.CurrentVersion,
		"created_at":      site.CreatedAt,
		"updated_at":      site.UpdatedAt,
	}

	if site.PublishedAt != nil {
		data["published_at"] = *site.PublishedAt
	}

	_, err := r.client.Collection("published_sites").Doc(site.ID).Set(ctx, data)
	return err
}

func (r *publishedSiteRepository) Update(ctx context.Context, site *domain.PublishedSite) error {
	site.UpdatedAt = time.Now()

	updates := []firestore.Update{
		{Path: "invitation_id", Value: site.InvitationID},
		{Path: "owner_user_id", Value: site.OwnerUserID},
		{Path: "subdomain", Value: site.Subdomain},
		{Path: "published", Value: site.Published},
		{Path: "current_version", Value: site.CurrentVersion},
		{Path: "updated_at", Value: site.UpdatedAt},
	}

	if site.PublishedAt != nil {
		updates = append(updates, firestore.Update{Path: "published_at", Value: *site.PublishedAt})
	}

	_, err := r.client.Collection("published_sites").Doc(site.ID).Update(ctx, updates)
	return err
}

func (r *publishedSiteRepository) docToPublishedSite(doc *firestore.DocumentSnapshot) (*domain.PublishedSite, error) {
	data := doc.Data()
	site := &domain.PublishedSite{
		ID:             doc.Ref.ID,
		InvitationID:   getString(data, "invitation_id"),
		OwnerUserID:    getString(data, "owner_user_id"),
		Subdomain:      getString(data, "subdomain"),
		Published:      getBool(data, "published"),
		CurrentVersion: getInt(data, "current_version"),
		CreatedAt:      getTime(data, "created_at"),
		UpdatedAt:      getTime(data, "updated_at"),
	}

	if publishedAt, ok := data["published_at"].(time.Time); ok {
		site.PublishedAt = &publishedAt
	}

	return site, nil
}
