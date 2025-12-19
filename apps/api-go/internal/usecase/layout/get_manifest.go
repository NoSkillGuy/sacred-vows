package layout

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetLayoutManifestUseCase struct {
	layoutRepo repository.LayoutRepository
}

func NewGetLayoutManifestUseCase(layoutRepo repository.LayoutRepository) *GetLayoutManifestUseCase {
	return &GetLayoutManifestUseCase{
		layoutRepo: layoutRepo,
	}
}

type GetLayoutManifestOutput struct {
	Manifest map[string]interface{}
}

func (uc *GetLayoutManifestUseCase) Execute(ctx context.Context, id string) (*GetLayoutManifestOutput, error) {
	layout, err := uc.layoutRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get layout", err)
	}
	if layout == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Layout not found", nil)
	}

	manifest, err := ToManifestMap(layout)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to parse manifest", err)
	}
	if manifest == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Layout manifest not found", nil)
	}

	return &GetLayoutManifestOutput{
		Manifest: manifest,
	}, nil
}




