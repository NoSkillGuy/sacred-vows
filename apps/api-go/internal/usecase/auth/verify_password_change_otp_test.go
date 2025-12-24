package auth

import (
	"context"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestVerifyPasswordChangeOTPUseCase_Execute_ValidOTP_UpdatesPassword(t *testing.T) {
	// Arrange
	userID := "user-123"
	otp := "123456"
	newPassword := "NewValidPass123"
	otpHash := auth.HashTokenForStorage(otp)

	validOTP := &domain.PasswordChangeOTP{
		ID:           "otp-123",
		UserID:       userID,
		Email:        "test@example.com",
		OTPHash:      otpHash,
		ExpiresAt:    time.Now().Add(5 * time.Minute),
		AttemptCount: 0,
		Used:         false,
	}

	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			if uid == userID {
				return validOTP, nil
			}
			return nil, nil
		},
		MarkAsUsedFn: func(ctx context.Context, otpID string) error {
			if otpID != validOTP.ID {
				return assert.AnError
			}
			return nil
		},
	}

	var updatedUser *domain.User
	mockUserRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			if id == userID {
				return user, nil
			}
			return nil, nil
		},
		UpdateFn: func(ctx context.Context, u *domain.User) error {
			if u.ID != userID || u.Password == "" {
				return assert.AnError
			}
			updatedUser = u
			return nil
		},
	}

	useCase := NewVerifyPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo)
	input := VerifyPasswordChangeOTPInput{
		UserID:      userID,
		OTP:         otp,
		NewPassword: newPassword,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid OTP should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.True(t, output.Success, "Success should be true")
	require.NotNil(t, updatedUser, "User should be updated")
	assert.NotEmpty(t, updatedUser.Password, "Password should be hashed and set")
	assert.NotEqual(t, newPassword, updatedUser.Password, "Password should be hashed, not plaintext")
}

func TestVerifyPasswordChangeOTPUseCase_Execute_InvalidPassword_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	otp := "123456"
	weakPassword := "weak" // Too weak

	mockOTPRepo := &MockPasswordChangeOTPRepository{}
	mockUserRepo := &MockUserRepository{}

	useCase := NewVerifyPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo)
	input := VerifyPasswordChangeOTPInput{
		UserID:      userID,
		OTP:         otp,
		NewPassword: weakPassword,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Invalid password should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestVerifyPasswordChangeOTPUseCase_Execute_OTPNotFound_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	otp := "123456"
	newPassword := "NewValidPass123"

	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			return nil, nil
		},
	}
	mockUserRepo := &MockUserRepository{}

	useCase := NewVerifyPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo)
	input := VerifyPasswordChangeOTPInput{
		UserID:      userID,
		OTP:         otp,
		NewPassword: newPassword,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "OTP not found should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestVerifyPasswordChangeOTPUseCase_Execute_ExpiredOTP_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	otp := "123456"
	newPassword := "NewValidPass123"
	otpHash := auth.HashTokenForStorage(otp)

	expiredOTP := &domain.PasswordChangeOTP{
		ID:           "otp-123",
		UserID:       userID,
		Email:        "test@example.com",
		OTPHash:      otpHash,
		ExpiresAt:    time.Now().Add(-1 * time.Minute), // Expired
		AttemptCount: 0,
		Used:         false,
	}

	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			if uid == userID {
				return expiredOTP, nil
			}
			return nil, nil
		},
	}
	mockUserRepo := &MockUserRepository{}

	useCase := NewVerifyPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo)
	input := VerifyPasswordChangeOTPInput{
		UserID:      userID,
		OTP:         otp,
		NewPassword: newPassword,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Expired OTP should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestVerifyPasswordChangeOTPUseCase_Execute_UsedOTP_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	otp := "123456"
	newPassword := "NewValidPass123"
	otpHash := auth.HashTokenForStorage(otp)

	usedOTP := &domain.PasswordChangeOTP{
		ID:           "otp-123",
		UserID:       userID,
		Email:        "test@example.com",
		OTPHash:      otpHash,
		ExpiresAt:    time.Now().Add(5 * time.Minute),
		AttemptCount: 0,
		Used:         true, // Already used
	}

	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			if uid == userID {
				return usedOTP, nil
			}
			return nil, nil
		},
	}
	mockUserRepo := &MockUserRepository{}

	useCase := NewVerifyPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo)
	input := VerifyPasswordChangeOTPInput{
		UserID:      userID,
		OTP:         otp,
		NewPassword: newPassword,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Used OTP should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestVerifyPasswordChangeOTPUseCase_Execute_MaxAttemptsReached_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	otp := "123456"
	newPassword := "NewValidPass123"
	otpHash := auth.HashTokenForStorage("wrong-otp") // Different hash

	maxAttemptsOTP := &domain.PasswordChangeOTP{
		ID:           "otp-123",
		UserID:       userID,
		Email:        "test@example.com",
		OTPHash:      otpHash,
		ExpiresAt:    time.Now().Add(5 * time.Minute),
		AttemptCount: domain.MaxOTPAttempts, // Max attempts reached
		Used:         false,
	}

	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			if uid == userID {
				return maxAttemptsOTP, nil
			}
			return nil, nil
		},
	}
	mockUserRepo := &MockUserRepository{}

	useCase := NewVerifyPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo)
	input := VerifyPasswordChangeOTPInput{
		UserID:      userID,
		OTP:         otp,
		NewPassword: newPassword,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Max attempts reached should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestVerifyPasswordChangeOTPUseCase_Execute_InvalidOTP_IncrementsAttempts(t *testing.T) {
	// Arrange
	userID := "user-123"
	wrongOTP := "999999"
	newPassword := "NewValidPass123"
	correctOTPHash := auth.HashTokenForStorage("123456") // Different from wrongOTP

	validOTP := &domain.PasswordChangeOTP{
		ID:           "otp-123",
		UserID:       userID,
		Email:        "test@example.com",
		OTPHash:      correctOTPHash,
		ExpiresAt:    time.Now().Add(5 * time.Minute),
		AttemptCount: 2, // Already 2 attempts
		Used:         false,
	}

	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			if uid == userID {
				return validOTP, nil
			}
			return nil, nil
		},
		IncrementAttemptsFn: func(ctx context.Context, otpID string) error {
			if otpID != validOTP.ID {
				return assert.AnError
			}
			validOTP.AttemptCount++
			return nil
		},
	}
	mockUserRepo := &MockUserRepository{}

	useCase := NewVerifyPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo)
	input := VerifyPasswordChangeOTPInput{
		UserID:      userID,
		OTP:         wrongOTP,
		NewPassword: newPassword,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Invalid OTP should return error")
	assert.Nil(t, output, "Output should be nil on error")
	assert.Equal(t, 3, validOTP.AttemptCount, "Attempt count should be incremented")
}

