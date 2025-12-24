package firestore

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type analyticsRepository struct {
	client *Client
}

// NewAnalyticsRepository creates a new Firestore analytics repository
func NewAnalyticsRepository(client *Client) repository.AnalyticsRepository {
	return &analyticsRepository{client: client}
}

func (r *analyticsRepository) Create(ctx context.Context, analytics *domain.Analytics) error {
	analytics.Timestamp = time.Now()

	data := map[string]interface{}{
		"id":            analytics.ID,
		"invitation_id": analytics.InvitationID,
		"type":          string(analytics.Type),
		"referrer":      analytics.Referrer,
		"user_agent":    analytics.UserAgent,
		"ip_address":    analytics.IPAddress,
		"timestamp":     analytics.Timestamp,
	}

	_, err := r.client.Collection("analytics").Doc(analytics.ID).Set(ctx, data)
	return err
}

func (r *analyticsRepository) FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.Analytics, error) {
	iter := r.client.Collection("analytics").Where("invitation_id", "==", invitationID).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	analytics := make([]*domain.Analytics, len(docs))
	for i, doc := range docs {
		analytics[i] = r.docToAnalytics(doc)
	}
	return analytics, nil
}

func (r *analyticsRepository) CountByType(ctx context.Context, invitationID string, analyticsType domain.AnalyticsType) (int64, error) {
	iter := r.client.Collection("analytics").
		Where("invitation_id", "==", invitationID).
		Where("type", "==", string(analyticsType)).
		Documents(ctx)

	docs, err := iter.GetAll()
	if err != nil {
		return 0, err
	}

	return int64(len(docs)), nil
}

func (r *analyticsRepository) docToAnalytics(doc *firestore.DocumentSnapshot) *domain.Analytics {
	data := doc.Data()
	analytics := &domain.Analytics{
		ID:           doc.Ref.ID,
		InvitationID: getString(data, "invitation_id"),
		Type:         domain.AnalyticsType(getString(data, "type")),
		Timestamp:    getTime(data, "timestamp"),
	}

	if referrer, ok := data["referrer"].(string); ok && referrer != "" {
		analytics.Referrer = &referrer
	}
	if userAgent, ok := data["user_agent"].(string); ok && userAgent != "" {
		analytics.UserAgent = &userAgent
	}
	if ipAddress, ok := data["ip_address"].(string); ok && ipAddress != "" {
		analytics.IPAddress = &ipAddress
	}

	return analytics
}
