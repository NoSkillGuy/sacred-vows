package validator

import (
	"errors"
	"regexp"
)

var (
	ErrInvalidEmailFormat = errors.New("invalid email format")
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Email represents a validated email address
type Email string

// NewEmail creates a new Email value object
func NewEmail(email string) (Email, error) {
	if email == "" {
		return "", ErrInvalidEmailFormat
	}

	if !emailRegex.MatchString(email) {
		return "", ErrInvalidEmailFormat
	}

	return Email(email), nil
}

// String returns the email as a string
func (e Email) String() string {
	return string(e)
}
