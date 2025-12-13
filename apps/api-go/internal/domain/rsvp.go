package domain

import (
	"time"
)

// RSVPResponse represents an RSVP response entity
type RSVPResponse struct {
	ID           string
	InvitationID string
	Name         string
	Date         string // Arrival date
	Email        *string
	Phone        *string
	Message      *string
	SubmittedAt  time.Time
}

// Validate validates RSVP response entity
func (r *RSVPResponse) Validate() error {
	if r.InvitationID == "" {
		return ErrInvalidInvitationID
	}
	if r.Name == "" {
		return ErrInvalidName
	}
	if r.Date == "" {
		return ErrInvalidDate
	}
	return nil
}

// NewRSVPResponse creates a new RSVP response entity
func NewRSVPResponse(invitationID, name, date string, email, phone, message *string) (*RSVPResponse, error) {
	rsvp := &RSVPResponse{
		InvitationID: invitationID,
		Name:         name,
		Date:         date,
		Email:        email,
		Phone:        phone,
		Message:      message,
	}

	if err := rsvp.Validate(); err != nil {
		return nil, err
	}

	return rsvp, nil
}
