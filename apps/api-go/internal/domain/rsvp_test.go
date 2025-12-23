package domain

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRSVPResponse_Validate_ValidRSVP_ReturnsNoError(t *testing.T) {
	// Arrange
	rsvp := &RSVPResponse{
		InvitationID: "invitation-123",
		Name:         "John Doe",
		Date:         "2024-06-15",
	}

	// Act
	err := rsvp.Validate()

	// Assert
	require.NoError(t, err, "Valid RSVP should not return error")
}

func TestRSVPResponse_Validate_EmptyInvitationID_ReturnsError(t *testing.T) {
	// Arrange
	rsvp := &RSVPResponse{
		InvitationID: "",
		Name:         "John Doe",
		Date:         "2024-06-15",
	}

	// Act
	err := rsvp.Validate()

	// Assert
	require.Error(t, err, "RSVP with empty invitation ID should return error")
	assert.Equal(t, ErrInvalidInvitationID, err, "Should return ErrInvalidInvitationID")
}

func TestRSVPResponse_Validate_EmptyName_ReturnsError(t *testing.T) {
	// Arrange
	rsvp := &RSVPResponse{
		InvitationID: "invitation-123",
		Name:         "",
		Date:         "2024-06-15",
	}

	// Act
	err := rsvp.Validate()

	// Assert
	require.Error(t, err, "RSVP with empty name should return error")
	assert.Equal(t, ErrInvalidName, err, "Should return ErrInvalidName")
}

func TestRSVPResponse_Validate_EmptyDate_ReturnsError(t *testing.T) {
	// Arrange
	rsvp := &RSVPResponse{
		InvitationID: "invitation-123",
		Name:         "John Doe",
		Date:         "",
	}

	// Act
	err := rsvp.Validate()

	// Assert
	require.Error(t, err, "RSVP with empty date should return error")
	assert.Equal(t, ErrInvalidDate, err, "Should return ErrInvalidDate")
}

func TestNewRSVPResponse_ValidData_ReturnsRSVP(t *testing.T) {
	// Arrange
	invitationID := "invitation-123"
	name := "John Doe"
	date := "2024-06-15"
	email := "john@example.com"

	// Act
	rsvp, err := NewRSVPResponse(invitationID, name, date, &email, nil, nil)

	// Assert
	require.NoError(t, err, "Valid RSVP creation should not return error")
	require.NotNil(t, rsvp, "RSVP should not be nil")
	assert.Equal(t, invitationID, rsvp.InvitationID, "Invitation ID should match")
	assert.Equal(t, name, rsvp.Name, "Name should match")
	assert.Equal(t, date, rsvp.Date, "Date should match")
	assert.Equal(t, &email, rsvp.Email, "Email should match")
}

