package template

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetTemplateManifestUseCase struct {
	templateRepo repository.TemplateRepository
}

func NewGetTemplateManifestUseCase(templateRepo repository.TemplateRepository) *GetTemplateManifestUseCase {
	return &GetTemplateManifestUseCase{
		templateRepo: templateRepo,
	}
}

type GetTemplateManifestOutput struct {
	Manifest map[string]interface{}
}

func (uc *GetTemplateManifestUseCase) Execute(ctx context.Context, id string) (*GetTemplateManifestOutput, error) {
	template, err := uc.templateRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get template", err)
	}
	if template == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Template not found", nil)
	}

	manifest, err := ToManifestMap(template)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to parse manifest", err)
	}
	if manifest == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Template manifest not found", nil)
	}

	return &GetTemplateManifestOutput{
		Manifest: manifest,
	}, nil
}
