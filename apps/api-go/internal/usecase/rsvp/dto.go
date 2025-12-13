package rsvp

import (
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
)

// RSVPDTO represents an RSVP data transfer object
type RSVPDTO struct {
	ID           string    `json:"id"`
	InvitationID string    `json:"invitationId"`
	Name         string    `json:"name"`
	Date         string    `json:"date"`
	Email        *string   `json:"email,omitempty"`
	Phone        *string   `json:"phone,omitempty"`
	Message      *string   `json:"message,omitempty"`
	SubmittedAt  time.Time `json:"submittedAt"`
}

func toRSVPDTO(rsvp *domain.RSVPResponse) *RSVPDTO {
	return &RSVPDTO{
		ID:           rsvp.ID,
		InvitationID: rsvp.InvitationID,
		Name:         rsvp.Name,
		Date:         rsvp.Date,
		Email:        rsvp.Email,
		Phone:        rsvp.Phone,
		Message:      rsvp.Message,
		SubmittedAt:  rsvp.SubmittedAt,
	}
}
