package asset

import (
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
)

// AssetDTO represents an asset data transfer object
type AssetDTO struct {
	ID           string    `json:"id"`
	URL          string    `json:"url"`
	Filename     string    `json:"filename"`
	OriginalName string    `json:"originalName"`
	Size         int64     `json:"size"`
	MimeType     string    `json:"mimetype"`
	UserID       string    `json:"userId"`
	CreatedAt    time.Time `json:"createdAt"`
}

func toAssetDTO(asset *domain.Asset) *AssetDTO {
	return &AssetDTO{
		ID:           asset.ID,
		URL:          asset.URL,
		Filename:     asset.Filename,
		OriginalName: asset.OriginalName,
		Size:         asset.Size,
		MimeType:     asset.MimeType,
		UserID:       asset.UserID,
		CreatedAt:    asset.CreatedAt,
	}
}
