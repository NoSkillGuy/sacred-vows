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

	if input.Data != nil {
		invitation.Data = *input.Data
	}

	if err := uc.invitationRepo.Update(ctx, invitation); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to update invitation", err)
	}

	return &UpdateInvitationOutput{
		Invitation: toInvitationDTO(invitation),
	}, nil
}
