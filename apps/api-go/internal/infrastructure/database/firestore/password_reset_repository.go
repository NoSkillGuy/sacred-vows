package firestore

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type passwordResetRepository struct {
	client *Client
}

// NewPasswordResetRepository creates a new Firestore password reset repository
func NewPasswordResetRepository(client *Client) repository.PasswordResetRepository {
	return &passwordResetRepository{client: client}
}

func (r *passwordResetRepository) Create(ctx context.Context, token *domain.PasswordResetToken) error {
	token.CreatedAt = time.Now()

	data := map[string]interface{}{
		"id":         token.ID,
		"user_id":    token.UserID,
		"token_hash": token.TokenHash,
		"expires_at": token.ExpiresAt,
		"used":       token.Used,
		"created_at": token.CreatedAt,
	}

	_, err := r.client.Collection("password_reset_tokens").Doc(token.ID).Set(ctx, data)
	return err
}

func (r *passwordResetRepository) FindByTokenHash(ctx context.Context, hash string) (*domain.PasswordResetToken, error) {
	iter := r.client.Collection("password_reset_tokens").Where("token_hash", "==", hash).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, nil
	}
	return r.docToPasswordResetToken(docs[0])
}

func (r *passwordResetRepository) MarkAsUsed(ctx context.Context, tokenID string) error {
	_, err := r.client.Collection("password_reset_tokens").Doc(tokenID).Update(ctx, []firestore.Update{
		{Path: "used", Value: true},
	})
	return err
}

func (r *passwordResetRepository) DeleteExpired(ctx context.Context) error {
	now := time.Now()
	iter := r.client.Collection("password_reset_tokens").Where("expires_at", "<", now).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return err
	}

	batch := r.client.Batch()
	for _, doc := range docs {
		batch.Delete(doc.Ref)
	}
	_, err = batch.Commit(ctx)
	return err
}

func (r *passwordResetRepository) docToPasswordResetToken(doc *firestore.DocumentSnapshot) (*domain.PasswordResetToken, error) {
	data := doc.Data()
	token := &domain.PasswordResetToken{
		ID:        doc.Ref.ID,
		UserID:    getString(data, "user_id"),
		TokenHash: getString(data, "token_hash"),
		ExpiresAt: getTime(data, "expires_at"),
		Used:      getBool(data, "used"),
		CreatedAt: getTime(data, "created_at"),
	}

	return token, nil
}

