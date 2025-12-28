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

func TestGetManifestsUseCase_Execute_IncludesPresets(t *testing.T) {
	// Arrange
	manifestJSON := `{
		"id": "editorial-elegance",
		"name": "Editorial Elegance",
		"status": "ready",
		"presets": [
			{
				"id": "modern-editorial",
				"name": "Modern Editorial",
				"emoji": "🖤",
				"description": "Minimal & Luxe",
				"useCase": "For couples who want elegance, restraint, and strong visual impact.",
				"bestFor": "City weddings, intimate guest lists, design-forward couples",
				"sectionIds": ["hero", "countdown", "quote", "editorial-intro", "couple", "events", "location", "gallery", "rsvp", "footer"]
			},
			{
				"id": "love-story-feature",
				"name": "Love Story Feature",
				"emoji": "🤍",
				"description": "Romantic & Narrative",
				"useCase": "Feels like a full magazine wedding spread. Perfect for couples who love storytelling.",
				"bestFor": "Couples who love storytelling, emotional depth, destination weddings",
				"sectionIds": ["hero", "quote", "editorial-intro", "story", "couple", "wedding-party", "events", "location", "travel", "things-to-do", "gallery", "dress-code", "rsvp", "footer"]
			},
			{
				"id": "guest-experience",
				"name": "Guest Experience",
				"emoji": "✨",
				"description": "Clean & Thoughtful",
				"useCase": "Designed around guest clarity without killing elegance.",
				"bestFor": "Larger weddings, mixed-age guests, practical planners",
				"sectionIds": ["hero", "countdown", "editorial-intro", "events", "location", "travel", "dress-code", "faq", "registry", "gallery", "rsvp", "contact", "footer"]
			}
		]
	}`
	manifestData := json.RawMessage(manifestJSON)

	layouts := []*domain.Layout{
		{
			ID:        "editorial-elegance",
			Name:      "Editorial Elegance",
			Manifest:  &manifestData,
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	mockRepo := &MockLayoutRepository{
		FindAllFn: func(ctx context.Context) ([]*domain.Layout, error) {
			return layouts, nil
		},
	}

	useCase := NewGetManifestsUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background())

	// Assert
	require.NoError(t, err, "Get manifests should not return error")
	require.NotNil(t, output, "Output should not be nil")
	require.Len(t, output.Manifests, 1, "Should return one manifest")

	manifest := output.Manifests[0]
	require.NotNil(t, manifest, "Manifest should not be nil")

	// Verify presets are included
	presets, ok := manifest["presets"].([]interface{})
	require.True(t, ok, "Presets should be present in manifest")
	require.Len(t, presets, 3, "Should have 3 presets")

	// Verify first preset structure
	preset1, ok := presets[0].(map[string]interface{})
	require.True(t, ok, "First preset should be a map")
	assert.Equal(t, "modern-editorial", preset1["id"], "First preset should have correct id")
	assert.Equal(t, "Modern Editorial", preset1["name"], "First preset should have correct name")
	assert.Equal(t, "🖤", preset1["emoji"], "First preset should have correct emoji")

	// Verify sectionIds are included
	sectionIds, ok := preset1["sectionIds"].([]interface{})
	require.True(t, ok, "sectionIds should be present")
	assert.Greater(t, len(sectionIds), 0, "sectionIds should not be empty")
}

func TestGetManifestsUseCase_Execute_FiltersNonReadyLayouts(t *testing.T) {
	// Arrange
	readyManifestJSON := json.RawMessage(`{"id": "ready-layout", "name": "Ready Layout", "status": "ready"}`)
	comingSoonManifestJSON := json.RawMessage(`{"id": "coming-soon-layout", "name": "Coming Soon Layout", "status": "coming-soon"}`)

	layouts := []*domain.Layout{
		{
			ID:        "ready-layout",
			Name:      "Ready Layout",
			Manifest:  &readyManifestJSON,
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "coming-soon-layout",
			Name:      "Coming Soon Layout",
			Manifest:  &comingSoonManifestJSON,
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	mockRepo := &MockLayoutRepository{
		FindAllFn: func(ctx context.Context) ([]*domain.Layout, error) {
			return layouts, nil
		},
	}

	useCase := NewGetManifestsUseCase(mockRepo)

	// Act
	output, err := useCase.Execute(context.Background())

	// Assert
	require.NoError(t, err, "Get manifests should not return error")
	require.NotNil(t, output, "Output should not be nil")
	assert.Len(t, output.Manifests, 1, "Should only return ready layouts")
	assert.Equal(t, "ready-layout", output.Manifests[0]["id"], "Should return ready layout")
}

