package asset

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetAllAssetsUseCase struct {
	assetRepo repository.AssetRepository
}

func NewGetAllAssetsUseCase(assetRepo repository.AssetRepository) *GetAllAssetsUseCase {
	return &GetAllAssetsUseCase{
		assetRepo: assetRepo,
	}
}

type GetAllAssetsOutput struct {
	Assets []*AssetDTO
}

func (uc *GetAllAssetsUseCase) Execute(ctx context.Context, userID string) (*GetAllAssetsOutput, error) {
	assets, err := uc.assetRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get assets", err)
	}

	dtos := make([]*AssetDTO, len(assets))
	for i, asset := range assets {
		dtos[i] = toAssetDTO(asset)
	}

	return &GetAllAssetsOutput{
		Assets: dtos,
	}, nil
}
