package invitation

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/internal/usecase/asset"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type DeleteInvitationUseCase struct {
	invitationRepo    repository.InvitationRepository
	assetRepo         repository.AssetRepository
	deleteAssetsByURLsUC *asset.DeleteAssetsByURLsUseCase
}

func NewDeleteInvitationUseCase(
	invitationRepo repository.InvitationRepository,
	assetRepo repository.AssetRepository,
	deleteAssetsByURLsUC *asset.DeleteAssetsByURLsUseCase,
) *DeleteInvitationUseCase {
	return &DeleteInvitationUseCase{
		invitationRepo:       invitationRepo,
		assetRepo:            assetRepo,
		deleteAssetsByURLsUC: deleteAssetsByURLsUC,
	}
}

type DeleteInvitationOutput struct {
	DeletedAssets []*asset.AssetDTO // Assets that were deleted
}

func (uc *DeleteInvitationUseCase) Execute(ctx context.Context, id string) (*DeleteInvitationOutput, error) {
	invitation, err := uc.invitationRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find invitation", err)
	}
	if invitation == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Invitation not found", nil)
	}

	// Extract asset URLs before deleting invitation
	var assetURLs []string
	if uc.assetRepo != nil {
		assetURLs = extractAssetURLs(invitation.Data)
	}

	// Delete invitation first
	if err := uc.invitationRepo.Delete(ctx, id); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to delete invitation", err)
	}

	// Untrack asset usage
	if uc.assetRepo != nil {
		uc.assetRepo.UntrackAllUsage(ctx, id)
	}

	// Delete assets that are not used by other invitations
	var deletedAssets []*asset.AssetDTO
	if uc.deleteAssetsByURLsUC != nil && len(assetURLs) > 0 {
		deleteOutput, err := uc.deleteAssetsByURLsUC.Execute(ctx, asset.DeleteAssetsByURLsInput{
			URLs: assetURLs,
		})
		if err == nil {
			deletedAssets = deleteOutput.Deleted
		}
		// Note: Failed deletions are logged but don't fail the invitation deletion
	}

	return &DeleteInvitationOutput{
		DeletedAssets: deletedAssets,
	}, nil
}
