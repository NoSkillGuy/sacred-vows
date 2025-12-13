package invitation

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetInvitationPreviewUseCase struct {
	invitationRepo repository.InvitationRepository
}

func NewGetInvitationPreviewUseCase(invitationRepo repository.InvitationRepository) *GetInvitationPreviewUseCase {
	return &GetInvitationPreviewUseCase{
		invitationRepo: invitationRepo,
	}
}

type GetInvitationPreviewOutput struct {
	Invitation *InvitationPreviewDTO
}

func (uc *GetInvitationPreviewUseCase) Execute(ctx context.Context, id string) (*GetInvitationPreviewOutput, error) {
	invitation, err := uc.invitationRepo.FindByID(ctx, id)
	if err != nil || invitation == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Invitation not found", err)
	}

	return &GetInvitationPreviewOutput{
		Invitation: &InvitationPreviewDTO{
			ID:       invitation.ID,
			LayoutID: invitation.LayoutID,
			Data:     invitation.Data,
		},
	}, nil
}
