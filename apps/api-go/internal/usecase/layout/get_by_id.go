package layout

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetLayoutByIDUseCase struct {
	layoutRepo repository.LayoutRepository
}

func NewGetLayoutByIDUseCase(layoutRepo repository.LayoutRepository) *GetLayoutByIDUseCase {
	return &GetLayoutByIDUseCase{
		layoutRepo: layoutRepo,
	}
}

type GetLayoutByIDOutput struct {
	Layout *LayoutSummaryDTO
}

func (uc *GetLayoutByIDUseCase) Execute(ctx context.Context, id string) (*GetLayoutByIDOutput, error) {
	layout, err := uc.layoutRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get layout", err)
	}
	if layout == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Layout not found", nil)
	}

	dto, err := ToLayoutSummaryDTO(layout)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to normalize layout", err)
	}

	return &GetLayoutByIDOutput{
		Layout: dto,
	}, nil
}





