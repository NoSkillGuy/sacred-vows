package invitation

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetAllInvitationsUseCase struct {
	invitationRepo repository.InvitationRepository
}

func NewGetAllInvitationsUseCase(invitationRepo repository.InvitationRepository) *GetAllInvitationsUseCase {
	return &GetAllInvitationsUseCase{
		invitationRepo: invitationRepo,
	}
}

type GetAllInvitationsOutput struct {
	Invitations []*InvitationDTO
}

func (uc *GetAllInvitationsUseCase) Execute(ctx context.Context, userID string) (*GetAllInvitationsOutput, error) {
	invitations, err := uc.invitationRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get invitations", err)
	}

	dtos := make([]*InvitationDTO, len(invitations))
	for i, inv := range invitations {
		dtos[i] = toInvitationDTO(inv)
	}

	return &GetAllInvitationsOutput{
		Invitations: dtos,
	}, nil
}
