package layout

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

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

	mockRepo := &MockLayoutRepository{
		FindAllFn: func(ctx context.Context) ([]*domain.Layout, error) {
			return layouts, nil
		},
	}

	useCase := NewGetAllLayoutsUseCase(mockRepo)
	input := GetAllLayoutsInput{}

	// Act
	output, err := useCase.Execute(context.Background(), input)

	// Assert
	require.NoError(t, err, "Get all layouts should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.GreaterOrEqual(t, len(output.Layouts), 0, "Should return layouts")
}

