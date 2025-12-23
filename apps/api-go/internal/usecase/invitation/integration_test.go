package invitation

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
)

// TestCreateInvitationUseCase_Integration_StatusInResponse tests that
// when creating a new invitation, the response includes status="draft"
func TestCreateInvitationUseCase_Integration_StatusInResponse(t *testing.T) {
	// Arrange
	mockRepo := &mockInvitationRepository{
		createFunc: func(ctx context.Context, invitation *domain.Invitation) error {
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

	// Verify status is present and set to "draft"
	if output.Invitation.Status == nil {
		t.Fatal("Expected status to be present in API response")
	}

	if *output.Invitation.Status != "draft" {
		t.Errorf("Expected status to be 'draft' in API response, got '%s'", *output.Invitation.Status)
	}
}

// TestGetAllInvitationsUseCase_Integration_DefaultStatus tests that
// when retrieving invitations without status, they are returned with status="draft"
func TestGetAllInvitationsUseCase_Integration_DefaultStatus(t *testing.T) {
	// Arrange
	// Create invitations without status in _meta
	invitationsWithoutStatus := []*domain.Invitation{
		{
			ID:       "inv-1",
			LayoutID: "classic-scroll",
			Data:     json.RawMessage(`{"couple": {"bride": "Alice", "groom": "Bob"}}`),
			UserID:   "user-123",
		},
		{
			ID:       "inv-2",
			LayoutID: "classic-scroll",
			Data:     json.RawMessage(`{}`),
			UserID:   "user-123",
		},
	}

	mockRepo := &mockInvitationRepositoryWithFind{
		mockInvitationRepository: mockInvitationRepository{},
		findByUserIDFunc: func(ctx context.Context, userID string) ([]*domain.Invitation, error) {
			return invitationsWithoutStatus, nil
		},
	}

	useCase := NewGetAllInvitationsUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), "user-123")

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if output == nil {
		t.Fatal("Expected output")
	}

	if len(output.Invitations) != 2 {
		t.Fatalf("Expected 2 invitations, got %d", len(output.Invitations))
	}

	// Verify all invitations have status="draft"
	for i, inv := range output.Invitations {
		if inv.Status == nil {
			t.Errorf("Invitation %d: Expected status to be present, got nil", i)
			continue
		}

		if *inv.Status != "draft" {
			t.Errorf("Invitation %d: Expected status to be 'draft', got '%s'", i, *inv.Status)
		}
	}
}

// TestGetAllInvitationsUseCase_Integration_PreserveExistingStatus tests that
// invitations with existing status are preserved correctly
func TestGetAllInvitationsUseCase_Integration_PreserveExistingStatus(t *testing.T) {
	// Arrange
	invitationsWithStatus := []*domain.Invitation{
		{
			ID:       "inv-1",
			LayoutID: "classic-scroll",
			Data:     json.RawMessage(`{"_meta": {"status": "published"}}`),
			UserID:   "user-123",
		},
		{
			ID:       "inv-2",
			LayoutID: "classic-scroll",
			Data:     json.RawMessage(`{"_meta": {"status": "draft"}}`),
			UserID:   "user-123",
		},
		{
			ID:       "inv-3",
			LayoutID: "classic-scroll",
			Data:     json.RawMessage(`{}`), // No status - should default to draft
			UserID:   "user-123",
		},
	}

	mockRepo := &mockInvitationRepositoryWithFind{
		mockInvitationRepository: mockInvitationRepository{},
		findByUserIDFunc: func(ctx context.Context, userID string) ([]*domain.Invitation, error) {
			return invitationsWithStatus, nil
		},
	}

	useCase := NewGetAllInvitationsUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), "user-123")

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if len(output.Invitations) != 3 {
		t.Fatalf("Expected 3 invitations, got %d", len(output.Invitations))
	}

	// Verify statuses are correct
	if output.Invitations[0].Status == nil || *output.Invitations[0].Status != "published" {
		t.Errorf("Expected first invitation to have status 'published'")
	}

	if output.Invitations[1].Status == nil || *output.Invitations[1].Status != "draft" {
		t.Errorf("Expected second invitation to have status 'draft'")
	}

	if output.Invitations[2].Status == nil || *output.Invitations[2].Status != "draft" {
		t.Errorf("Expected third invitation (without status) to default to 'draft'")
	}
}

// Update mockInvitationRepository to support FindByUserID
type mockInvitationRepositoryWithFind struct {
	mockInvitationRepository
	findByUserIDFunc func(ctx context.Context, userID string) ([]*domain.Invitation, error)
}

func (m *mockInvitationRepositoryWithFind) FindByUserID(ctx context.Context, userID string) ([]*domain.Invitation, error) {
	if m.findByUserIDFunc != nil {
		return m.findByUserIDFunc(ctx, userID)
	}
	return nil, nil
}

func (m *mockInvitationRepositoryWithFind) MigrateUserInvitations(ctx context.Context, fromUserID, toUserID string) (int, error) {
	return 0, nil
}
