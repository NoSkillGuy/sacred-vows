package domain

import (
	"time"
)

// User represents a user entity
type User struct {
	ID        string
	Email     string
	Name      *string
	Password  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Validate validates user entity
// Note: Password can be empty for OAuth users (who authenticate via OAuth providers)
func (u *User) Validate() error {
	if u.Email == "" {
		return ErrInvalidEmail
	}
	// Password validation removed - OAuth users don't have passwords
	// Regular users will have hashed passwords (non-empty) from bcrypt
	// Password strength validation happens at use case level via validator.NewPassword
	return nil
}

// NewUser creates a new user entity
func NewUser(email, password string, name *string) (*User, error) {
	user := &User{
		Email:    email,
		Password: password,
		Name:     name,
	}

	if err := user.Validate(); err != nil {
		return nil, err
	}

	return user, nil
}
