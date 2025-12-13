package analytics

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetAnalyticsByInvitationUseCase struct {
	analyticsRepo repository.AnalyticsRepository
}

func NewGetAnalyticsByInvitationUseCase(analyticsRepo repository.AnalyticsRepository) *GetAnalyticsByInvitationUseCase {
	return &GetAnalyticsByInvitationUseCase{
		analyticsRepo: analyticsRepo,
	}
}

type GetAnalyticsByInvitationOutput struct {
	InvitationID string
	Views        int
	RSVPs        int
	Analytics    []*AnalyticsDTO
}

func (uc *GetAnalyticsByInvitationUseCase) Execute(ctx context.Context, invitationID string) (*GetAnalyticsByInvitationOutput, error) {
	analytics, err := uc.analyticsRepo.FindByInvitationID(ctx, invitationID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get analytics", err)
	}

	views, err := uc.analyticsRepo.CountByType(ctx, invitationID, domain.AnalyticsTypeView)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to count views", err)
	}

	rsvps, err := uc.analyticsRepo.CountByType(ctx, invitationID, domain.AnalyticsTypeRSVP)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to count RSVPs", err)
	}

	dtos := make([]*AnalyticsDTO, len(analytics))
	for i, a := range analytics {
		dtos[i] = toAnalyticsDTO(a)
	}

	return &GetAnalyticsByInvitationOutput{
		InvitationID: invitationID,
		Views:        int(views),
		RSVPs:        int(rsvps),
		Analytics:    dtos,
	}, nil
}
