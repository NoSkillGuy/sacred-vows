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

func TestRequestPasswordChangeOTPUseCase_Execute_ValidRequest_ReturnsSuccess(t *testing.T) {
	// Arrange
	userID := "user-123"
	email := "test@example.com"
	now := time.Now()

	user := &domain.User{
		ID:    userID,
		Email: email,
	}

	mockUserRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			if id == userID {
				return user, nil
			}
			return nil, nil
		},
	}

	var createdOTP *domain.PasswordChangeOTP
	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			// No existing OTP
			return nil, nil
		},
		InvalidateByUserIDFn: func(ctx context.Context, uid string) error {
			return nil
		},
		CreateFn: func(ctx context.Context, otp *domain.PasswordChangeOTP) error {
			createdOTP = otp
			return nil
		},
	}

	var sentOTP string
	mockEmailSvc := &MockEmailService{
		SendPasswordChangeOTPEmailFn: func(ctx context.Context, toEmail string, otp string) error {
			if toEmail != email {
				return assert.AnError
			}
			sentOTP = otp
			return nil
		},
	}

	mockClock := &MockClock{
		NowFn: func() time.Time {
			return now
		},
	}

	useCase := NewRequestPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo, mockEmailSvc, mockClock)
	input := RequestPasswordChangeOTPInput{
		UserID: userID,
		Email:  email,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Valid request should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.True(t, output.Success, "Success should be true")
	require.NotNil(t, createdOTP, "OTP should be created")
	assert.Equal(t, userID, createdOTP.UserID, "OTP should be for correct user")
	assert.Equal(t, email, createdOTP.Email, "OTP should have correct email")
	assert.Equal(t, 0, createdOTP.AttemptCount, "OTP should start with 0 attempts")
	assert.False(t, createdOTP.Used, "OTP should not be used")
	assert.WithinDuration(t, now.Add(domain.OTPValidityDuration), createdOTP.ExpiresAt, time.Second, "OTP should expire in 5 minutes")
	assert.NotEmpty(t, sentOTP, "OTP should be sent via email")
	assert.Len(t, sentOTP, 6, "OTP should be 6 digits")
	// Verify OTP is numeric
	for _, char := range sentOTP {
		assert.GreaterOrEqual(t, char, '0', "OTP should be numeric")
		assert.LessOrEqual(t, char, '9', "OTP should be numeric")
	}
	// Verify OTP hash matches
	expectedHash := auth.HashTokenForStorage(sentOTP)
	assert.Equal(t, expectedHash, createdOTP.OTPHash, "OTP hash should match")
}

func TestRequestPasswordChangeOTPUseCase_Execute_UserNotFound_ReturnsError(t *testing.T) {
	// Arrange
	userID := "nonexistent-user"
	email := "test@example.com"

	mockUserRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			return nil, nil
		},
	}
	mockOTPRepo := &MockPasswordChangeOTPRepository{}
	mockEmailSvc := &MockEmailService{}
	mockClock := &MockClock{}

	useCase := NewRequestPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo, mockEmailSvc, mockClock)
	input := RequestPasswordChangeOTPInput{
		UserID: userID,
		Email:  email,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "User not found should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestRequestPasswordChangeOTPUseCase_Execute_CooldownNotExpired_ReturnsError(t *testing.T) {
	// Arrange
	userID := "user-123"
	email := "test@example.com"
	now := time.Now()

	user := &domain.User{
		ID:    userID,
		Email: email,
	}

	existingOTP := &domain.PasswordChangeOTP{
		ID:        "otp-123",
		UserID:    userID,
		Email:     email,
		CreatedAt: now.Add(-10 * time.Second), // Created 10 seconds ago (within 30s cooldown)
	}

	mockUserRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			if id == userID {
				return user, nil
			}
			return nil, nil
		},
	}

	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			if uid == userID {
				return existingOTP, nil
			}
			return nil, nil
		},
	}

	mockEmailSvc := &MockEmailService{}
	mockClock := &MockClock{
		NowFn: func() time.Time {
			return now
		},
	}

	useCase := NewRequestPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo, mockEmailSvc, mockClock)
	input := RequestPasswordChangeOTPInput{
		UserID: userID,
		Email:  email,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.Error(t, err, "Cooldown not expired should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

func TestRequestPasswordChangeOTPUseCase_Execute_CooldownExpired_ReturnsSuccess(t *testing.T) {
	// Arrange
	userID := "user-123"
	email := "test@example.com"
	now := time.Now()

	user := &domain.User{
		ID:    userID,
		Email: email,
	}

	existingOTP := &domain.PasswordChangeOTP{
		ID:        "otp-123",
		UserID:    userID,
		Email:     email,
		CreatedAt: now.Add(-35 * time.Second), // Created 35 seconds ago (cooldown expired)
	}

	mockUserRepo := &MockUserRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.User, error) {
			if id == userID {
				return user, nil
			}
			return nil, nil
		},
	}

	invalidated := false
	mockOTPRepo := &MockPasswordChangeOTPRepository{
		FindByUserIDFn: func(ctx context.Context, uid string) (*domain.PasswordChangeOTP, error) {
			if uid == userID {
				return existingOTP, nil
			}
			return nil, nil
		},
		InvalidateByUserIDFn: func(ctx context.Context, uid string) error {
			if uid == userID {
				invalidated = true
			}
			return nil
		},
		CreateFn: func(ctx context.Context, otp *domain.PasswordChangeOTP) error {
			return nil
		},
	}

	mockEmailSvc := &MockEmailService{
		SendPasswordChangeOTPEmailFn: func(ctx context.Context, toEmail string, otp string) error {
			return nil
		},
	}

	mockClock := &MockClock{
		NowFn: func() time.Time {
			return now
		},
	}

	useCase := NewRequestPasswordChangeOTPUseCase(mockUserRepo, mockOTPRepo, mockEmailSvc, mockClock)
	input := RequestPasswordChangeOTPInput{
		UserID: userID,
		Email:  email,
	}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Cooldown expired should allow new OTP")
	require.NotNil(t, output, "Output should not be nil")
	assert.True(t, output.Success, "Success should be true")
	assert.True(t, invalidated, "Existing OTP should be invalidated")
}

func TestGenerateNumericOTP_GeneratesValidOTP(t *testing.T) {
	// Test the helper function directly
	tests := []struct {
		name   string
		length int
	}{
		{"6 digits", 6},
		{"4 digits", 4},
		{"8 digits", 8},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			otp, err := generateNumericOTP(tt.length)
			require.NoError(t, err, "Should generate OTP without error")
			assert.Len(t, otp, tt.length, "OTP should have correct length")
			// Verify all characters are numeric
			for _, char := range otp {
				assert.GreaterOrEqual(t, char, '0', "OTP should be numeric")
				assert.LessOrEqual(t, char, '9', "OTP should be numeric")
			}
		})
	}
}

func TestGenerateNumericOTP_InvalidLength_ReturnsError(t *testing.T) {
	otp, err := generateNumericOTP(0)
	require.Error(t, err, "Invalid length should return error")
	assert.Empty(t, otp, "OTP should be empty on error")
}
