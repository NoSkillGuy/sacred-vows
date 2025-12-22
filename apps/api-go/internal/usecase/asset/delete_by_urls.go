package asset

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type DeleteAssetsByURLsUseCase struct {
	assetRepo repository.AssetRepository
}

func NewDeleteAssetsByURLsUseCase(assetRepo repository.AssetRepository) *DeleteAssetsByURLsUseCase {
	return &DeleteAssetsByURLsUseCase{
		assetRepo: assetRepo,
	}
}

type DeleteAssetsByURLsInput struct {
	URLs []string
}

type DeleteAssetsByURLsOutput struct {
	Deleted []*AssetDTO // Assets that were successfully deleted
	Failed  []string     // URLs that failed to delete
}

func (uc *DeleteAssetsByURLsUseCase) Execute(ctx context.Context, input DeleteAssetsByURLsInput) (*DeleteAssetsByURLsOutput, error) {
	output := &DeleteAssetsByURLsOutput{
		Deleted: make([]*AssetDTO, 0),
		Failed:  make([]string, 0),
	}

	// Find all assets by URLs
	assets, err := uc.assetRepo.FindByURLs(ctx, input.URLs)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find assets", err)
	}

	// Check usage for each asset and delete only if not used by other invitations
	for _, asset := range assets {
		usedIn, err := uc.assetRepo.FindUsedInInvitations(ctx, asset.ID)
		if err != nil {
			output.Failed = append(output.Failed, asset.URL)
			continue
		}

		// Only delete if not used by any other invitation
		if len(usedIn) == 0 {
			if err := uc.assetRepo.DeleteByURL(ctx, asset.URL); err != nil {
				output.Failed = append(output.Failed, asset.URL)
			} else {
				output.Deleted = append(output.Deleted, toAssetDTO(asset))
			}
		} else {
			// Asset is still in use, skip deletion
			output.Failed = append(output.Failed, asset.URL)
		}
	}

	return output, nil
}

