package invitation

import (
	"encoding/json"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
)

// InvitationDTO represents an invitation data transfer object
type InvitationDTO struct {
	ID        string          `json:"id"`
	LayoutID  string          `json:"layoutId"`
	Data      json.RawMessage `json:"data"`
	Title     *string         `json:"title,omitempty"`
	Status    *string         `json:"status,omitempty"`
	UserID    string          `json:"userId"`
	CreatedAt time.Time       `json:"createdAt"`
	UpdatedAt time.Time       `json:"updatedAt"`
}

// InvitationPreviewDTO represents a preview invitation DTO
type InvitationPreviewDTO struct {
	ID       string          `json:"id"`
	LayoutID string          `json:"layoutId"`
	Data     json.RawMessage `json:"data"`
}

func toInvitationDTO(invitation *domain.Invitation) *InvitationDTO {
	dto := &InvitationDTO{
		ID:        invitation.ID,
		LayoutID:  invitation.LayoutID,
		Data:      invitation.Data,
		UserID:    invitation.UserID,
		CreatedAt: invitation.CreatedAt,
		UpdatedAt: invitation.UpdatedAt,
	}

	// Extract title and status from data if they exist
	title, status := extractMetadataFromData(invitation.Data)
	if title != nil {
		dto.Title = title
	}
	
	// Default status to "draft" if not present
	if status != nil {
		dto.Status = status
	} else {
		defaultStatus := "draft"
		dto.Status = &defaultStatus
	}

	return dto
}

// mergeMetadataIntoData merges title and status into the JSON data field
func mergeMetadataIntoData(data json.RawMessage, title *string, status *string) (json.RawMessage, error) {
	var dataMap map[string]interface{}
	if len(data) == 0 || string(data) == "{}" {
		dataMap = make(map[string]interface{})
	} else {
		if err := json.Unmarshal(data, &dataMap); err != nil {
			return nil, err
		}
	}

	// Store title and status in _meta field to keep them separate from user data
	if _, ok := dataMap["_meta"]; !ok {
		dataMap["_meta"] = make(map[string]interface{})
	}
	meta, ok := dataMap["_meta"].(map[string]interface{})
	if !ok {
		meta = make(map[string]interface{})
		dataMap["_meta"] = meta
	}

	if title != nil {
		meta["title"] = *title
	}
	if status != nil {
		meta["status"] = *status
	}

	mergedData, err := json.Marshal(dataMap)
	if err != nil {
		return nil, err
	}

	return json.RawMessage(mergedData), nil
}

// extractMetadataFromData extracts title and status from the JSON data field
func extractMetadataFromData(data json.RawMessage) (*string, *string) {
	if len(data) == 0 {
		return nil, nil
	}

	var dataMap map[string]interface{}
	if err := json.Unmarshal(data, &dataMap); err != nil {
		return nil, nil
	}

	var title *string
	var status *string

	if meta, ok := dataMap["_meta"].(map[string]interface{}); ok {
		if t, ok := meta["title"].(string); ok {
			title = &t
		}
		if s, ok := meta["status"].(string); ok {
			status = &s
		}
	}

	return title, status
}
