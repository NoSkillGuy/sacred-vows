package invitation

import (
	"context"
	"encoding/json"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/segmentio/ksuid"
)

type CreateInvitationUseCase struct {
	invitationRepo repository.InvitationRepository
}

func NewCreateInvitationUseCase(invitationRepo repository.InvitationRepository) *CreateInvitationUseCase {
	return &CreateInvitationUseCase{
		invitationRepo: invitationRepo,
	}
}

type CreateInvitationInput struct {
	TemplateID string
	Data       json.RawMessage
	UserID     string
}

type CreateInvitationOutput struct {
	Invitation *InvitationDTO
}

func (uc *CreateInvitationUseCase) Execute(ctx context.Context, input CreateInvitationInput) (*CreateInvitationOutput, error) {
	if input.Data == nil {
		input.Data = json.RawMessage("{}")
	}

	templateID := input.TemplateID
	if templateID == "" {
		templateID = "royal-elegance"
	}

	invitation, err := domain.NewInvitation(templateID, input.UserID, input.Data)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid invitation data", err)
	}

	invitation.ID = ksuid.New().String()

	if err := uc.invitationRepo.Create(ctx, invitation); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to create invitation", err)
	}

	return &CreateInvitationOutput{
		Invitation: toInvitationDTO(invitation),
	}, nil
}
