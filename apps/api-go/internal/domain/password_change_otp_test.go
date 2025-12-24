package domain

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewPasswordChangeOTP_ValidInput_CreatesOTP(t *testing.T) {
	// Arrange
	id := "otp-123"
	userID := "user-123"
	email := "test@example.com"
	otpHash := "hashed-otp"
	expiresAt := time.Now().Add(5 * time.Minute)

	// Act
	otp, err := NewPasswordChangeOTP(id, userID, email, otpHash, expiresAt)

	// Assert
	require.NoError(t, err, "Valid input should not return error")
	require.NotNil(t, otp, "OTP should not be nil")
	assert.Equal(t, id, otp.ID, "ID should match")
	assert.Equal(t, userID, otp.UserID, "UserID should match")
	assert.Equal(t, email, otp.Email, "Email should match")
	assert.Equal(t, otpHash, otp.OTPHash, "OTPHash should match")
	assert.Equal(t, expiresAt, otp.ExpiresAt, "ExpiresAt should match")
	assert.Equal(t, 0, otp.AttemptCount, "AttemptCount should start at 0")
	assert.False(t, otp.Used, "Used should be false")
	assert.False(t, otp.CreatedAt.IsZero(), "CreatedAt should be set")
}

func TestNewPasswordChangeOTP_InvalidInput_ReturnsError(t *testing.T) {
	tests := []struct {
		name      string
		id        string
		userID    string
		email     string
		otpHash   string
		expiresAt time.Time
	}{
		{"empty ID", "", "user-123", "test@example.com", "hash", time.Now().Add(5 * time.Minute)},
		{"empty UserID", "otp-123", "", "test@example.com", "hash", time.Now().Add(5 * time.Minute)},
		{"empty Email", "otp-123", "user-123", "", "hash", time.Now().Add(5 * time.Minute)},
		{"empty OTPHash", "otp-123", "user-123", "test@example.com", "", time.Now().Add(5 * time.Minute)},
		{"zero ExpiresAt", "otp-123", "user-123", "test@example.com", "hash", time.Time{}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			otp, err := NewPasswordChangeOTP(tt.id, tt.userID, tt.email, tt.otpHash, tt.expiresAt)
			require.Error(t, err, "Invalid input should return error")
			assert.Nil(t, otp, "OTP should be nil on error")
		})
	}
}

func TestPasswordChangeOTP_IsExpired(t *testing.T) {
	tests := []struct {
		name      string
		expiresAt time.Time
		want      bool
	}{
		{"not expired", time.Now().Add(5 * time.Minute), false},
		{"expired", time.Now().Add(-1 * time.Minute), true},
		{"just expired", time.Now().Add(-1 * time.Second), true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			otp := &PasswordChangeOTP{
				ID:        "otp-123",
				UserID:    "user-123",
				Email:     "test@example.com",
				OTPHash:   "hash",
				ExpiresAt: tt.expiresAt,
				Used:      false,
			}
			assert.Equal(t, tt.want, otp.IsExpired(), "IsExpired should return correct value")
		})
	}
}

func TestPasswordChangeOTP_IsValid(t *testing.T) {
	tests := []struct {
		name        string
		used        bool
		expired     bool
		maxAttempts bool
		want        bool
	}{
		{"valid", false, false, false, true},
		{"used", true, false, false, false},
		{"expired", false, true, false, false},
		{"max attempts", false, false, true, false},
		{"used and expired", true, true, false, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			expiresAt := time.Now().Add(5 * time.Minute)
			if tt.expired {
				expiresAt = time.Now().Add(-1 * time.Minute)
			}

			attemptCount := 0
			if tt.maxAttempts {
				attemptCount = MaxOTPAttempts
			}

			otp := &PasswordChangeOTP{
				ID:           "otp-123",
				UserID:       "user-123",
				Email:        "test@example.com",
				OTPHash:      "hash",
				ExpiresAt:    expiresAt,
				AttemptCount: attemptCount,
				Used:         tt.used,
			}
			assert.Equal(t, tt.want, otp.IsValid(), "IsValid should return correct value")
		})
	}
}

func TestPasswordChangeOTP_IncrementAttempts(t *testing.T) {
	otp := &PasswordChangeOTP{
		ID:           "otp-123",
		UserID:       "user-123",
		Email:        "test@example.com",
		OTPHash:      "hash",
		ExpiresAt:    time.Now().Add(5 * time.Minute),
		AttemptCount: 2,
		Used:         false,
	}

	otp.IncrementAttempts()
	assert.Equal(t, 3, otp.AttemptCount, "AttemptCount should be incremented")
}

func TestPasswordChangeOTP_IsMaxAttemptsReached(t *testing.T) {
	tests := []struct {
		name         string
		attemptCount int
		want         bool
	}{
		{"below max", 0, false},
		{"below max", 3, false},
		{"below max", 4, false},
		{"at max", MaxOTPAttempts, true},
		{"above max", MaxOTPAttempts + 1, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			otp := &PasswordChangeOTP{
				ID:           "otp-123",
				UserID:       "user-123",
				Email:        "test@example.com",
				OTPHash:      "hash",
				ExpiresAt:    time.Now().Add(5 * time.Minute),
				AttemptCount: tt.attemptCount,
				Used:         false,
			}
			assert.Equal(t, tt.want, otp.IsMaxAttemptsReached(), "IsMaxAttemptsReached should return correct value")
		})
	}
}
