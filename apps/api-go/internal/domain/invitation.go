package domain

import (
	"encoding/json"
	"time"
)

// Invitation represents an invitation entity
type Invitation struct {
	ID         string
	TemplateID string
	Data       json.RawMessage // Wedding configuration data
	UserID     string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// Validate validates invitation entity
func (i *Invitation) Validate() error {
	if i.TemplateID == "" {
		return ErrInvalidTemplateID
	}
	if i.UserID == "" {
		return ErrInvalidUserID
	}
	return nil
}

// NewInvitation creates a new invitation entity
func NewInvitation(templateID, userID string, data json.RawMessage) (*Invitation, error) {
	invitation := &Invitation{
		TemplateID: templateID,
		UserID:     userID,
		Data:       data,
	}

	if err := invitation.Validate(); err != nil {
		return nil, err
	}

	return invitation, nil
}
