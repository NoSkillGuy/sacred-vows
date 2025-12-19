package firestore

import (
	"context"
	"encoding/json"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type invitationRepository struct {
	client *Client
}

// NewInvitationRepository creates a new Firestore invitation repository
func NewInvitationRepository(client *Client) repository.InvitationRepository {
	return &invitationRepository{client: client}
}

func (r *invitationRepository) Create(ctx context.Context, invitation *domain.Invitation) error {
	now := time.Now()
	invitation.CreatedAt = now
	invitation.UpdatedAt = now

	data := map[string]interface{}{
		"id":         invitation.ID,
		"layout_id":  invitation.LayoutID,
		"data":       string(invitation.Data),
		"user_id":    invitation.UserID,
		"created_at": invitation.CreatedAt,
		"updated_at": invitation.UpdatedAt,
	}

	_, err := r.client.Collection("invitations").Doc(invitation.ID).Set(ctx, data)
	return err
}

func (r *invitationRepository) FindByID(ctx context.Context, id string) (*domain.Invitation, error) {
	doc, err := r.client.Collection("invitations").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.docToInvitation(doc)
}

func (r *invitationRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Invitation, error) {
	iter := r.client.Collection("invitations").Where("user_id", "==", userID).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	invitations := make([]*domain.Invitation, len(docs))
	for i, doc := range docs {
		inv, err := r.docToInvitation(doc)
		if err != nil {
			return nil, err
		}
		invitations[i] = inv
	}
	return invitations, nil
}

func (r *invitationRepository) Update(ctx context.Context, invitation *domain.Invitation) error {
	invitation.UpdatedAt = time.Now()
	_, err := r.client.Collection("invitations").Doc(invitation.ID).Update(ctx, []firestore.Update{
		{Path: "layout_id", Value: invitation.LayoutID},
		{Path: "data", Value: string(invitation.Data)},
		{Path: "user_id", Value: invitation.UserID},
		{Path: "updated_at", Value: invitation.UpdatedAt},
	})
	return err
}

func (r *invitationRepository) Delete(ctx context.Context, id string) error {
	_, err := r.client.Collection("invitations").Doc(id).Delete(ctx)
	return err
}

func (r *invitationRepository) MigrateUserInvitations(ctx context.Context, fromUserID, toUserID string) (int, error) {
	iter := r.client.Collection("invitations").Where("user_id", "==", fromUserID).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return 0, err
	}

	count := 0
	batch := r.client.Batch()
	for _, doc := range docs {
		batch.Update(doc.Ref, []firestore.Update{
			{Path: "user_id", Value: toUserID},
		})
		count++
	}

	if count > 0 {
		_, err = batch.Commit(ctx)
		if err != nil {
			return 0, err
		}
	}

	return count, nil
}

func (r *invitationRepository) docToInvitation(doc *firestore.DocumentSnapshot) (*domain.Invitation, error) {
	data := doc.Data()
	invitation := &domain.Invitation{
		ID:        doc.Ref.ID,
		LayoutID:  data["layout_id"].(string),
		UserID:    data["user_id"].(string),
		CreatedAt: data["created_at"].(time.Time),
		UpdatedAt: data["updated_at"].(time.Time),
	}

	// Handle data field (stored as string, convert to json.RawMessage)
	if dataStr, ok := data["data"].(string); ok {
		invitation.Data = json.RawMessage(dataStr)
	}

	return invitation, nil
}


