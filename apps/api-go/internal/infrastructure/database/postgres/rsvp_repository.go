package postgres

import (
	"context"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"gorm.io/gorm"
)

type rsvpRepository struct {
	db *gorm.DB
}

func NewRSVPRepository(db *gorm.DB) repository.RSVPRepository {
	return &rsvpRepository{db: db}
}

func (r *rsvpRepository) Create(ctx context.Context, rsvp *domain.RSVPResponse) error {
	model := &RSVPResponseModel{
		ID:           rsvp.ID,
		InvitationID: rsvp.InvitationID,
		Name:         rsvp.Name,
		Date:         rsvp.Date,
		Email:        rsvp.Email,
		Phone:        rsvp.Phone,
		Message:      rsvp.Message,
		SubmittedAt:  time.Now(),
	}
	return r.db.WithContext(ctx).Create(model).Error
}

func (r *rsvpRepository) FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.RSVPResponse, error) {
	var models []RSVPResponseModel
	if err := r.db.WithContext(ctx).Where("invitation_id = ?", invitationID).Find(&models).Error; err != nil {
		return nil, err
	}

	rsvps := make([]*domain.RSVPResponse, len(models))
	for i, model := range models {
		rsvps[i] = toRSVPDomain(&model)
	}
	return rsvps, nil
}

func (r *rsvpRepository) FindByID(ctx context.Context, id string) (*domain.RSVPResponse, error) {
	var model RSVPResponseModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toRSVPDomain(&model), nil
}

func toRSVPDomain(model *RSVPResponseModel) *domain.RSVPResponse {
	return &domain.RSVPResponse{
		ID:           model.ID,
		InvitationID: model.InvitationID,
		Name:         model.Name,
		Date:         model.Date,
		Email:        model.Email,
		Phone:        model.Phone,
		Message:      model.Message,
		SubmittedAt:  model.SubmittedAt,
	}
}
