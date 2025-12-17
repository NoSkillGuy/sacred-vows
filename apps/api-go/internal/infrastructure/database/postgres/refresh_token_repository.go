package postgres

import (
	"context"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type refreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) repository.RefreshTokenRepository {
	return &refreshTokenRepository{db: db}
}

// HashToken hashes a refresh token using bcrypt
func HashToken(token string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(token), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CompareTokenHash compares a token with a hash
func CompareTokenHash(token, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(token))
	return err == nil
}

func (r *refreshTokenRepository) Create(ctx context.Context, token *domain.RefreshToken) error {
	model := &RefreshTokenModel{
		ID:               token.ID,
		UserID:           token.UserID,
		TokenHash:        token.TokenHash,
		TokenFingerprint: token.TokenFingerprint,
		HMACKeyID:        token.HMACKeyID,
		ExpiresAt:        token.ExpiresAt,
		Revoked:          token.Revoked,
		CreatedAt:        token.CreatedAt,
	}
	return r.db.WithContext(ctx).Create(model).Error
}

func (r *refreshTokenRepository) FindByTokenFingerprint(ctx context.Context, fingerprint []byte) (*domain.RefreshToken, error) {
	var model RefreshTokenModel
	if err := r.db.WithContext(ctx).
		Where("token_fingerprint = ?", fingerprint).
		First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toRefreshTokenDomain(&model), nil
}

func (r *refreshTokenRepository) FindByID(ctx context.Context, id string) (*domain.RefreshToken, error) {
	var model RefreshTokenModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return toRefreshTokenDomain(&model), nil
}

func (r *refreshTokenRepository) RevokeByUserID(ctx context.Context, userID string) error {
	return r.db.WithContext(ctx).Model(&RefreshTokenModel{}).
		Where("user_id = ?", userID).
		Update("revoked", true).Error
}

func (r *refreshTokenRepository) RevokeByID(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Model(&RefreshTokenModel{}).
		Where("id = ?", id).
		Update("revoked", true).Error
}

func (r *refreshTokenRepository) DeleteExpired(ctx context.Context) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Where("expires_at < ?", now).
		Delete(&RefreshTokenModel{}).Error
}

func toRefreshTokenDomain(model *RefreshTokenModel) *domain.RefreshToken {
	return &domain.RefreshToken{
		ID:               model.ID,
		UserID:           model.UserID,
		TokenHash:        model.TokenHash,
		TokenFingerprint: model.TokenFingerprint,
		HMACKeyID:        model.HMACKeyID,
		ExpiresAt:        model.ExpiresAt,
		Revoked:          model.Revoked,
		CreatedAt:        model.CreatedAt,
	}
}
