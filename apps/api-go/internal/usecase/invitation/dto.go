package invitation

import (
	"encoding/json"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
)

// InvitationDTO represents an invitation data transfer object
type InvitationDTO struct {
	ID         string          `json:"id"`
	TemplateID string          `json:"templateId"`
	Data       json.RawMessage `json:"data"`
	UserID     string          `json:"userId"`
	CreatedAt  time.Time       `json:"createdAt"`
	UpdatedAt  time.Time       `json:"updatedAt"`
}

// InvitationPreviewDTO represents a preview invitation DTO
type InvitationPreviewDTO struct {
	ID         string          `json:"id"`
	TemplateID string          `json:"templateId"`
	Data       json.RawMessage `json:"data"`
}

func toInvitationDTO(invitation *domain.Invitation) *InvitationDTO {
	return &InvitationDTO{
		ID:         invitation.ID,
		TemplateID: invitation.TemplateID,
		Data:       invitation.Data,
		UserID:     invitation.UserID,
		CreatedAt:  invitation.CreatedAt,
		UpdatedAt:  invitation.UpdatedAt,
	}
}
