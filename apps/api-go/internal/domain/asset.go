package domain

import (
	"time"
)

// Asset represents an asset entity
type Asset struct {
	ID           string
	URL          string
	Filename     string
	OriginalName string
	Size         int64
	MimeType     string
	UserID       string
	CreatedAt    time.Time
}

// Validate validates asset entity
func (a *Asset) Validate() error {
	if a.URL == "" {
		return ErrInvalidAssetURL
	}
	if a.Filename == "" {
		return ErrInvalidFilename
	}
	if a.UserID == "" {
		return ErrInvalidUserID
	}
	return nil
}

// NewAsset creates a new asset entity
func NewAsset(url, filename, originalName, mimeType, userID string, size int64) (*Asset, error) {
	asset := &Asset{
		URL:          url,
		Filename:     filename,
		OriginalName: originalName,
		Size:         size,
		MimeType:     mimeType,
		UserID:       userID,
	}

	if err := asset.Validate(); err != nil {
		return nil, err
	}

	return asset, nil
}
