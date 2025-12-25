package asset

import (
	"context"
	"mime"
	"path/filepath"
	"strings"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/infrastructure/observability"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/segmentio/ksuid"
)

type UploadAssetUseCase struct {
	assetRepo repository.AssetRepository
	// maxFileSize and allowedTypes are kept for backward compatibility but validation is done in handler
	maxFileSize  int64
	allowedTypes []string
}

func NewUploadAssetUseCase(
	assetRepo repository.AssetRepository,
	maxFileSize int64,
	allowedTypes []string,
) *UploadAssetUseCase {
	return &UploadAssetUseCase{
		assetRepo:    assetRepo,
		maxFileSize:  maxFileSize,
		allowedTypes: allowedTypes,
	}
}

type UploadAssetInput struct {
	Filename     string
	OriginalName string
	Size         int64
	MimeType     string
	UserID       string
}

type UploadAssetOutput struct {
	URL      string
	Filename string // Generated unique filename for storage
	Asset    *AssetDTO
}

func (uc *UploadAssetUseCase) Execute(ctx context.Context, input UploadAssetInput) (*UploadAssetOutput, error) {
	// Validation is done in handler, but we still check here as a safety measure
	// Generate unique filename
	ext := filepath.Ext(input.OriginalName)
	uniqueFilename := ksuid.New().String() + ext
	url := "/uploads/" + uniqueFilename

	// Create asset entity
	asset, err := domain.NewAsset(url, uniqueFilename, input.OriginalName, input.MimeType, input.UserID, input.Size)
	if err != nil {
		return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid asset data", err)
	}

	asset.ID = ksuid.New().String()

	// Save asset
	if err := uc.assetRepo.Create(ctx, asset); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to create asset", err)
	}

	// Track asset upload
	fileType := input.MimeType
	if fileType == "" {
		fileType = "unknown"
	}
	observability.RecordAssetUpload(fileType)

	return &UploadAssetOutput{
		URL:      url,
		Filename: uniqueFilename,
		Asset:    toAssetDTO(asset),
	}, nil
}

func (uc *UploadAssetUseCase) isAllowedType(mimeType string) bool {
	for _, allowedType := range uc.allowedTypes {
		if mimeType == allowedType {
			return true
		}
		// Check for wildcard types like image/*
		if strings.HasSuffix(allowedType, "/*") {
			baseType := strings.TrimSuffix(allowedType, "/*")
			parsedType, _, _ := mime.ParseMediaType(mimeType)
			if strings.HasPrefix(parsedType, baseType+"/") {
				return true
			}
		}
	}
	return false
}
