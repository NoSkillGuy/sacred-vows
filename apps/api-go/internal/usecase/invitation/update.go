package invitation

import (
	"context"
	"encoding/json"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type UpdateInvitationUseCase struct {
	invitationRepo repository.InvitationRepository
	assetRepo      repository.AssetRepository
}

func NewUpdateInvitationUseCase(invitationRepo repository.InvitationRepository, assetRepo repository.AssetRepository) *UpdateInvitationUseCase {
	return &UpdateInvitationUseCase{
		invitationRepo: invitationRepo,
		assetRepo:      assetRepo,
	}
}

type UpdateInvitationInput struct {
	ID       string
	LayoutID *string
	Data     *json.RawMessage
	Title    *string
	Status   *string
}

type UpdateInvitationOutput struct {
	Invitation *InvitationDTO
}

func (uc *UpdateInvitationUseCase) Execute(ctx context.Context, input UpdateInvitationInput) (*UpdateInvitationOutput, error) {
	invitation, err := uc.invitationRepo.FindByID(ctx, input.ID)
	if err != nil || invitation == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Invitation not found", err)
	}

	if input.LayoutID != nil {
		invitation.LayoutID = *input.LayoutID
	}

	// Handle data update - merge with title/status if provided
	if input.Data != nil || input.Title != nil || input.Status != nil {
		dataToUpdate := invitation.Data
		if input.Data != nil {
			dataToUpdate = *input.Data
		}

		// Merge title and status into data
		mergedData, err := mergeMetadataIntoData(dataToUpdate, input.Title, input.Status)
		if err != nil {
			return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid invitation data", err)
		}
		invitation.Data = mergedData
	}

	if err := uc.invitationRepo.Update(ctx, invitation); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to update invitation", err)
	}

	// Update asset usage tracking
	if uc.assetRepo != nil {
		// Remove all existing usage tracking for this invitation
		uc.assetRepo.UntrackAllUsage(ctx, invitation.ID)

		// Track new asset usage
		assetURLs := extractAssetURLs(invitation.Data)
		for _, url := range assetURLs {
			asset, err := uc.assetRepo.FindByURL(ctx, url)
			if err == nil && asset != nil {
				uc.assetRepo.TrackUsage(ctx, asset.ID, invitation.ID)
			}
		}
	}

	return &UpdateInvitationOutput{
		Invitation: toInvitationDTO(invitation),
	}, nil
}
