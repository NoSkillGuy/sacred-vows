package layout

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type GetAllLayoutsUseCase struct {
	layoutRepo repository.LayoutRepository
}

func NewGetAllLayoutsUseCase(layoutRepo repository.LayoutRepository) *GetAllLayoutsUseCase {
	return &GetAllLayoutsUseCase{
		layoutRepo: layoutRepo,
	}
}

type GetAllLayoutsInput struct {
	Category *string
	Featured *bool
}

type GetAllLayoutsOutput struct {
	Layouts    []*LayoutSummaryDTO
	Categories []string
}

func (uc *GetAllLayoutsUseCase) Execute(ctx context.Context, input GetAllLayoutsInput) (*GetAllLayoutsOutput, error) {
	catalog, err := uc.getLayoutCatalog()
	if err != nil {
		return nil, err
	}

	var filteredLayouts []*LayoutSummaryDTO
	categories := make(map[string]bool)
	categories["all"] = true

	for _, manifest := range catalog {
		// Filter out coming-soon layouts - only show ready layouts
		isReady := false
		if manifest.Status != nil && *manifest.Status == "ready" {
			isReady = true
		} else if manifest.IsAvailable != nil && *manifest.IsAvailable {
			isReady = true
		}
		if !isReady {
			continue
		}

		// Filter by category
		if input.Category != nil && *input.Category != "all" {
			if manifest.Category == nil || *manifest.Category != *input.Category {
				continue
			}
		}

		// Filter by featured
		if input.Featured != nil && *input.Featured {
			if manifest.IsFeatured == nil || !*manifest.IsFeatured {
				continue
			}
		}

		filteredLayouts = append(filteredLayouts, manifest)
		if manifest.Category != nil {
			categories[*manifest.Category] = true
		}
	}

	categoryList := make([]string, 0, len(categories))
	for cat := range categories {
		categoryList = append(categoryList, cat)
	}

	return &GetAllLayoutsOutput{
		Layouts:    filteredLayouts,
		Categories: categoryList,
	}, nil
}

func (uc *GetAllLayoutsUseCase) getLayoutCatalog() ([]*LayoutSummaryDTO, error) {
	layouts, err := uc.layoutRepo.FindAll(context.Background())
	if err != nil {
		return nil, err
	}

	var catalog []*LayoutSummaryDTO
	for _, layout := range layouts {
		dto, err := ToLayoutSummaryDTO(layout)
		if err != nil {
			// Skip layouts with invalid manifest
			continue
		}
		catalog = append(catalog, dto)
	}

	return catalog, nil
}
