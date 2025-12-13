package postgres

import (
	"context"
	"encoding/json"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type layoutRepository struct {
	db *gorm.DB
}

func NewLayoutRepository(db *gorm.DB) repository.LayoutRepository {
	return &layoutRepository{db: db}
}

func (r *layoutRepository) Create(ctx context.Context, layout *domain.Layout) error {
	model, err := toLayoutModel(layout)
	if err != nil {
		return err
	}
	model.CreatedAt = time.Now()
	model.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Create(model).Error
}

func (r *layoutRepository) FindByID(ctx context.Context, id string) (*domain.Layout, error) {
	var model TemplateModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toLayoutDomain(&model)
}

func (r *layoutRepository) FindAll(ctx context.Context) ([]*domain.Layout, error) {
	var models []TemplateModel
	// Database column is "isActive" (camelCase with quotes) - use quoted name in query
	if err := r.db.WithContext(ctx).Where("\"isActive\" = ?", true).Find(&models).Error; err != nil {
		return nil, err
	}

	layouts := make([]*domain.Layout, len(models))
	for i, model := range models {
		layout, err := toLayoutDomain(&model)
		if err != nil {
			return nil, err
		}
		layouts[i] = layout
	}
	return layouts, nil
}

func (r *layoutRepository) Update(ctx context.Context, layout *domain.Layout) error {
	model, err := toLayoutModel(layout)
	if err != nil {
		return err
	}
	model.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Model(&TemplateModel{}).Where("id = ?", layout.ID).Updates(model).Error
}

func (r *layoutRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&TemplateModel{}, "id = ?", id).Error
}

func toLayoutModel(layout *domain.Layout) (*TemplateModel, error) {
	model := &TemplateModel{
		ID:           layout.ID,
		Name:         layout.Name,
		Description:  layout.Description,
		PreviewImage: layout.PreviewImage,
		Version:      layout.Version,
		IsActive:     layout.IsActive,
	}

	// Convert Tags []string to JSON
	if len(layout.Tags) > 0 {
		tagsJSON, err := json.Marshal(layout.Tags)
		if err != nil {
			return nil, err
		}
		model.Tags = datatypes.JSON(tagsJSON)
	}

	// Convert Config *json.RawMessage to *datatypes.JSON
	if layout.Config != nil {
		configJSON := datatypes.JSON(*layout.Config)
		model.Config = &configJSON
	}

	// Convert Manifest *json.RawMessage to *datatypes.JSON
	if layout.Manifest != nil {
		manifestJSON := datatypes.JSON(*layout.Manifest)
		model.Manifest = &manifestJSON
	}

	return model, nil
}

func toLayoutDomain(model *TemplateModel) (*domain.Layout, error) {
	layout := &domain.Layout{
		ID:           model.ID,
		Name:         model.Name,
		Description:  model.Description,
		PreviewImage: model.PreviewImage,
		Version:      model.Version,
		IsActive:     model.IsActive,
		CreatedAt:    model.CreatedAt,
		UpdatedAt:    model.UpdatedAt,
	}

	// Convert Tags JSON to []string
	if len(model.Tags) > 0 {
		var tags []string
		if err := json.Unmarshal(model.Tags, &tags); err != nil {
			return nil, err
		}
		layout.Tags = tags
	}

	// Convert Config *datatypes.JSON to *json.RawMessage
	if model.Config != nil {
		configBytes, err := json.Marshal(model.Config)
		if err != nil {
			return nil, err
		}
		configRaw := json.RawMessage(configBytes)
		layout.Config = &configRaw
	}

	// Convert Manifest *datatypes.JSON to *json.RawMessage
	if model.Manifest != nil {
		manifestBytes, err := json.Marshal(model.Manifest)
		if err != nil {
			return nil, err
		}
		manifestRaw := json.RawMessage(manifestBytes)
		layout.Manifest = &manifestRaw
	}

	return layout, nil
}


