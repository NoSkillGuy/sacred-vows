package invitation

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
)

func TestCreateInvitationUseCase_Execute_DefaultStatusToDraft(t *testing.T) {
	// Arrange
	var savedInvitation *domain.Invitation
	mockRepo := &MockInvitationRepository{
		CreateFn: func(ctx context.Context, invitation *domain.Invitation) error {
			savedInvitation = invitation
			return nil
		},
	}

	useCase := NewCreateInvitationUseCase(mockRepo, nil)
	input := CreateInvitationInput{
		LayoutID: "classic-scroll",
		Data:     json.RawMessage(`{}`),
		UserID:   "user-123",
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if output == nil || output.Invitation == nil {
		t.Fatal("Expected invitation in output")
	}

	// Verify status is set to "draft" in the returned DTO
	if output.Invitation.Status == nil {
		t.Fatal("Expected status to be set in DTO")
	}

	if *output.Invitation.Status != "draft" {
		t.Errorf("Expected status to be 'draft', got '%s'", *output.Invitation.Status)
	}

	// Verify status is stored in _meta.status in the data
	if savedInvitation == nil {
		t.Fatal("Expected invitation to be saved")
	}

	var dataMap map[string]interface{}
	if err := json.Unmarshal(savedInvitation.Data, &dataMap); err != nil {
		t.Fatalf("Failed to unmarshal saved data: %v", err)
	}

	meta, ok := dataMap["_meta"].(map[string]interface{})
	if !ok {
		t.Fatal("Expected _meta field to exist in saved data")
	}

	status, ok := meta["status"].(string)
	if !ok {
		t.Fatal("Expected status field to exist in _meta")
	}

	if status != "draft" {
		t.Errorf("Expected status in _meta to be 'draft', got '%s'", status)
	}
}

func TestCreateInvitationUseCase_Execute_WithTitle(t *testing.T) {
	// Arrange
	mockRepo := &MockInvitationRepository{
		CreateFn: func(ctx context.Context, invitation *domain.Invitation) error {
			return nil
		},
	}

	useCase := NewCreateInvitationUseCase(mockRepo, nil)
	title := "My Wedding Invitation"
	input := CreateInvitationInput{
		LayoutID: "classic-scroll",
		Data:     json.RawMessage(`{}`),
		Title:    &title,
		UserID:   "user-123",
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if output == nil || output.Invitation == nil {
		t.Fatal("Expected invitation in output")
	}

	// Verify title is set
	if output.Invitation.Title == nil {
		t.Fatal("Expected title to be set in DTO")
	}

	if *output.Invitation.Title != title {
		t.Errorf("Expected title to be '%s', got '%s'", title, *output.Invitation.Title)
	}

	// Verify status is still set to "draft"
	if output.Invitation.Status == nil {
		t.Fatal("Expected status to be set in DTO")
	}

	if *output.Invitation.Status != "draft" {
		t.Errorf("Expected status to be 'draft', got '%s'", *output.Invitation.Status)
	}
}

func TestCreateInvitationUseCase_Execute_DefaultLayoutID(t *testing.T) {
	// Arrange
	var savedInvitation *domain.Invitation
	mockRepo := &MockInvitationRepository{
		CreateFn: func(ctx context.Context, invitation *domain.Invitation) error {
			savedInvitation = invitation
			return nil
		},
	}

	useCase := NewCreateInvitationUseCase(mockRepo, nil)
	input := CreateInvitationInput{
		LayoutID: "", // Empty layout ID should default to "classic-scroll"
		Data:     json.RawMessage(`{}`),
		UserID:   "user-123",
	}

	// Act
	_, err := useCase.Execute(context.Background(), input)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if savedInvitation == nil {
		t.Fatal("Expected invitation to be saved")
	}

	if savedInvitation.LayoutID != "classic-scroll" {
		t.Errorf("Expected LayoutID to default to 'classic-scroll', got '%s'", savedInvitation.LayoutID)
	}
	// Note: Metrics tracking (RecordInvitationCreated, RecordLayoutSelection) is verified in integration tests
}
