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

type assetRepository struct {
	client *Client
}

// NewAssetRepository creates a new Firestore asset repository
func NewAssetRepository(client *Client) repository.AssetRepository {
	return &assetRepository{client: client}
}

func (r *assetRepository) Create(ctx context.Context, asset *domain.Asset) error {
	asset.CreatedAt = time.Now()

	_, err := r.client.Collection("assets").Doc(asset.ID).Set(ctx, map[string]interface{}{
		"id":            asset.ID,
		"url":           asset.URL,
		"filename":      asset.Filename,
		"original_name": asset.OriginalName,
		"size":          asset.Size,
		"mime_type":     asset.MimeType,
		"user_id":       asset.UserID,
		"created_at":    asset.CreatedAt,
	})
	return err
}

func (r *assetRepository) FindByID(ctx context.Context, id string) (*domain.Asset, error) {
	doc, err := r.client.Collection("assets").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.docToAsset(doc)
}

func (r *assetRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Asset, error) {
	iter := r.client.Collection("assets").Where("user_id", "==", userID).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	assets := make([]*domain.Asset, len(docs))
	for i, doc := range docs {
		assets[i] = r.docToAssetFromData(doc.Data(), doc.Ref.ID)
	}
	return assets, nil
}

func (r *assetRepository) FindByURL(ctx context.Context, url string) (*domain.Asset, error) {
	iter := r.client.Collection("assets").Where("url", "==", url).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, nil
	}
	return r.docToAsset(docs[0])
}

func (r *assetRepository) Delete(ctx context.Context, id string) error {
	_, err := r.client.Collection("assets").Doc(id).Delete(ctx)
	return err
}

func (r *assetRepository) DeleteByURL(ctx context.Context, url string) error {
	iter := r.client.Collection("assets").Where("url", "==", url).Documents(ctx)
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

func (r *assetRepository) docToAsset(doc *firestore.DocumentSnapshot) (*domain.Asset, error) {
	return r.docToAssetFromData(doc.Data(), doc.Ref.ID), nil
}

func (r *assetRepository) FindByURLs(ctx context.Context, urls []string) ([]*domain.Asset, error) {
	if len(urls) == 0 {
		return []*domain.Asset{}, nil
	}

	// Firestore 'in' query supports up to 10 items
	// For more, we need to batch queries
	var allAssets []*domain.Asset
	batchSize := 10

	for i := 0; i < len(urls); i += batchSize {
		end := i + batchSize
		if end > len(urls) {
			end = len(urls)
		}
		batch := urls[i:end]

		iter := r.client.Collection("assets").Where("url", "in", batch).Documents(ctx)
		docs, err := iter.GetAll()
		if err != nil {
			return nil, err
		}

		for _, doc := range docs {
			asset, err := r.docToAsset(doc)
			if err == nil && asset != nil {
				allAssets = append(allAssets, asset)
			}
		}
	}

	return allAssets, nil
}

func (r *assetRepository) FindUsedInInvitations(ctx context.Context, assetID string) ([]string, error) {
	// Find asset by ID first to get URL
	asset, err := r.FindByID(ctx, assetID)
	if err != nil || asset == nil {
		return []string{}, err
	}

	// Query asset_usage collection for this asset
	iter := r.client.Collection("asset_usage").Where("asset_id", "==", assetID).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	invitationIDs := make([]string, 0, len(docs))
	for _, doc := range docs {
		data := doc.Data()
		if invitationID, ok := data["invitation_id"].(string); ok {
			invitationIDs = append(invitationIDs, invitationID)
		}
	}

	return invitationIDs, nil
}

func (r *assetRepository) TrackUsage(ctx context.Context, assetID, invitationID string) error {
	// Create or update usage record
	// Use composite key: assetID_invitationID
	docID := assetID + "_" + invitationID
	_, err := r.client.Collection("asset_usage").Doc(docID).Set(ctx, map[string]interface{}{
		"asset_id":      assetID,
		"invitation_id": invitationID,
		"created_at":    time.Now(),
	})
	return err
}

func (r *assetRepository) UntrackUsage(ctx context.Context, assetID, invitationID string) error {
	docID := assetID + "_" + invitationID
	_, err := r.client.Collection("asset_usage").Doc(docID).Delete(ctx)
	return err
}

func (r *assetRepository) UntrackAllUsage(ctx context.Context, invitationID string) error {
	// Find all usage records for this invitation
	iter := r.client.Collection("asset_usage").Where("invitation_id", "==", invitationID).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return err
	}

	// Delete all usage records
	batch := r.client.Batch()
	for _, doc := range docs {
		batch.Delete(doc.Ref)
	}
	_, err = batch.Commit(ctx)
	return err
}

func (r *assetRepository) docToAssetFromData(data map[string]interface{}, id string) *domain.Asset {
	asset := &domain.Asset{
		ID:        id,
		URL:       getString(data, "url"),
		Filename:  getString(data, "filename"),
		Size:      getInt64(data, "size"),
		MimeType:  getString(data, "mime_type"),
		UserID:    getString(data, "user_id"),
		CreatedAt: getTime(data, "created_at"),
	}

	if originalName, ok := data["original_name"].(string); ok {
		asset.OriginalName = originalName
	}

	return asset
}

