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

func TestGetLayoutByIDUseCase_Execute_LayoutFound_ReturnsLayout(t *testing.T) {
	// Arrange
	layoutID := "classic-scroll"
	manifestData := json.RawMessage(`{"name": "Classic Scroll", "category": "elegant", "status": "ready"}`)
	layout := &domain.Layout{
		ID:       layoutID,
		Name:     "Classic Scroll",
		Manifest: &manifestData,
		IsActive: true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	mockRepo := &MockLayoutRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.Layout, error) {
			if id == layoutID {
				return layout, nil
			}
			return nil, nil
		},
	}

	useCase := NewGetLayoutByIDUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), layoutID)

	// Assert
	require.NoError(t, err, "Layout found should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.NotNil(t, output.Layout, "Layout should not be nil")
	assert.Equal(t, layoutID, output.Layout.ID, "Layout ID should match")
}

func TestGetLayoutByIDUseCase_Execute_LayoutNotFound_ReturnsError(t *testing.T) {
	// Arrange
	layoutID := "nonexistent-layout"

	mockRepo := &MockLayoutRepository{
		FindByIDFn: func(ctx context.Context, id string) (*domain.Layout, error) {
			return nil, nil
		},
	}

	useCase := NewGetLayoutByIDUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background(), layoutID)

	// Assert
	require.Error(t, err, "Layout not found should return error")
	assert.Nil(t, output, "Output should be nil on error")
}

