package domain

import (
	"encoding/json"
	"time"
)

// Invitation represents an invitation entity
type Invitation struct {
	ID        string
	LayoutID  string
	Data      json.RawMessage // Wedding configuration data
	UserID    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Validate validates invitation entity
func (i *Invitation) Validate() error {
	if i.LayoutID == "" {
		return ErrInvalidLayoutID
	}
	if i.UserID == "" {
		return ErrInvalidUserID
	}
	return nil
}

// NewInvitation creates a new invitation entity
func NewInvitation(layoutID, userID string, data json.RawMessage) (*Invitation, error) {
	invitation := &Invitation{
		LayoutID: layoutID,
		UserID:   userID,
		Data:     data,
	}

	if err := invitation.Validate(); err != nil {
		return nil, err
	}

	return invitation, nil
}
