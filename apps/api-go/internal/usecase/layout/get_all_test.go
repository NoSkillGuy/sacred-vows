package layout

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// mockLayoutRepository is a mock implementation of LayoutRepository
type mockLayoutRepository struct {
	mock.Mock
}

func (m *mockLayoutRepository) Create(ctx context.Context, layout *domain.Layout) error {
	args := m.Called(ctx, layout)
	return args.Error(0)
}

func (m *mockLayoutRepository) FindByID(ctx context.Context, id string) (*domain.Layout, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Layout), args.Error(1)
}

func (m *mockLayoutRepository) FindAll(ctx context.Context) ([]*domain.Layout, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Layout), args.Error(1)
}

func (m *mockLayoutRepository) Update(ctx context.Context, layout *domain.Layout) error {
	args := m.Called(ctx, layout)
	return args.Error(0)
}

func (m *mockLayoutRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestGetAllLayoutsUseCase_Execute_NoFilters_ReturnsAllLayouts(t *testing.T) {
	// Arrange
	manifestData := json.RawMessage(`{"name": "Classic Scroll", "category": "elegant", "isFeatured": true, "status": "ready"}`)
	layouts := []*domain.Layout{
		{
			ID:       "classic-scroll",
			Name:     "Classic Scroll",
			Manifest: &manifestData,
			IsActive: true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	mockRepo := new(mockLayoutRepository)
	mockRepo.On("FindAll", mock.Anything).Return(layouts, nil)

	useCase := NewGetAllLayoutsUseCase(mockRepo)
	input := GetAllLayoutsInput{}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Get all layouts should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.GreaterOrEqual(t, len(output.Layouts), 0, "Should return layouts")
	mockRepo.AssertExpectations(t)
}

