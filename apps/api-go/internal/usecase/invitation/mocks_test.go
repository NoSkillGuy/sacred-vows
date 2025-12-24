package invitation

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// MockInvitationRepository is a hand-written mock implementation of InvitationRepository
type MockInvitationRepository struct {
	CreateFn                func(ctx context.Context, invitation *domain.Invitation) error
	FindByIDFn              func(ctx context.Context, id string) (*domain.Invitation, error)
	FindByUserIDFn          func(ctx context.Context, userID string) ([]*domain.Invitation, error)
	UpdateFn                func(ctx context.Context, invitation *domain.Invitation) error
	DeleteFn                func(ctx context.Context, id string) error
	MigrateUserInvitationsFn func(ctx context.Context, fromUserID, toUserID string) (int, error)
}

func (m *MockInvitationRepository) Create(ctx context.Context, invitation *domain.Invitation) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, invitation)
	}
	return nil
}

func (m *MockInvitationRepository) FindByID(ctx context.Context, id string) (*domain.Invitation, error) {
	if m.FindByIDFn != nil {
		return m.FindByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *MockInvitationRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Invitation, error) {
	if m.FindByUserIDFn != nil {
		return m.FindByUserIDFn(ctx, userID)
	}
	return nil, nil
}

func (m *MockInvitationRepository) Update(ctx context.Context, invitation *domain.Invitation) error {
	if m.UpdateFn != nil {
		return m.UpdateFn(ctx, invitation)
	}
	return nil
}

func (m *MockInvitationRepository) Delete(ctx context.Context, id string) error {
	if m.DeleteFn != nil {
		return m.DeleteFn(ctx, id)
	}
	return nil
}

func (m *MockInvitationRepository) MigrateUserInvitations(ctx context.Context, fromUserID, toUserID string) (int, error) {
	if m.MigrateUserInvitationsFn != nil {
		return m.MigrateUserInvitationsFn(ctx, fromUserID, toUserID)
	}
	return 0, nil
}

// MockAssetRepository is a hand-written mock implementation of AssetRepository
type MockAssetRepository struct {
	CreateFn              func(ctx context.Context, asset *domain.Asset) error
	FindByIDFn            func(ctx context.Context, id string) (*domain.Asset, error)
	FindByUserIDFn        func(ctx context.Context, userID string) ([]*domain.Asset, error)
	FindByURLFn           func(ctx context.Context, url string) (*domain.Asset, error)
	FindByURLsFn          func(ctx context.Context, urls []string) ([]*domain.Asset, error)
	DeleteFn               func(ctx context.Context, id string) error
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

