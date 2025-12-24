package asset

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// MockAssetRepository is a hand-written mock implementation of AssetRepository
type MockAssetRepository struct {
	CreateFn              func(ctx context.Context, asset *domain.Asset) error
	FindByIDFn            func(ctx context.Context, id string) (*domain.Asset, error)
	FindByUserIDFn        func(ctx context.Context, userID string) ([]*domain.Asset, error)
	FindByURLFn           func(ctx context.Context, url string) (*domain.Asset, error)
	FindByURLsFn          func(ctx context.Context, urls []string) ([]*domain.Asset, error)
	DeleteFn              func(ctx context.Context, id string) error
	DeleteByURLFn         func(ctx context.Context, url string) error
	FindUsedInInvitationsFn func(ctx context.Context, assetID string) ([]string, error)
	TrackUsageFn          func(ctx context.Context, assetID, invitationID string) error
	UntrackUsageFn        func(ctx context.Context, assetID, invitationID string) error
	UntrackAllUsageFn     func(ctx context.Context, invitationID string) error
}

func (m *MockAssetRepository) Create(ctx context.Context, asset *domain.Asset) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, asset)
	}
	return nil
}

func (m *MockAssetRepository) FindByID(ctx context.Context, id string) (*domain.Asset, error) {
	if m.FindByIDFn != nil {
		return m.FindByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *MockAssetRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Asset, error) {
	if m.FindByUserIDFn != nil {
		return m.FindByUserIDFn(ctx, userID)
	}
	return nil, nil
}

func (m *MockAssetRepository) FindByURL(ctx context.Context, url string) (*domain.Asset, error) {
	if m.FindByURLFn != nil {
		return m.FindByURLFn(ctx, url)
	}
	return nil, nil
}

func (m *MockAssetRepository) FindByURLs(ctx context.Context, urls []string) ([]*domain.Asset, error) {
	if m.FindByURLsFn != nil {
		return m.FindByURLsFn(ctx, urls)
	}
	return nil, nil
}

func (m *MockAssetRepository) Delete(ctx context.Context, id string) error {
	if m.DeleteFn != nil {
		return m.DeleteFn(ctx, id)
	}
	return nil
}

func (m *MockAssetRepository) DeleteByURL(ctx context.Context, url string) error {
	if m.DeleteByURLFn != nil {
		return m.DeleteByURLFn(ctx, url)
	}
	return nil
}

func (m *MockAssetRepository) FindUsedInInvitations(ctx context.Context, assetID string) ([]string, error) {
	if m.FindUsedInInvitationsFn != nil {
		return m.FindUsedInInvitationsFn(ctx, assetID)
	}
	return nil, nil
}

func (m *MockAssetRepository) TrackUsage(ctx context.Context, assetID, invitationID string) error {
	if m.TrackUsageFn != nil {
		return m.TrackUsageFn(ctx, assetID, invitationID)
	}
	return nil
}

func (m *MockAssetRepository) UntrackUsage(ctx context.Context, assetID, invitationID string) error {
	if m.UntrackUsageFn != nil {
		return m.UntrackUsageFn(ctx, assetID, invitationID)
	}
	return nil
}

func (m *MockAssetRepository) UntrackAllUsage(ctx context.Context, invitationID string) error {
	if m.UntrackAllUsageFn != nil {
		return m.UntrackAllUsageFn(ctx, invitationID)
	}
	return nil
}

