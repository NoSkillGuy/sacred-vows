package template

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type GetAllTemplatesUseCase struct {
	templateRepo repository.TemplateRepository
}

func NewGetAllTemplatesUseCase(templateRepo repository.TemplateRepository) *GetAllTemplatesUseCase {
	return &GetAllTemplatesUseCase{
		templateRepo: templateRepo,
	}
}

type GetAllTemplatesInput struct {
	Category *string
	Featured *bool
}

type GetAllTemplatesOutput struct {
	Templates  []*TemplateSummaryDTO
	Categories []string
}

func (uc *GetAllTemplatesUseCase) Execute(ctx context.Context, input GetAllTemplatesInput) (*GetAllTemplatesOutput, error) {
	catalog, err := uc.getTemplateCatalog()
	if err != nil {
		return nil, err
	}

	var filteredTemplates []*TemplateSummaryDTO
	categories := make(map[string]bool)
	categories["all"] = true

	for _, manifest := range catalog {
		// Filter out coming-soon templates - only show ready templates
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

		filteredTemplates = append(filteredTemplates, manifest)
		if manifest.Category != nil {
			categories[*manifest.Category] = true
		}
	}

	categoryList := make([]string, 0, len(categories))
	for cat := range categories {
		categoryList = append(categoryList, cat)
	}

	return &GetAllTemplatesOutput{
		Templates:  filteredTemplates,
		Categories: categoryList,
	}, nil
}

func (uc *GetAllTemplatesUseCase) getTemplateCatalog() ([]*TemplateSummaryDTO, error) {
	templates, err := uc.templateRepo.FindAll(context.Background())
	if err != nil {
		return nil, err
	}

	var catalog []*TemplateSummaryDTO
	for _, template := range templates {
		dto, err := ToTemplateSummaryDTO(template)
		if err != nil {
			// Skip templates with invalid manifest
			continue
		}
		catalog = append(catalog, dto)
	}

	return catalog, nil
}
