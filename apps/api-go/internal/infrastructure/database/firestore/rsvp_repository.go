package firestore

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type rsvpRepository struct {
	client *Client
}

// NewRSVPRepository creates a new Firestore RSVP repository
func NewRSVPRepository(client *Client) repository.RSVPRepository {
	return &rsvpRepository{client: client}
}

func (r *rsvpRepository) Create(ctx context.Context, rsvp *domain.RSVPResponse) error {
	rsvp.SubmittedAt = time.Now()

	data := map[string]interface{}{
		"id":            rsvp.ID,
		"invitation_id": rsvp.InvitationID,
		"name":          rsvp.Name,
		"date":          rsvp.Date,
		"email":         rsvp.Email,
		"phone":         rsvp.Phone,
		"message":       rsvp.Message,
		"submitted_at":  rsvp.SubmittedAt,
	}

	_, err := r.client.Collection("rsvp_responses").Doc(rsvp.ID).Set(ctx, data)
	return err
}

func (r *rsvpRepository) FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.RSVPResponse, error) {
	iter := r.client.Collection("rsvp_responses").Where("invitation_id", "==", invitationID).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	rsvps := make([]*domain.RSVPResponse, len(docs))
	for i, doc := range docs {
		rsvps[i] = r.docToRSVP(doc)
	}
	return rsvps, nil
}

func (r *rsvpRepository) FindByID(ctx context.Context, id string) (*domain.RSVPResponse, error) {
	doc, err := r.client.Collection("rsvp_responses").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.docToRSVP(doc), nil
}

func (r *rsvpRepository) docToRSVP(doc *firestore.DocumentSnapshot) *domain.RSVPResponse {
	data := doc.Data()
	rsvp := &domain.RSVPResponse{
		ID:           doc.Ref.ID,
		InvitationID: getString(data, "invitation_id"),
		Name:         getString(data, "name"),
		Date:         getString(data, "date"),
		SubmittedAt:  getTime(data, "submitted_at"),
	}

	if email, ok := data["email"].(string); ok && email != "" {
		rsvp.Email = &email
	}
	if phone, ok := data["phone"].(string); ok && phone != "" {
		rsvp.Phone = &phone
	}
	if message, ok := data["message"].(string); ok && message != "" {
		rsvp.Message = &message
	}

	return rsvp
}
