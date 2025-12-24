package layout

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
)

// MockLayoutRepository is a hand-written mock implementation of LayoutRepository
type MockLayoutRepository struct {
	CreateFn   func(ctx context.Context, layout *domain.Layout) error
	FindByIDFn func(ctx context.Context, id string) (*domain.Layout, error)
	FindAllFn  func(ctx context.Context) ([]*domain.Layout, error)
	UpdateFn   func(ctx context.Context, layout *domain.Layout) error
	DeleteFn   func(ctx context.Context, id string) error
}

func (m *MockLayoutRepository) Create(ctx context.Context, layout *domain.Layout) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, layout)
	}
	return nil
}

func (m *MockLayoutRepository) FindByID(ctx context.Context, id string) (*domain.Layout, error) {
	if m.FindByIDFn != nil {
		return m.FindByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *MockLayoutRepository) FindAll(ctx context.Context) ([]*domain.Layout, error) {
	if m.FindAllFn != nil {
		return m.FindAllFn(ctx)
	}
	return nil, nil
}

func (m *MockLayoutRepository) Update(ctx context.Context, layout *domain.Layout) error {
	if m.UpdateFn != nil {
		return m.UpdateFn(ctx, layout)
	}
	return nil
}

func (m *MockLayoutRepository) Delete(ctx context.Context, id string) error {
	if m.DeleteFn != nil {
		return m.DeleteFn(ctx, id)
	}
	return nil
}

