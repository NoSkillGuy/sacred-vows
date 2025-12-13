package postgres

import (
	"context"
	"encoding/json"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type invitationRepository struct {
	db *gorm.DB
}

func NewInvitationRepository(db *gorm.DB) repository.InvitationRepository {
	return &invitationRepository{db: db}
}

func (r *invitationRepository) Create(ctx context.Context, invitation *domain.Invitation) error {
	model := &InvitationModel{
		ID:        invitation.ID,
		LayoutID:  invitation.LayoutID,
		Data:      datatypes.JSON(invitation.Data),
		UserID:    invitation.UserID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	return r.db.WithContext(ctx).Create(model).Error
}

func (r *invitationRepository) FindByID(ctx context.Context, id string) (*domain.Invitation, error) {
	var model InvitationModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toInvitationDomain(&model)
}

func (r *invitationRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Invitation, error) {
	var models []InvitationModel
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&models).Error; err != nil {
		return nil, err
	}

	invitations := make([]*domain.Invitation, len(models))
	for i, model := range models {
		inv, err := toInvitationDomain(&model)
		if err != nil {
			return nil, err
		}
		invitations[i] = inv
	}
	return invitations, nil
}

func (r *invitationRepository) Update(ctx context.Context, invitation *domain.Invitation) error {
	model := &InvitationModel{
		ID:        invitation.ID,
		LayoutID:  invitation.LayoutID,
		Data:      datatypes.JSON(invitation.Data),
		UserID:    invitation.UserID,
		UpdatedAt: time.Now(),
	}
	return r.db.WithContext(ctx).Model(&InvitationModel{}).Where("id = ?", invitation.ID).Updates(model).Error
}

func (r *invitationRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&InvitationModel{}, "id = ?", id).Error
}

func toInvitationDomain(model *InvitationModel) (*domain.Invitation, error) {
	data, err := json.Marshal(model.Data)
	if err != nil {
		return nil, err
	}
	return &domain.Invitation{
		ID:        model.ID,
		LayoutID:  model.LayoutID,
		Data:      json.RawMessage(data),
		UserID:    model.UserID,
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
	}, nil
}
