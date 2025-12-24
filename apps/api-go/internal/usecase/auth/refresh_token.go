package auth

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/interfaces/clock"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type RefreshTokenUseCase struct {
	refreshTokenRepo repository.RefreshTokenRepository
	userRepo         repository.UserRepository
	jwtService       *auth.JWTService
	clock            clock.Clock
	hmacKeys         []auth.RefreshTokenHMACKey
	activeHMACKeyID  int16
}

func NewRefreshTokenUseCase(
	refreshTokenRepo repository.RefreshTokenRepository,
	userRepo repository.UserRepository,
	jwtService *auth.JWTService,
	clk clock.Clock,
	hmacKeys []auth.RefreshTokenHMACKey,
	activeHMACKeyID int16,
) *RefreshTokenUseCase {
	return &RefreshTokenUseCase{
		refreshTokenRepo: refreshTokenRepo,
		userRepo:         userRepo,
		jwtService:       jwtService,
		clock:            clk,
		hmacKeys:         hmacKeys,
		activeHMACKeyID:  activeHMACKeyID,
	}
}

type RefreshTokenInput struct {
	RefreshToken string // Plaintext refresh token from cookie
}

type RefreshTokenOutput struct {
	AccessToken  string
	RefreshToken string // New rotated refresh token
	TokenID      string // ID of the new refresh token
}

func (uc *RefreshTokenUseCase) Execute(ctx context.Context, input RefreshTokenInput) (*RefreshTokenOutput, error) {
	if input.RefreshToken == "" {
		return nil, errors.New(errors.ErrBadRequest.Code, "Refresh token is required")
	}

	tokenBytes, err := auth.DecodeRefreshToken(input.RefreshToken)
	if err != nil {
		return nil, errors.New(errors.ErrUnauthorized.Code, "Invalid refresh token")
	}

	var storedToken *domain.RefreshToken
	hmacKeys := uc.orderedHMACKeys()
	for _, k := range hmacKeys {
		fp := auth.ComputeRefreshTokenFingerprint(k.Key, tokenBytes)
		t, findErr := uc.refreshTokenRepo.FindByTokenFingerprint(ctx, fp)
		if findErr != nil {
			return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find refresh token", findErr)
		}
		if t == nil {
			continue
		}
		if !auth.CompareTokenHash(input.RefreshToken, t.TokenHash) {
			return nil, errors.New(errors.ErrUnauthorized.Code, "Invalid refresh token")
		}
		storedToken = t
		break
	}

	if storedToken == nil {
		return nil, errors.New(errors.ErrUnauthorized.Code, "Invalid refresh token")
	}

	// Check if token is revoked
	if storedToken.Revoked {
		return nil, errors.New(errors.ErrUnauthorized.Code, "Refresh token has been revoked")
	}

	// Check if token is expired
	if storedToken.IsExpired() {
		return nil, errors.New(errors.ErrUnauthorized.Code, "Refresh token has expired")
	}

	// Verify user still exists
	user, err := uc.userRepo.FindByID(ctx, storedToken.UserID)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to find user", err)
	}

	if user == nil {
		return nil, errors.New(errors.ErrUnauthorized.Code, "User not found")
	}

	// Token rotation: Generate new refresh token
	newTokenID, newRefreshToken, err := uc.jwtService.GenerateRefreshToken(user.ID, user.Email)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to generate refresh token", err)
	}

	// Hash the new refresh token
	newTokenHash, err := auth.HashToken(newRefreshToken)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to hash new refresh token", err)
	}

	activeKey, ok := uc.getActiveHMACKey()
	if !ok {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Refresh token HMAC key not configured", nil)
	}
	newTokenBytes, err := auth.DecodeRefreshToken(newRefreshToken)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Invalid refresh token encoding", err)
	}
	newFingerprint := auth.ComputeRefreshTokenFingerprint(activeKey.Key, newTokenBytes)

	// Create new refresh token entity
	expiresAt := uc.clock.Now().Add(uc.jwtService.GetRefreshExpiration())
	newRefreshTokenEntity, err := domain.NewRefreshToken(
		newTokenID,
		user.ID,
		newTokenHash,
		newFingerprint,
		activeKey.ID,
		expiresAt,
	)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to create refresh token entity", err)
	}

	// Store new refresh token
	if err := uc.refreshTokenRepo.Create(ctx, newRefreshTokenEntity); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to store new refresh token", err)
	}

	// Revoke old refresh token
	if err := uc.refreshTokenRepo.RevokeByID(ctx, storedToken.ID); err != nil {
		// Log error but don't fail - token rotation still succeeded
		// The old token is now invalidated by the new one being created
	}

	// Generate new access token
	accessToken, err := uc.jwtService.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to generate access token", err)
	}

	return &RefreshTokenOutput{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		TokenID:      newTokenID,
	}, nil
}

func (uc *RefreshTokenUseCase) getActiveHMACKey() (auth.RefreshTokenHMACKey, bool) {
	for _, k := range uc.hmacKeys {
		if k.ID == uc.activeHMACKeyID {
			return k, true
		}
	}
	return auth.RefreshTokenHMACKey{}, false
}

func (uc *RefreshTokenUseCase) orderedHMACKeys() []auth.RefreshTokenHMACKey {
	if len(uc.hmacKeys) <= 1 {
		return uc.hmacKeys
	}
	out := make([]auth.RefreshTokenHMACKey, 0, len(uc.hmacKeys))
	if active, ok := uc.getActiveHMACKey(); ok {
		out = append(out, active)
	}
	for _, k := range uc.hmacKeys {
		if k.ID == uc.activeHMACKeyID {
			continue
		}
		out = append(out, k)
	}
	return out
}
