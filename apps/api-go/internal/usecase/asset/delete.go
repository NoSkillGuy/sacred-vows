package asset

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type DeleteAssetUseCase struct {
	assetRepo repository.AssetRepository
}

func NewDeleteAssetUseCase(assetRepo repository.AssetRepository) *DeleteAssetUseCase {
	return &DeleteAssetUseCase{
		assetRepo: assetRepo,
	}
}

func (uc *DeleteAssetUseCase) Execute(ctx context.Context, url string) (*domain.Asset, error) {
	asset, err := uc.assetRepo.FindByURL(ctx, url)
	if err != nil || asset == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Asset not found", err)
	}

	if err := uc.assetRepo.DeleteByURL(ctx, url); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to delete asset", err)
	}

	return asset, nil
}
