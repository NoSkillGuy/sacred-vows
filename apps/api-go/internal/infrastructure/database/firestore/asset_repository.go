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

