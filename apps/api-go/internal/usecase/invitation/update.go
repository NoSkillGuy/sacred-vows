package invitation

import (
	"context"
	"encoding/json"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type UpdateInvitationUseCase struct {
	invitationRepo repository.InvitationRepository
}

func NewUpdateInvitationUseCase(invitationRepo repository.InvitationRepository) *UpdateInvitationUseCase {
	return &UpdateInvitationUseCase{
		invitationRepo: invitationRepo,
	}
}

type UpdateInvitationInput struct {
	ID         string
	TemplateID *string
	Data       *json.RawMessage
	Title      *string
	Status     *string
}

type UpdateInvitationOutput struct {
	Invitation *InvitationDTO
}

func (uc *UpdateInvitationUseCase) Execute(ctx context.Context, input UpdateInvitationInput) (*UpdateInvitationOutput, error) {
	invitation, err := uc.invitationRepo.FindByID(ctx, input.ID)
	if err != nil || invitation == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Invitation not found", err)
	}

	if input.TemplateID != nil {
		invitation.TemplateID = *input.TemplateID
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

	return &UpdateInvitationOutput{
		Invitation: toInvitationDTO(invitation),
	}, nil
}
