package rsvp

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetRSVPByInvitationUseCase struct {
	rsvpRepo repository.RSVPRepository
}

func NewGetRSVPByInvitationUseCase(rsvpRepo repository.RSVPRepository) *GetRSVPByInvitationUseCase {
	return &GetRSVPByInvitationUseCase{
		rsvpRepo: rsvpRepo,
	}
}

type GetRSVPByInvitationOutput struct {
	Responses []*RSVPDTO
	Count     int
}

func (uc *GetRSVPByInvitationUseCase) Execute(ctx context.Context, invitationID string) (*GetRSVPByInvitationOutput, error) {
	responses, err := uc.rsvpRepo.FindByInvitationID(ctx, invitationID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get RSVP responses", err)
	}

	dtos := make([]*RSVPDTO, len(responses))
	for i, rsvp := range responses {
		dtos[i] = toRSVPDTO(rsvp)
	}

	return &GetRSVPByInvitationOutput{
		Responses: dtos,
		Count:     len(dtos),
	}, nil
}
