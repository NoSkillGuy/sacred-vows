package postgres

import (
	"context"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"gorm.io/gorm"
)

type assetRepository struct {
	db *gorm.DB
}

func NewAssetRepository(db *gorm.DB) repository.AssetRepository {
	return &assetRepository{db: db}
}

func (r *assetRepository) Create(ctx context.Context, asset *domain.Asset) error {
	model := &AssetModel{
		ID:           asset.ID,
		URL:          asset.URL,
		Filename:     asset.Filename,
		OriginalName: asset.OriginalName,
		Size:         asset.Size,
		MimeType:     asset.MimeType,
		UserID:       asset.UserID,
		CreatedAt:    time.Now(),
	}
	return r.db.WithContext(ctx).Create(model).Error
}

func (r *assetRepository) FindByID(ctx context.Context, id string) (*domain.Asset, error) {
	var model AssetModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toAssetDomain(&model), nil
}

func (r *assetRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Asset, error) {
	var models []AssetModel
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&models).Error; err != nil {
		return nil, err
	}

	assets := make([]*domain.Asset, len(models))
	for i, model := range models {
		assets[i] = toAssetDomain(&model)
	}
	return assets, nil
}

func (r *assetRepository) FindByURL(ctx context.Context, url string) (*domain.Asset, error) {
	var model AssetModel
	if err := r.db.WithContext(ctx).Where("url = ?", url).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toAssetDomain(&model), nil
}

func (r *assetRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&AssetModel{}, "id = ?", id).Error
}

func (r *assetRepository) DeleteByURL(ctx context.Context, url string) error {
	return r.db.WithContext(ctx).Delete(&AssetModel{}, "url = ?", url).Error
}

func toAssetDomain(model *AssetModel) *domain.Asset {
	return &domain.Asset{
		ID:           model.ID,
		URL:          model.URL,
		Filename:     model.Filename,
		OriginalName: model.OriginalName,
		Size:         model.Size,
		MimeType:     model.MimeType,
		UserID:       model.UserID,
		CreatedAt:    model.CreatedAt,
	}
}
