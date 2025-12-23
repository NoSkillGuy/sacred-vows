package validator

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewPassword_ValidPassword_ReturnsPassword(t *testing.T) {
	// Arrange
	password := "ValidPass123"

	// Act
	result, err := NewPassword(password)

	// Assert
	require.NoError(t, err, "Valid password should not return error")
	assert.Equal(t, Password(password), result, "Should return the password as Password type")
	assert.Equal(t, password, result.String(), "String() should return the original password")
}

func TestNewPassword_TooShort_ReturnsError(t *testing.T) {
	// Arrange
	password := "Short1" // Only 6 characters

	// Act
	result, err := NewPassword(password)

	// Assert
	require.Error(t, err, "Short password should return error")
	assert.Equal(t, ErrPasswordTooShort, err, "Should return ErrPasswordTooShort")
	assert.Equal(t, Password(""), result, "Should return empty Password on error")
}

func TestNewPassword_MissingUppercase_ReturnsError(t *testing.T) {
	// Arrange
	password := "validpass123" // Has lowercase and number, but no uppercase

	// Act
	result, err := NewPassword(password)

	// Assert
	require.Error(t, err, "Password without uppercase should return error")
	assert.Equal(t, ErrPasswordTooWeak, err, "Should return ErrPasswordTooWeak")
	assert.Equal(t, Password(""), result, "Should return empty Password on error")
}

func TestNewPassword_MissingLowercase_ReturnsError(t *testing.T) {
	// Arrange
	password := "VALIDPASS123" // Has uppercase and number, but no lowercase

	// Act
	result, err := NewPassword(password)

	// Assert
	require.Error(t, err, "Password without lowercase should return error")
	assert.Equal(t, ErrPasswordTooWeak, err, "Should return ErrPasswordTooWeak")
	assert.Equal(t, Password(""), result, "Should return empty Password on error")
}

func TestNewPassword_MissingNumber_ReturnsError(t *testing.T) {
	// Arrange
	password := "ValidPassword" // Has uppercase and lowercase, but no number

	// Act
	result, err := NewPassword(password)

	// Assert
	require.Error(t, err, "Password without number should return error")
	assert.Equal(t, ErrPasswordTooWeak, err, "Should return ErrPasswordTooWeak")
	assert.Equal(t, Password(""), result, "Should return empty Password on error")
}

func TestNewPassword_Exactly8Characters_ReturnsPassword(t *testing.T) {
	// Arrange
	password := "ValidPa1" // Exactly 8 characters with all requirements

	// Act
	result, err := NewPassword(password)

	// Assert
	require.NoError(t, err, "Password with exactly 8 characters should be valid")
	assert.Equal(t, Password(password), result, "Should return the password as Password type")
}

func TestNewPassword_EmptyString_ReturnsError(t *testing.T) {
	// Arrange
	password := ""

	// Act
	result, err := NewPassword(password)

	// Assert
	require.Error(t, err, "Empty password should return error")
	assert.Equal(t, ErrPasswordTooShort, err, "Should return ErrPasswordTooShort")
	assert.Equal(t, Password(""), result, "Should return empty Password on error")
}

func TestNewPassword_WithSpecialCharacters_ReturnsPassword(t *testing.T) {
	// Arrange
	password := "ValidPass123!@#" // Has all requirements plus special characters

	// Act
	result, err := NewPassword(password)

	// Assert
	require.NoError(t, err, "Password with special characters should be valid if it meets requirements")
	assert.Equal(t, Password(password), result, "Should return the password as Password type")
}

