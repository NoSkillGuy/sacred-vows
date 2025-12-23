package layout

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type GetManifestsUseCase struct {
	layoutRepo repository.LayoutRepository
}

func NewGetManifestsUseCase(layoutRepo repository.LayoutRepository) *GetManifestsUseCase {
	return &GetManifestsUseCase{
		layoutRepo: layoutRepo,
	}
}

type GetManifestsOutput struct {
	Manifests []map[string]interface{}
}

func (uc *GetManifestsUseCase) Execute(ctx context.Context) (*GetManifestsOutput, error) {
	layouts, err := uc.layoutRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var manifests []map[string]interface{}
	for _, layout := range layouts {
		// Convert to DTO to check status
		dto, err := ToLayoutSummaryDTO(layout)
		if err != nil {
			// Skip layouts with invalid manifest
			continue
		}

		// Filter out coming-soon layouts - only show ready layouts
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
		manifestMap, err := ToManifestMap(layout)
		if err != nil || manifestMap == nil {
			continue
		}

		manifests = append(manifests, manifestMap)
	}

	return &GetManifestsOutput{
		Manifests: manifests,
	}, nil
}





