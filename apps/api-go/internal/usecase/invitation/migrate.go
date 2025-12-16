package invitation

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
)

type MigrateInvitationsUseCase struct {
	invitationRepo repository.InvitationRepository
}

func NewMigrateInvitationsUseCase(invitationRepo repository.InvitationRepository) *MigrateInvitationsUseCase {
	return &MigrateInvitationsUseCase{
		invitationRepo: invitationRepo,
	}
}

type MigrateInvitationsInput struct {
	FromUserID string
	ToUserID   string
}

type MigrateInvitationsOutput struct {
	MigratedCount int
}

func (uc *MigrateInvitationsUseCase) Execute(ctx context.Context, input MigrateInvitationsInput) (*MigrateInvitationsOutput, error) {
	if input.FromUserID == "" {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "FromUserID is required", nil)
	}
	if input.ToUserID == "" {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "ToUserID is required", nil)
	}
	if input.FromUserID == input.ToUserID {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "FromUserID and ToUserID must be different", nil)
	}

	count, err := uc.invitationRepo.MigrateUserInvitations(ctx, input.FromUserID, input.ToUserID)
	if err != nil {
		logger.GetLogger().Error("Failed to migrate invitations",
			zap.String("fromUserID", input.FromUserID),
			zap.String("toUserID", input.ToUserID),
			zap.Error(err),
		)
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to migrate invitations", err)
	}

	logger.GetLogger().Info("Migrated invitations",
		zap.String("fromUserID", input.FromUserID),
		zap.String("toUserID", input.ToUserID),
		zap.Int("count", count),
	)

	return &MigrateInvitationsOutput{
		MigratedCount: count,
	}, nil
}
