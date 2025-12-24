package domain

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestInvitation_Validate_ValidInvitation_ReturnsNoError(t *testing.T) {
	// Arrange
	invitation := &Invitation{
		LayoutID: "classic-scroll",
		UserID:   "user-123",
		Data:     json.RawMessage(`{}`),
	}

	// Act
	err := invitation.Validate()

	// Assert
	require.NoError(t, err, "Valid invitation should not return error")
}

func TestInvitation_Validate_EmptyLayoutID_ReturnsError(t *testing.T) {
	// Arrange
	invitation := &Invitation{
		LayoutID: "",
		UserID:   "user-123",
		Data:     json.RawMessage(`{}`),
	}

	// Act
	err := invitation.Validate()

	// Assert
	require.Error(t, err, "Invitation with empty layout ID should return error")
	assert.Equal(t, ErrInvalidLayoutID, err, "Should return ErrInvalidLayoutID")
}

func TestInvitation_Validate_EmptyUserID_ReturnsError(t *testing.T) {
	// Arrange
	invitation := &Invitation{
		LayoutID: "classic-scroll",
		UserID:   "",
		Data:     json.RawMessage(`{}`),
	}

	// Act
	err := invitation.Validate()

	// Assert
	require.Error(t, err, "Invitation with empty user ID should return error")
	assert.Equal(t, ErrInvalidUserID, err, "Should return ErrInvalidUserID")
}

func TestNewInvitation_ValidData_ReturnsInvitation(t *testing.T) {
	// Arrange
	layoutID := "classic-scroll"
	userID := "user-123"
	data := json.RawMessage(`{"title": "My Wedding"}`)

	// Act
	invitation, err := NewInvitation(layoutID, userID, data)

	// Assert
	require.NoError(t, err, "Valid invitation creation should not return error")
	require.NotNil(t, invitation, "Invitation should not be nil")
	assert.Equal(t, layoutID, invitation.LayoutID, "Layout ID should match")
	assert.Equal(t, userID, invitation.UserID, "User ID should match")
	assert.Equal(t, data, invitation.Data, "Data should match")
}
