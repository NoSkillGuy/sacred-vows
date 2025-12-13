package domain

import (
	"encoding/json"
	"time"
)

// Layout represents a layout entity
type Layout struct {
	ID           string
	Name         string
	Description  *string
	PreviewImage *string
	Tags         []string
	Version      string
	Config       *json.RawMessage
	Manifest     *json.RawMessage
	IsActive     bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// Validate validates layout entity
func (l *Layout) Validate() error {
	if l.Name == "" {
		return ErrInvalidLayoutName
	}
	return nil
}
