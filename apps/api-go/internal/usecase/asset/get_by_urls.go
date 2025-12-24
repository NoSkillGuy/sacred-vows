package asset

import (
	"context"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetAssetsByURLsUseCase struct {
	assetRepo repository.AssetRepository
}

func NewGetAssetsByURLsUseCase(assetRepo repository.AssetRepository) *GetAssetsByURLsUseCase {
	return &GetAssetsByURLsUseCase{
		assetRepo: assetRepo,
	}
}

type GetAssetsByURLsInput struct {
	URLs []string
}

type GetAssetsByURLsOutput struct {
	Count  int
	Assets []*AssetDTO
}

func (uc *GetAssetsByURLsUseCase) Execute(ctx context.Context, input GetAssetsByURLsInput) (*GetAssetsByURLsOutput, error) {
	assets, err := uc.assetRepo.FindByURLs(ctx, input.URLs)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find assets", err)
	}

	dtos := make([]*AssetDTO, len(assets))
	for i, asset := range assets {
		dtos[i] = toAssetDTO(asset)
	}

	return &GetAssetsByURLsOutput{
		Count:  len(assets),
		Assets: dtos,
	}, nil
}
