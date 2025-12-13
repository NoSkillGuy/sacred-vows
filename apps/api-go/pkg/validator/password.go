package validator

import (
	"errors"
	"unicode"
)

var (
	ErrPasswordTooShort = errors.New("password must be at least 8 characters")
	ErrPasswordTooWeak  = errors.New("password is too weak")
)

// Password represents a password value object
type Password string

// NewPassword creates a new Password value object with validation
func NewPassword(password string) (Password, error) {
	if len(password) < 8 {
		return "", ErrPasswordTooShort
	}

	// Basic strength check
	hasUpper := false
	hasLower := false
	hasNumber := false

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		}
	}

	if !hasUpper || !hasLower || !hasNumber {
		return "", ErrPasswordTooWeak
	}

	return Password(password), nil
}

// String returns the password as a string
func (p Password) String() string {
	return string(p)
}
