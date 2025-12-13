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
func (u *User) Validate() error {
	if u.Email == "" {
		return ErrInvalidEmail
	}
	if u.Password == "" {
		return ErrInvalidPassword
	}
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
