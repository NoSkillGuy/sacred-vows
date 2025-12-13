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

type templateRepository struct {
	db *gorm.DB
}

func NewTemplateRepository(db *gorm.DB) repository.TemplateRepository {
	return &templateRepository{db: db}
}

func (r *templateRepository) Create(ctx context.Context, template *domain.Template) error {
	model, err := toTemplateModel(template)
	if err != nil {
		return err
	}
	model.CreatedAt = time.Now()
	model.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Create(model).Error
}

func (r *templateRepository) FindByID(ctx context.Context, id string) (*domain.Template, error) {
	var model TemplateModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toTemplateDomain(&model)
}

func (r *templateRepository) FindAll(ctx context.Context) ([]*domain.Template, error) {
	var models []TemplateModel
	// Database column is "isActive" (camelCase with quotes) - use quoted name in query
	if err := r.db.WithContext(ctx).Where("\"isActive\" = ?", true).Find(&models).Error; err != nil {
		return nil, err
	}

	templates := make([]*domain.Template, len(models))
	for i, model := range models {
		template, err := toTemplateDomain(&model)
		if err != nil {
			return nil, err
		}
		templates[i] = template
	}
	return templates, nil
}

func (r *templateRepository) Update(ctx context.Context, template *domain.Template) error {
	model, err := toTemplateModel(template)
	if err != nil {
		return err
	}
	model.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Model(&TemplateModel{}).Where("id = ?", template.ID).Updates(model).Error
}

func (r *templateRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&TemplateModel{}, "id = ?", id).Error
}

func toTemplateModel(template *domain.Template) (*TemplateModel, error) {
	model := &TemplateModel{
		ID:           template.ID,
		Name:         template.Name,
		Description:  template.Description,
		PreviewImage: template.PreviewImage,
		Version:      template.Version,
		IsActive:     template.IsActive,
	}

	// Convert Tags []string to JSON
	if len(template.Tags) > 0 {
		tagsJSON, err := json.Marshal(template.Tags)
		if err != nil {
			return nil, err
		}
		model.Tags = datatypes.JSON(tagsJSON)
	}

	// Convert Config *json.RawMessage to *datatypes.JSON
	if template.Config != nil {
		configJSON := datatypes.JSON(*template.Config)
		model.Config = &configJSON
	}

	// Convert Manifest *json.RawMessage to *datatypes.JSON
	if template.Manifest != nil {
		manifestJSON := datatypes.JSON(*template.Manifest)
		model.Manifest = &manifestJSON
	}

	return model, nil
}

func toTemplateDomain(model *TemplateModel) (*domain.Template, error) {
	template := &domain.Template{
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
		template.Tags = tags
	}

	// Convert Config *datatypes.JSON to *json.RawMessage
	if model.Config != nil {
		configBytes, err := json.Marshal(model.Config)
		if err != nil {
			return nil, err
		}
		configRaw := json.RawMessage(configBytes)
		template.Config = &configRaw
	}

	// Convert Manifest *datatypes.JSON to *json.RawMessage
	if model.Manifest != nil {
		manifestBytes, err := json.Marshal(model.Manifest)
		if err != nil {
			return nil, err
		}
		manifestRaw := json.RawMessage(manifestBytes)
		template.Manifest = &manifestRaw
	}

	return template, nil
}
