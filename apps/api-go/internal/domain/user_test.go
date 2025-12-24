package domain

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUser_Validate_ValidUser_ReturnsNoError(t *testing.T) {
	// Arrange
	user := &User{
		Email:    "test@example.com",
		Password: "hashedpassword",
	}

	// Act
	err := user.Validate()

	// Assert
	require.NoError(t, err, "Valid user should not return error")
}

func TestUser_Validate_EmptyEmail_ReturnsError(t *testing.T) {
	// Arrange
	user := &User{
		Email:    "",
		Password: "hashedpassword",
	}

	// Act
	err := user.Validate()

	// Assert
	require.Error(t, err, "User with empty email should return error")
	assert.Equal(t, ErrInvalidEmail, err, "Should return ErrInvalidEmail")
}

func TestNewUser_ValidData_ReturnsUser(t *testing.T) {
	// Arrange
	email := "test@example.com"
	password := "hashedpassword"
	name := "Test User"

	// Act
	user, err := NewUser(email, password, &name)

	// Assert
	require.NoError(t, err, "Valid user creation should not return error")
	require.NotNil(t, user, "User should not be nil")
	assert.Equal(t, email, user.Email, "Email should match")
	assert.Equal(t, password, user.Password, "Password should match")
	assert.Equal(t, &name, user.Name, "Name should match")
}

func TestNewUser_InvalidEmail_ReturnsError(t *testing.T) {
	// Arrange
	email := ""
	password := "hashedpassword"

	// Act
	user, err := NewUser(email, password, nil)

	// Assert
	require.Error(t, err, "Invalid email should return error")
	assert.Nil(t, user, "User should be nil on error")
}
