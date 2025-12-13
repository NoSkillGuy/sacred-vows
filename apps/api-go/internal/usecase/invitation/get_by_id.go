package invitation

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetInvitationByIDUseCase struct {
	invitationRepo repository.InvitationRepository
}

func NewGetInvitationByIDUseCase(invitationRepo repository.InvitationRepository) *GetInvitationByIDUseCase {
	return &GetInvitationByIDUseCase{
		invitationRepo: invitationRepo,
	}
}

type GetInvitationByIDOutput struct {
	Invitation *InvitationDTO
}

func (uc *GetInvitationByIDUseCase) Execute(ctx context.Context, id string) (*GetInvitationByIDOutput, error) {
	invitation, err := uc.invitationRepo.FindByID(ctx, id)
	if err != nil || invitation == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Invitation not found", err)
	}

	return &GetInvitationByIDOutput{
		Invitation: toInvitationDTO(invitation),
	}, nil
}
