package invitation

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type DeleteInvitationUseCase struct {
	invitationRepo repository.InvitationRepository
}

func NewDeleteInvitationUseCase(invitationRepo repository.InvitationRepository) *DeleteInvitationUseCase {
	return &DeleteInvitationUseCase{
		invitationRepo: invitationRepo,
	}
}

func (uc *DeleteInvitationUseCase) Execute(ctx context.Context, id string) error {
	invitation, err := uc.invitationRepo.FindByID(ctx, id)
	if err != nil {
		return errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find invitation", err)
	}
	if invitation == nil {
		return errors.Wrap(errors.ErrNotFound.Code, "Invitation not found", nil)
	}

	if err := uc.invitationRepo.Delete(ctx, id); err != nil {
		return errors.Wrap(errors.ErrInternalServerError.Code, "Failed to delete invitation", err)
	}

	return nil
}
