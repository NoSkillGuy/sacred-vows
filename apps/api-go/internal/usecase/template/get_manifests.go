package template

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type GetManifestsUseCase struct {
	templateRepo repository.TemplateRepository
}

func NewGetManifestsUseCase(templateRepo repository.TemplateRepository) *GetManifestsUseCase {
	return &GetManifestsUseCase{
		templateRepo: templateRepo,
	}
}

type GetManifestsOutput struct {
	Manifests []map[string]interface{}
}

func (uc *GetManifestsUseCase) Execute(ctx context.Context) (*GetManifestsOutput, error) {
	templates, err := uc.templateRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var manifests []map[string]interface{}
	for _, template := range templates {
		// Convert to DTO to check status
		dto, err := ToTemplateSummaryDTO(template)
		if err != nil {
			// Skip templates with invalid manifest
			continue
		}

		// Filter out coming-soon templates - only show ready templates
		isReady := false
		if dto.Status != nil && *dto.Status == "ready" {
			isReady = true
		} else if dto.IsAvailable != nil && *dto.IsAvailable {
			isReady = true
		}

		if !isReady {
			continue
		}

		// Convert to map using ToManifestMap
		manifestMap, err := ToManifestMap(template)
		if err != nil || manifestMap == nil {
			continue
		}

		manifests = append(manifests, manifestMap)
	}

	return &GetManifestsOutput{
		Manifests: manifests,
	}, nil
}
