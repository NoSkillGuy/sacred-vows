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

type layoutRepository struct {
	client *Client
}

// NewLayoutRepository creates a new Firestore layout repository
func NewLayoutRepository(client *Client) repository.LayoutRepository {
	return &layoutRepository{client: client}
}

func (r *layoutRepository) Create(ctx context.Context, layout *domain.Layout) error {
	now := time.Now()
	layout.CreatedAt = now
	layout.UpdatedAt = now

	data := map[string]interface{}{
		"id":            layout.ID,
		"name":          layout.Name,
		"description":  layout.Description,
		"preview_image": layout.PreviewImage,
		"tags":          layout.Tags,
		"version":       layout.Version,
		"is_active":     layout.IsActive,
		"created_at":    layout.CreatedAt,
		"updated_at":    layout.UpdatedAt,
	}

	if layout.Config != nil {
		data["config"] = string(*layout.Config)
	}
	if layout.Manifest != nil {
		data["manifest"] = string(*layout.Manifest)
	}

	_, err := r.client.Collection("layouts").Doc(layout.ID).Set(ctx, data)
	return err
}

func (r *layoutRepository) FindByID(ctx context.Context, id string) (*domain.Layout, error) {
	doc, err := r.client.Collection("layouts").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.docToLayout(doc)
}

func (r *layoutRepository) FindAll(ctx context.Context) ([]*domain.Layout, error) {
	iter := r.client.Collection("layouts").Where("is_active", "==", true).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	layouts := make([]*domain.Layout, len(docs))
	for i, doc := range docs {
		layout, err := r.docToLayout(doc)
		if err != nil {
			return nil, err
		}
		layouts[i] = layout
	}
	return layouts, nil
}

func (r *layoutRepository) Update(ctx context.Context, layout *domain.Layout) error {
	layout.UpdatedAt = time.Now()

	updates := []firestore.Update{
		{Path: "name", Value: layout.Name},
		{Path: "description", Value: layout.Description},
		{Path: "preview_image", Value: layout.PreviewImage},
		{Path: "tags", Value: layout.Tags},
		{Path: "version", Value: layout.Version},
		{Path: "is_active", Value: layout.IsActive},
		{Path: "updated_at", Value: layout.UpdatedAt},
	}

	if layout.Config != nil {
		updates = append(updates, firestore.Update{Path: "config", Value: string(*layout.Config)})
	}
	if layout.Manifest != nil {
		updates = append(updates, firestore.Update{Path: "manifest", Value: string(*layout.Manifest)})
	}

	_, err := r.client.Collection("layouts").Doc(layout.ID).Update(ctx, updates)
	return err
}

func (r *layoutRepository) Delete(ctx context.Context, id string) error {
	_, err := r.client.Collection("layouts").Doc(id).Delete(ctx)
	return err
}

func (r *layoutRepository) docToLayout(doc *firestore.DocumentSnapshot) (*domain.Layout, error) {
	data := doc.Data()
	layout := &domain.Layout{
		ID:           doc.Ref.ID,
		Name:         getString(data, "name"),
		Description:  getStringPtr(data, "description"),
		PreviewImage: getStringPtr(data, "preview_image"),
		Version:      getString(data, "version"),
		IsActive:     getBool(data, "is_active"),
		CreatedAt:    getTime(data, "created_at"),
		UpdatedAt:    getTime(data, "updated_at"),
	}

	if tags, ok := data["tags"].([]interface{}); ok {
		layout.Tags = make([]string, len(tags))
		for i, tag := range tags {
			if tagStr, ok := tag.(string); ok {
				layout.Tags[i] = tagStr
			}
		}
	}

	if configStr, ok := data["config"].(string); ok && configStr != "" {
		configRaw := json.RawMessage(configStr)
		layout.Config = &configRaw
	}

	if manifestStr, ok := data["manifest"].(string); ok && manifestStr != "" {
		manifestRaw := json.RawMessage(manifestStr)
		layout.Manifest = &manifestRaw
	}

	return layout, nil
}

