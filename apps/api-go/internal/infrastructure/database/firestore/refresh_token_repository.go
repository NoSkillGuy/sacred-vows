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

type refreshTokenRepository struct {
	client *Client
}

// NewRefreshTokenRepository creates a new Firestore refresh token repository
func NewRefreshTokenRepository(client *Client) repository.RefreshTokenRepository {
	return &refreshTokenRepository{client: client}
}

func (r *refreshTokenRepository) Create(ctx context.Context, token *domain.RefreshToken) error {
	token.CreatedAt = time.Now()

	data := map[string]interface{}{
		"id":                token.ID,
		"user_id":           token.UserID,
		"token_hash":        token.TokenHash,
		"token_fingerprint":  token.TokenFingerprint,
		"hmac_key_id":       token.HMACKeyID,
		"expires_at":        token.ExpiresAt,
		"revoked":           token.Revoked,
		"created_at":        token.CreatedAt,
	}

	_, err := r.client.Collection("refresh_tokens").Doc(token.ID).Set(ctx, data)
	return err
}

func (r *refreshTokenRepository) FindByTokenFingerprint(ctx context.Context, fingerprint []byte) (*domain.RefreshToken, error) {
	// Convert byte slice to base64 string for storage/comparison
	// Note: Firestore doesn't support byte arrays directly, so we store as string
	fingerprintStr := string(fingerprint)
	
	iter := r.client.Collection("refresh_tokens").Where("token_fingerprint", "==", fingerprintStr).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, nil
	}
	return r.docToRefreshToken(docs[0])
}

func (r *refreshTokenRepository) FindByID(ctx context.Context, id string) (*domain.RefreshToken, error) {
	doc, err := r.client.Collection("refresh_tokens").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.docToRefreshToken(doc)
}

func (r *refreshTokenRepository) RevokeByUserID(ctx context.Context, userID string) error {
	iter := r.client.Collection("refresh_tokens").Where("user_id", "==", userID).Where("revoked", "==", false).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return err
	}

	batch := r.client.Batch()
	for _, doc := range docs {
		batch.Update(doc.Ref, []firestore.Update{
			{Path: "revoked", Value: true},
		})
	}
	_, err = batch.Commit(ctx)
	return err
}

func (r *refreshTokenRepository) RevokeByID(ctx context.Context, id string) error {
	_, err := r.client.Collection("refresh_tokens").Doc(id).Update(ctx, []firestore.Update{
		{Path: "revoked", Value: true},
	})
	return err
}

func (r *refreshTokenRepository) DeleteExpired(ctx context.Context) error {
	now := time.Now()
	iter := r.client.Collection("refresh_tokens").Where("expires_at", "<", now).Documents(ctx)
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

func (r *refreshTokenRepository) docToRefreshToken(doc *firestore.DocumentSnapshot) (*domain.RefreshToken, error) {
	data := doc.Data()
	token := &domain.RefreshToken{
		ID:               doc.Ref.ID,
		UserID:           getString(data, "user_id"),
		TokenHash:        getString(data, "token_hash"),
		HMACKeyID:        int16(getInt(data, "hmac_key_id")),
		ExpiresAt:        getTime(data, "expires_at"),
		Revoked:          getBool(data, "revoked"),
		CreatedAt:        getTime(data, "created_at"),
	}

	// Convert fingerprint string back to byte slice
	if fingerprintStr, ok := data["token_fingerprint"].(string); ok {
		token.TokenFingerprint = []byte(fingerprintStr)
	}

	return token, nil
}

