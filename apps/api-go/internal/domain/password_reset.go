package domain

import (
	"time"
)

// PasswordResetToken represents a password reset token entity
type PasswordResetToken struct {
	ID        string
	UserID    string
	TokenHash string
	ExpiresAt time.Time
	Used      bool
	CreatedAt time.Time
}

// Validate validates password reset token entity
func (prt *PasswordResetToken) Validate() error {
	if prt.ID == "" {
		return ErrInvalidTokenID
	}
	if prt.UserID == "" {
		return ErrInvalidUserID
	}
	if prt.TokenHash == "" {
		return ErrInvalidTokenHash
	}
	if prt.ExpiresAt.IsZero() {
		return ErrInvalidExpiration
	}
	return nil
}

// IsExpired checks if the password reset token is expired
func (prt *PasswordResetToken) IsExpired() bool {
	return time.Now().After(prt.ExpiresAt)
}

// IsValid checks if the password reset token is valid (not expired and not used)
func (prt *PasswordResetToken) IsValid() bool {
	return !prt.Used && !prt.IsExpired()
}

// NewPasswordResetToken creates a new password reset token entity
func NewPasswordResetToken(id, userID, tokenHash string, expiresAt time.Time) (*PasswordResetToken, error) {
	token := &PasswordResetToken{
		ID:        id,
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
		Used:      false,
		CreatedAt: time.Now(),
	}

	if err := token.Validate(); err != nil {
		return nil, err
	}

	return token, nil
}



