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
	LayoutID string
	Data     json.RawMessage
	Title    *string
	UserID   string
}

type CreateInvitationOutput struct {
	Invitation *InvitationDTO
}

func (uc *CreateInvitationUseCase) Execute(ctx context.Context, input CreateInvitationInput) (*CreateInvitationOutput, error) {
	if input.Data == nil {
		input.Data = json.RawMessage("{}")
	}

	// Merge title into data if provided
	dataWithMeta, err := mergeMetadataIntoData(input.Data, input.Title, nil)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid invitation data", err)
	}

	layoutID := input.LayoutID
	if layoutID == "" {
		layoutID = "royal-elegance"
	}

	invitation, err := domain.NewInvitation(layoutID, input.UserID, dataWithMeta)
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
