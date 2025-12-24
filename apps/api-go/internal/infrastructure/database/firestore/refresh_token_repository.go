package firestore

import (
	"context"
	"encoding/base64"
	"fmt"
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

	// Convert fingerprint bytes to base64 string for Firestore storage
	fingerprintStr := base64.URLEncoding.EncodeToString(token.TokenFingerprint)

	data := map[string]interface{}{
		"id":                token.ID,
		"user_id":           token.UserID,
		"token_hash":        token.TokenHash,
		"token_fingerprint": fingerprintStr, // Store as base64 string
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
	// Note: Firestore doesn't support byte arrays directly, so we store as base64-encoded string
	// Using base64 ensures valid UTF-8 encoding
	fingerprintStr := base64.URLEncoding.EncodeToString(fingerprint)

	// Create a context with timeout for Firestore query (3 seconds)
	queryCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	iter := r.client.Collection("refresh_tokens").Where("token_fingerprint", "==", fingerprintStr).Limit(1).Documents(queryCtx)
	docs, err := iter.GetAll()
	if err != nil {
		// Check if error is due to timeout
		if err == context.DeadlineExceeded || err == context.Canceled {
			return nil, fmt.Errorf("Firestore query timeout (likely missing index on token_fingerprint): %w", err)
		}
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
		ID:        doc.Ref.ID,
		UserID:    getString(data, "user_id"),
		TokenHash: getString(data, "token_hash"),
		HMACKeyID: int16(getInt(data, "hmac_key_id")),
		ExpiresAt: getTime(data, "expires_at"),
		Revoked:   getBool(data, "revoked"),
		CreatedAt: getTime(data, "created_at"),
	}

	// Convert fingerprint base64 string back to byte slice
	if fingerprintStr, ok := data["token_fingerprint"].(string); ok {
		// Try to decode as base64 (new format), fallback to direct byte conversion (old format)
		if fingerprintBytes, err := base64.URLEncoding.DecodeString(fingerprintStr); err == nil {
			token.TokenFingerprint = fingerprintBytes
		} else {
			// Fallback for old format (direct string conversion)
			token.TokenFingerprint = []byte(fingerprintStr)
		}
	}

	return token, nil
}
