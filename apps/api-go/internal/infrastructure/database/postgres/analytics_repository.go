package postgres

import (
	"context"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"gorm.io/gorm"
)

type analyticsRepository struct {
	db *gorm.DB
}

func NewAnalyticsRepository(db *gorm.DB) repository.AnalyticsRepository {
	return &analyticsRepository{db: db}
}

func (r *analyticsRepository) Create(ctx context.Context, analytics *domain.Analytics) error {
	model := &AnalyticsModel{
		ID:           analytics.ID,
		InvitationID: analytics.InvitationID,
		Type:         string(analytics.Type),
		Referrer:     analytics.Referrer,
		UserAgent:    analytics.UserAgent,
		IPAddress:    analytics.IPAddress,
		Timestamp:    time.Now(),
	}
	return r.db.WithContext(ctx).Create(model).Error
}

func (r *analyticsRepository) FindByInvitationID(ctx context.Context, invitationID string) ([]*domain.Analytics, error) {
	var models []AnalyticsModel
	if err := r.db.WithContext(ctx).Where("invitation_id = ?", invitationID).Find(&models).Error; err != nil {
		return nil, err
	}

	analytics := make([]*domain.Analytics, len(models))
	for i, model := range models {
		analytics[i] = toAnalyticsDomain(&model)
	}
	return analytics, nil
}

func (r *analyticsRepository) CountByType(ctx context.Context, invitationID string, analyticsType domain.AnalyticsType) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&AnalyticsModel{}).
		Where("invitation_id = ? AND type = ?", invitationID, string(analyticsType)).
		Count(&count).Error
	return count, err
}

func toAnalyticsDomain(model *AnalyticsModel) *domain.Analytics {
	return &domain.Analytics{
		ID:           model.ID,
		InvitationID: model.InvitationID,
		Type:         domain.AnalyticsType(model.Type),
		Referrer:     model.Referrer,
		UserAgent:    model.UserAgent,
		IPAddress:    model.IPAddress,
		Timestamp:    model.Timestamp,
	}
}
