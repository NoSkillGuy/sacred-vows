package invitation

import (
	"context"
	"encoding/json"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/infrastructure/observability"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/segmentio/ksuid"
)

type CreateInvitationUseCase struct {
	invitationRepo repository.InvitationRepository
	assetRepo      repository.AssetRepository
}

func NewCreateInvitationUseCase(invitationRepo repository.InvitationRepository, assetRepo repository.AssetRepository) *CreateInvitationUseCase {
	return &CreateInvitationUseCase{
		invitationRepo: invitationRepo,
		assetRepo:      assetRepo,
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
	startTime := time.Now()

	if input.Data == nil {
		input.Data = json.RawMessage("{}")
	}

	// Default status to "draft" for new invitations
	defaultStatus := "draft"

	// Merge title and default status into data if provided
	dataWithMeta, err := mergeMetadataIntoData(input.Data, input.Title, &defaultStatus)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid invitation data", err)
	}

	layoutID := input.LayoutID
	if layoutID == "" {
		layoutID = "classic-scroll"
	}

	invitation, err := domain.NewInvitation(layoutID, input.UserID, dataWithMeta)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid invitation data", err)
	}

	invitation.ID = ksuid.New().String()

	if err := uc.invitationRepo.Create(ctx, invitation); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to create invitation", err)
	}

	// Track invitation creation with duration
	duration := time.Since(startTime).Seconds()
	observability.RecordInvitationCreatedWithDuration(duration)

	// Track layout selection
	if layoutID != "" {
		observability.RecordLayoutSelection(layoutID)
	}

	// Track asset usage
	if uc.assetRepo != nil {
		assetURLs := extractAssetURLs(invitation.Data)
		for _, url := range assetURLs {
			asset, err := uc.assetRepo.FindByURL(ctx, url)
			if err == nil && asset != nil {
				uc.assetRepo.TrackUsage(ctx, asset.ID, invitation.ID)
			}
		}
	}

	return &CreateInvitationOutput{
		Invitation: toInvitationDTO(invitation),
	}, nil
}
