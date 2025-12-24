package invitation

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
)

func TestToInvitationDTO_DefaultStatusToDraft(t *testing.T) {
	// Arrange: Create invitation without status in _meta
	invitation := &domain.Invitation{
		ID:        "inv-123",
		LayoutID:  "classic-scroll",
		Data:      json.RawMessage(`{"couple": {"bride": "Alice", "groom": "Bob"}}`),
		UserID:    "user-123",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Act
	dto := toInvitationDTO(invitation)

	// Assert
	if dto == nil {
		t.Fatal("Expected DTO to be created")
	}

	if dto.Status == nil {
		t.Fatal("Expected status to be set (defaulted to 'draft')")
	}

	if *dto.Status != "draft" {
		t.Errorf("Expected status to default to 'draft', got '%s'", *dto.Status)
	}
}

func TestToInvitationDTO_WithStatusInMeta(t *testing.T) {
	// Arrange: Create invitation with status="published" in _meta
	invitation := &domain.Invitation{
		ID:       "inv-123",
		LayoutID: "classic-scroll",
		Data: json.RawMessage(`{
			"couple": {"bride": "Alice", "groom": "Bob"},
			"_meta": {"status": "published"}
		}`),
		UserID:    "user-123",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Act
	dto := toInvitationDTO(invitation)

	// Assert
	if dto == nil {
		t.Fatal("Expected DTO to be created")
	}

	if dto.Status == nil {
		t.Fatal("Expected status to be set")
	}

	if *dto.Status != "published" {
		t.Errorf("Expected status to be 'published', got '%s'", *dto.Status)
	}
}

func TestToInvitationDTO_WithDraftStatusInMeta(t *testing.T) {
	// Arrange: Create invitation with status="draft" in _meta
	invitation := &domain.Invitation{
		ID:       "inv-123",
		LayoutID: "classic-scroll",
		Data: json.RawMessage(`{
			"couple": {"bride": "Alice", "groom": "Bob"},
			"_meta": {"status": "draft"}
		}`),
		UserID:    "user-123",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Act
	dto := toInvitationDTO(invitation)

	// Assert
	if dto == nil {
		t.Fatal("Expected DTO to be created")
	}

	if dto.Status == nil {
		t.Fatal("Expected status to be set")
	}

	if *dto.Status != "draft" {
		t.Errorf("Expected status to be 'draft', got '%s'", *dto.Status)
	}
}

func TestToInvitationDTO_WithTitleInMeta(t *testing.T) {
	// Arrange: Create invitation with title in _meta
	invitation := &domain.Invitation{
		ID:       "inv-123",
		LayoutID: "classic-scroll",
		Data: json.RawMessage(`{
			"couple": {"bride": "Alice", "groom": "Bob"},
			"_meta": {"title": "Alice & Bob's Wedding"}
		}`),
		UserID:    "user-123",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Act
	dto := toInvitationDTO(invitation)

	// Assert
	if dto == nil {
		t.Fatal("Expected DTO to be created")
	}

	if dto.Title == nil {
		t.Fatal("Expected title to be set")
	}

	if *dto.Title != "Alice & Bob's Wedding" {
		t.Errorf("Expected title to be 'Alice & Bob's Wedding', got '%s'", *dto.Title)
	}

	// Status should still default to "draft" when not present
	if dto.Status == nil {
		t.Fatal("Expected status to be set (defaulted to 'draft')")
	}

	if *dto.Status != "draft" {
		t.Errorf("Expected status to default to 'draft', got '%s'", *dto.Status)
	}
}

func TestExtractMetadataFromData_NoMeta(t *testing.T) {
	// Arrange
	data := json.RawMessage(`{"couple": {"bride": "Alice", "groom": "Bob"}}`)

	// Act
	title, status := extractMetadataFromData(data)

	// Assert
	if title != nil {
		t.Errorf("Expected title to be nil, got '%s'", *title)
	}

	if status != nil {
		t.Errorf("Expected status to be nil, got '%s'", *status)
	}
}

func TestExtractMetadataFromData_WithStatus(t *testing.T) {
	// Arrange
	data := json.RawMessage(`{
		"couple": {"bride": "Alice", "groom": "Bob"},
		"_meta": {"status": "published"}
	}`)

	// Act
	title, status := extractMetadataFromData(data)

	// Assert
	if title != nil {
		t.Errorf("Expected title to be nil, got '%s'", *title)
	}

	if status == nil {
		t.Fatal("Expected status to be extracted")
	}

	if *status != "published" {
		t.Errorf("Expected status to be 'published', got '%s'", *status)
	}
}

func TestExtractMetadataFromData_EmptyData(t *testing.T) {
	// Arrange
	data := json.RawMessage(`{}`)

	// Act
	title, status := extractMetadataFromData(data)

	// Assert
	if title != nil {
		t.Errorf("Expected title to be nil, got '%s'", *title)
	}

	if status != nil {
		t.Errorf("Expected status to be nil, got '%s'", *status)
	}
}

func TestExtractMetadataFromData_EmptyString(t *testing.T) {
	// Arrange
	data := json.RawMessage(``)

	// Act
	title, status := extractMetadataFromData(data)

	// Assert
	if title != nil {
		t.Errorf("Expected title to be nil, got '%s'", *title)
	}

	if status != nil {
		t.Errorf("Expected status to be nil, got '%s'", *status)
	}
}
