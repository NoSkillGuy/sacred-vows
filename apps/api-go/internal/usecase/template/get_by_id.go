package template

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetTemplateByIDUseCase struct {
	templateRepo repository.TemplateRepository
}

func NewGetTemplateByIDUseCase(templateRepo repository.TemplateRepository) *GetTemplateByIDUseCase {
	return &GetTemplateByIDUseCase{
		templateRepo: templateRepo,
	}
}

type GetTemplateByIDOutput struct {
	Template *TemplateSummaryDTO
}

func (uc *GetTemplateByIDUseCase) Execute(ctx context.Context, id string) (*GetTemplateByIDOutput, error) {
	template, err := uc.templateRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get template", err)
	}
	if template == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Template not found", nil)
	}

	dto, err := ToTemplateSummaryDTO(template)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to normalize template", err)
	}

	return &GetTemplateByIDOutput{
		Template: dto,
	}, nil
}
