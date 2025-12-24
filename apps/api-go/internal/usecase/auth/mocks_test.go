package auth

import (
	"context"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/clock"
)

// MockUserRepository is a hand-written mock implementation of UserRepository
type MockUserRepository struct {
	CreateFn      func(ctx context.Context, user *domain.User) error
	FindByIDFn    func(ctx context.Context, id string) (*domain.User, error)
	FindByEmailFn func(ctx context.Context, email string) (*domain.User, error)
	UpdateFn      func(ctx context.Context, user *domain.User) error
	DeleteFn      func(ctx context.Context, id string) error
}

func (m *MockUserRepository) Create(ctx context.Context, user *domain.User) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, user)
	}
	return nil
}

func (m *MockUserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	if m.FindByIDFn != nil {
		return m.FindByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	if m.FindByEmailFn != nil {
		return m.FindByEmailFn(ctx, email)
	}
	return nil, nil
}

func (m *MockUserRepository) Update(ctx context.Context, user *domain.User) error {
	if m.UpdateFn != nil {
		return m.UpdateFn(ctx, user)
	}
	return nil
}

func (m *MockUserRepository) Delete(ctx context.Context, id string) error {
	if m.DeleteFn != nil {
		return m.DeleteFn(ctx, id)
	}
	return nil
}

// MockPasswordResetRepository is a hand-written mock implementation of PasswordResetRepository
type MockPasswordResetRepository struct {
	CreateFn          func(ctx context.Context, token *domain.PasswordResetToken) error
	FindByTokenHashFn func(ctx context.Context, hash string) (*domain.PasswordResetToken, error)
	MarkAsUsedFn      func(ctx context.Context, tokenID string) error
	DeleteExpiredFn   func(ctx context.Context) error
}

func (m *MockPasswordResetRepository) Create(ctx context.Context, token *domain.PasswordResetToken) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, token)
	}
	return nil
}

func (m *MockPasswordResetRepository) FindByTokenHash(ctx context.Context, hash string) (*domain.PasswordResetToken, error) {
	if m.FindByTokenHashFn != nil {
		return m.FindByTokenHashFn(ctx, hash)
	}
	return nil, nil
}

func (m *MockPasswordResetRepository) MarkAsUsed(ctx context.Context, tokenID string) error {
	if m.MarkAsUsedFn != nil {
		return m.MarkAsUsedFn(ctx, tokenID)
	}
	return nil
}

func (m *MockPasswordResetRepository) DeleteExpired(ctx context.Context) error {
	if m.DeleteExpiredFn != nil {
		return m.DeleteExpiredFn(ctx)
	}
	return nil
}

// MockRefreshTokenRepository is a hand-written mock implementation of RefreshTokenRepository
type MockRefreshTokenRepository struct {
	CreateFn                 func(ctx context.Context, token *domain.RefreshToken) error
	FindByTokenFingerprintFn func(ctx context.Context, fingerprint []byte) (*domain.RefreshToken, error)
	FindByIDFn               func(ctx context.Context, id string) (*domain.RefreshToken, error)
	RevokeByUserIDFn         func(ctx context.Context, userID string) error
	RevokeByIDFn             func(ctx context.Context, id string) error
	DeleteExpiredFn          func(ctx context.Context) error
}

func (m *MockRefreshTokenRepository) Create(ctx context.Context, token *domain.RefreshToken) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, token)
	}
	return nil
}

func (m *MockRefreshTokenRepository) FindByTokenFingerprint(ctx context.Context, fingerprint []byte) (*domain.RefreshToken, error) {
	if m.FindByTokenFingerprintFn != nil {
		return m.FindByTokenFingerprintFn(ctx, fingerprint)
	}
	return nil, nil
}

func (m *MockRefreshTokenRepository) FindByID(ctx context.Context, id string) (*domain.RefreshToken, error) {
	if m.FindByIDFn != nil {
		return m.FindByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *MockRefreshTokenRepository) RevokeByUserID(ctx context.Context, userID string) error {
	if m.RevokeByUserIDFn != nil {
		return m.RevokeByUserIDFn(ctx, userID)
	}
	return nil
}

func (m *MockRefreshTokenRepository) RevokeByID(ctx context.Context, id string) error {
	if m.RevokeByIDFn != nil {
		return m.RevokeByIDFn(ctx, id)
	}
	return nil
}

func (m *MockRefreshTokenRepository) DeleteExpired(ctx context.Context) error {
	if m.DeleteExpiredFn != nil {
		return m.DeleteExpiredFn(ctx)
	}
	return nil
}

// MockEmailService is a hand-written mock implementation of EmailService
type MockEmailService struct {
	SendPasswordResetEmailFn func(ctx context.Context, toEmail string, resetLink string) error
}

func (m *MockEmailService) SendPasswordResetEmail(ctx context.Context, toEmail string, resetLink string) error {
	if m.SendPasswordResetEmailFn != nil {
		return m.SendPasswordResetEmailFn(ctx, toEmail, resetLink)
	}
	return nil
}

// MockClock is a hand-written mock implementation of Clock
type MockClock struct {
	NowFn func() time.Time
}

func (m *MockClock) Now() time.Time {
	if m.NowFn != nil {
		return m.NowFn()
	}
	return time.Now()
}

// Ensure MockClock implements clock.Clock interface
var _ clock.Clock = (*MockClock)(nil)
