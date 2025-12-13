package rsvp

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/segmentio/ksuid"
)

type SubmitRSVPUseCase struct {
	rsvpRepo repository.RSVPRepository
}

func NewSubmitRSVPUseCase(rsvpRepo repository.RSVPRepository) *SubmitRSVPUseCase {
	return &SubmitRSVPUseCase{
		rsvpRepo: rsvpRepo,
	}
}

type SubmitRSVPInput struct {
	InvitationID string
	Name         string
	Date         string
	Email        *string
	Phone        *string
	Message      *string
}

type SubmitRSVPOutput struct {
	RSVP *RSVPDTO
}

func (uc *SubmitRSVPUseCase) Execute(ctx context.Context, input SubmitRSVPInput) (*SubmitRSVPOutput, error) {
	rsvp, err := domain.NewRSVPResponse(input.InvitationID, input.Name, input.Date, input.Email, input.Phone, input.Message)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid RSVP data", err)
	}

	rsvp.ID = ksuid.New().String()

	if err := uc.rsvpRepo.Create(ctx, rsvp); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to submit RSVP", err)
	}

	return &SubmitRSVPOutput{
		RSVP: toRSVPDTO(rsvp),
	}, nil
}
