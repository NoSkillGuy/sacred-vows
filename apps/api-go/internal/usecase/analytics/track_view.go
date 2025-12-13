package analytics

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/segmentio/ksuid"
)

type TrackViewUseCase struct {
	analyticsRepo repository.AnalyticsRepository
}

func NewTrackViewUseCase(analyticsRepo repository.AnalyticsRepository) *TrackViewUseCase {
	return &TrackViewUseCase{
		analyticsRepo: analyticsRepo,
	}
}

type TrackViewInput struct {
	InvitationID string
	Referrer     *string
	UserAgent    *string
	IPAddress    *string
}

func (uc *TrackViewUseCase) Execute(ctx context.Context, input TrackViewInput) error {
	analytics, err := domain.NewAnalytics(input.InvitationID, domain.AnalyticsTypeView, input.Referrer, input.UserAgent, input.IPAddress)
	if err != nil {
		return errors.Wrap(errors.ErrBadRequest.Code, "Invalid analytics data", err)
	}

	analytics.ID = ksuid.New().String()

	if err := uc.analyticsRepo.Create(ctx, analytics); err != nil {
		return errors.Wrap(errors.ErrInternalServerError.Code, "Failed to track view", err)
	}

	return nil
}
