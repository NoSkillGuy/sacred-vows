package auth

import (
	"context"
	"encoding/base64"
	"strings"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	authinfra "github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/infrastructure/database/postgres"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type fakeRefreshTokenRepo struct {
	byFP map[string]*domain.RefreshToken
	created *domain.RefreshToken
}

func (f *fakeRefreshTokenRepo) Create(ctx context.Context, token *domain.RefreshToken) error {
	f.created = token
	return nil
}
func (f *fakeRefreshTokenRepo) FindByTokenFingerprint(ctx context.Context, fingerprint []byte) (*domain.RefreshToken, error) {
	if f.byFP == nil {
		return nil, nil
	}
	return f.byFP[string(fingerprint)], nil
}
func (f *fakeRefreshTokenRepo) FindByID(ctx context.Context, id string) (*domain.RefreshToken, error) { return nil, nil }
func (f *fakeRefreshTokenRepo) RevokeByUserID(ctx context.Context, userID string) error                 { return nil }
func (f *fakeRefreshTokenRepo) RevokeByID(ctx context.Context, id string) error                         { return nil }
func (f *fakeRefreshTokenRepo) DeleteExpired(ctx context.Context) error                                  { return nil }

type fakeUserRepo struct{}

func (f *fakeUserRepo) Create(ctx context.Context, user *domain.User) error { return nil }
func (f *fakeUserRepo) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	return nil, nil
}
func (f *fakeUserRepo) FindByID(ctx context.Context, id string) (*domain.User, error) {
	return &domain.User{ID: id, Email: "u@example.com"}, nil
}
func (f *fakeUserRepo) Update(ctx context.Context, user *domain.User) error { return nil }
func (f *fakeUserRepo) Delete(ctx context.Context, id string) error         { return nil }

func TestRefreshTokenUseCase_OrderedKeysActiveFirst(t *testing.T) {
	uc := &RefreshTokenUseCase{
		hmacKeys: []authinfra.RefreshTokenHMACKey{
			{ID: 1, Key: []byte("k1")},
			{ID: 2, Key: []byte("k2")},
		},
		activeHMACKeyID: 2,
	}
	keys := uc.orderedHMACKeys()
	if len(keys) != 2 || keys[0].ID != 2 {
		t.Fatalf("expected active key first")
	}
}

func TestRefreshTokenUseCase_LookupTriesOlderKeys(t *testing.T) {
	// token bytes and encoded form
	tokenBytes := []byte("token-bytes-32......................")
	tokenStr := base64.URLEncoding.EncodeToString(tokenBytes)

	// keys: active(2) won't match, old(1) matches
	keys := []authinfra.RefreshTokenHMACKey{
		{ID: 2, Key: []byte(strings.Repeat("a", 32))},
		{ID: 1, Key: []byte(strings.Repeat("b", 32))},
	}

	oldFP := authinfra.ComputeRefreshTokenFingerprint(keys[1].Key, tokenBytes)
	hash, err := postgres.HashToken(tokenStr)
	if err != nil {
		t.Fatalf("hash err: %v", err)
	}

	stored := &domain.RefreshToken{
		ID:              "rt1",
		UserID:          "u1",
		TokenHash:       hash,
		TokenFingerprint: oldFP,
		HMACKeyID:       1,
		ExpiresAt:       time.Now().Add(1 * time.Hour),
		Revoked:         false,
		CreatedAt:       time.Now(),
	}

	repo := &fakeRefreshTokenRepo{byFP: map[string]*domain.RefreshToken{string(oldFP): stored}}

	uc := &RefreshTokenUseCase{
		refreshTokenRepo: repo,
		userRepo:         &fakeUserRepo{},
		jwtService:       authinfra.NewJWTService(strings.Repeat("s", 32), 15*time.Minute, 30*24*time.Hour, "iss", "aud", 60*time.Second),
		hmacKeys:         keys,
		activeHMACKeyID:  2,
	}

	out, execErr := uc.Execute(context.Background(), RefreshTokenInput{RefreshToken: tokenStr})
	if execErr != nil {
		// Helpful in case config errors bubble up as internal
		if appErr, ok := execErr.(*errors.AppError); ok {
			t.Fatalf("Execute error: %v (code=%d)", appErr.Message, appErr.Code)
		}
		t.Fatalf("Execute error: %v", execErr)
	}
	if out.AccessToken == "" || out.RefreshToken == "" || out.TokenID == "" {
		t.Fatalf("expected tokens in output")
	}
	if repo.created == nil {
		t.Fatalf("expected Create called for rotated token")
	}
	if repo.created.HMACKeyID != 2 {
		t.Fatalf("expected new token stored with active key id 2, got %d", repo.created.HMACKeyID)
	}
}


