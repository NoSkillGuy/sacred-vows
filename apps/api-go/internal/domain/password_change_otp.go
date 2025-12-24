package domain

import (
	"time"
)

const (
	MaxOTPAttempts      = 5
	OTPValidityDuration = 5 * time.Minute
)

// PasswordChangeOTP represents a password change OTP entity
type PasswordChangeOTP struct {
	ID           string
	UserID       string
	Email        string
	OTPHash      string
	ExpiresAt    time.Time
	AttemptCount int
	Used         bool
	CreatedAt    time.Time
}

// Validate validates password change OTP entity
func (otp *PasswordChangeOTP) Validate() error {
	if otp.ID == "" {
		return ErrInvalidTokenID
	}
	if otp.UserID == "" {
		return ErrInvalidUserID
	}
	if otp.Email == "" {
		return ErrInvalidEmail
	}
	if otp.OTPHash == "" {
		return ErrInvalidTokenHash
	}
	if otp.ExpiresAt.IsZero() {
		return ErrInvalidExpiration
	}
	return nil
}

// IsExpired checks if the OTP is expired
func (otp *PasswordChangeOTP) IsExpired() bool {
	return time.Now().After(otp.ExpiresAt)
}

// IsValid checks if the OTP is valid (not expired, not used, and not max attempts reached)
func (otp *PasswordChangeOTP) IsValid() bool {
	return !otp.Used && !otp.IsExpired() && !otp.IsMaxAttemptsReached()
}

// IncrementAttempts increments the attempt count
func (otp *PasswordChangeOTP) IncrementAttempts() {
	otp.AttemptCount++
}

// IsMaxAttemptsReached checks if the maximum number of attempts has been reached
func (otp *PasswordChangeOTP) IsMaxAttemptsReached() bool {
	return otp.AttemptCount >= MaxOTPAttempts
}

// NewPasswordChangeOTP creates a new password change OTP entity
func NewPasswordChangeOTP(id, userID, email, otpHash string, expiresAt time.Time) (*PasswordChangeOTP, error) {
	otp := &PasswordChangeOTP{
		ID:           id,
		UserID:       userID,
		Email:        email,
		OTPHash:      otpHash,
		ExpiresAt:    expiresAt,
		AttemptCount: 0,
		Used:         false,
		CreatedAt:    time.Now(),
	}

	if err := otp.Validate(); err != nil {
		return nil, err
	}

	return otp, nil
}
