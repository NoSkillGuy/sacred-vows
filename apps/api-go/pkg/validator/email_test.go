package validator

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewEmail_ValidEmail_ReturnsEmail(t *testing.T) {
	// Arrange
	email := "user@example.com"

	// Act
	result, err := NewEmail(email)

	// Assert
	require.NoError(t, err, "Valid email should not return error")
	assert.Equal(t, Email(email), result, "Should return the email as Email type")
	assert.Equal(t, email, result.String(), "String() should return the original email")
}

func TestNewEmail_EmptyString_ReturnsError(t *testing.T) {
	// Arrange
	email := ""

	// Act
	result, err := NewEmail(email)

	// Assert
	require.Error(t, err, "Empty email should return error")
	assert.Equal(t, ErrInvalidEmailFormat, err, "Should return ErrInvalidEmailFormat")
	assert.Equal(t, Email(""), result, "Should return empty Email on error")
}

func TestNewEmail_MissingAtSymbol_ReturnsError(t *testing.T) {
	// Arrange
	email := "userexample.com"

	// Act
	result, err := NewEmail(email)

	// Assert
	require.Error(t, err, "Email without @ symbol should return error")
	assert.Equal(t, ErrInvalidEmailFormat, err, "Should return ErrInvalidEmailFormat")
	assert.Equal(t, Email(""), result, "Should return empty Email on error")
}

func TestNewEmail_MissingDomain_ReturnsError(t *testing.T) {
	// Arrange
	email := "user@"

	// Act
	result, err := NewEmail(email)

	// Assert
	require.Error(t, err, "Email without domain should return error")
	assert.Equal(t, ErrInvalidEmailFormat, err, "Should return ErrInvalidEmailFormat")
	assert.Equal(t, Email(""), result, "Should return empty Email on error")
}

func TestNewEmail_MissingTLD_ReturnsError(t *testing.T) {
	// Arrange
	email := "user@example"

	// Act
	result, err := NewEmail(email)

	// Assert
	require.Error(t, err, "Email without TLD should return error")
	assert.Equal(t, ErrInvalidEmailFormat, err, "Should return ErrInvalidEmailFormat")
	assert.Equal(t, Email(""), result, "Should return empty Email on error")
}

func TestNewEmail_WithDotsInLocalPart_ReturnsEmail(t *testing.T) {
	// Arrange
	email := "user.name@example.com"

	// Act
	result, err := NewEmail(email)

	// Assert
	require.NoError(t, err, "Email with dots in local part should be valid")
	assert.Equal(t, Email(email), result, "Should return the email as Email type")
}

func TestNewEmail_WithPlusSign_ReturnsEmail(t *testing.T) {
	// Arrange
	email := "user+tag@example.com"

	// Act
	result, err := NewEmail(email)

	// Assert
	require.NoError(t, err, "Email with plus sign should be valid")
	assert.Equal(t, Email(email), result, "Should return the email as Email type")
}

func TestNewEmail_WithSubdomain_ReturnsEmail(t *testing.T) {
	// Arrange
	email := "user@mail.example.com"

	// Act
	result, err := NewEmail(email)

	// Assert
	require.NoError(t, err, "Email with subdomain should be valid")
	assert.Equal(t, Email(email), result, "Should return the email as Email type")
}
