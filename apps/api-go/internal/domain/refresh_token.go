package domain

import (
	"time"
)

// RefreshToken represents a refresh token entity
type RefreshToken struct {
	ID              string
	UserID          string
	TokenHash       string
	TokenFingerprint []byte
	HMACKeyID       int16
	ExpiresAt       time.Time
	Revoked         bool
	CreatedAt       time.Time
}

// Validate validates refresh token entity
func (rt *RefreshToken) Validate() error {
	if rt.ID == "" {
		return ErrInvalidTokenID
	}
	if rt.UserID == "" {
		return ErrInvalidUserID
	}
	if rt.TokenHash == "" {
		return ErrInvalidTokenHash
	}
	if len(rt.TokenFingerprint) == 0 {
		return ErrInvalidTokenHash
	}
	if rt.ExpiresAt.IsZero() {
		return ErrInvalidExpiration
	}
	return nil
}

// IsExpired checks if the refresh token is expired
func (rt *RefreshToken) IsExpired() bool {
	return time.Now().After(rt.ExpiresAt)
}

// IsValid checks if the refresh token is valid (not expired and not revoked)
func (rt *RefreshToken) IsValid() bool {
	return !rt.Revoked && !rt.IsExpired()
}

// NewRefreshToken creates a new refresh token entity
func NewRefreshToken(id, userID, tokenHash string, tokenFingerprint []byte, hmacKeyID int16, expiresAt time.Time) (*RefreshToken, error) {
	token := &RefreshToken{
		ID:               id,
		UserID:           userID,
		TokenHash:        tokenHash,
		TokenFingerprint: tokenFingerprint,
		HMACKeyID:        hmacKeyID,
		ExpiresAt:        expiresAt,
		Revoked:          false,
		CreatedAt:        time.Now(),
	}

	if err := token.Validate(); err != nil {
		return nil, err
	}

	return token, nil
}

