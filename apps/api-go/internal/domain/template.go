package domain

import (
	"encoding/json"
	"time"
)

// Template represents a template entity
type Template struct {
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

// Validate validates template entity
func (t *Template) Validate() error {
	if t.Name == "" {
		return ErrInvalidTemplateName
	}
	return nil
}
