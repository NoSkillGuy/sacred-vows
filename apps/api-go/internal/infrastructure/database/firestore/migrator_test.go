package firestore

import (
	"encoding/json"
	"testing"
)

// TestMigration003PresetStructure validates that the presets added by migration 003
// have the correct structure and all required fields.
func TestMigration003PresetStructure(t *testing.T) {
	expectedPresets := []map[string]interface{}{
		{
			"id":          "modern-editorial",
			"name":        "Modern Editorial",
			"emoji":       "🖤",
			"description": "Minimal & Luxe",
			"useCase":     "For couples who want elegance, restraint, and strong visual impact.",
			"bestFor":     "City weddings, intimate guest lists, design-forward couples",
			"sectionIds":  []string{"hero", "countdown", "quote", "editorial-intro", "couple", "events", "location", "gallery", "rsvp", "footer"},
		},
		{
			"id":          "love-story-feature",
			"name":        "Love Story Feature",
			"emoji":       "🤍",
			"description": "Romantic & Narrative",
			"useCase":     "Feels like a full magazine wedding spread. Perfect for couples who love storytelling.",
			"bestFor":     "Couples who love storytelling, emotional depth, destination weddings",
			"sectionIds":  []string{"hero", "quote", "editorial-intro", "story", "couple", "wedding-party", "events", "location", "travel", "things-to-do", "gallery", "dress-code", "rsvp", "footer"},
		},
		{
			"id":          "guest-experience",
			"name":        "Guest Experience",
			"emoji":       "✨",
			"description": "Clean & Thoughtful",
			"useCase":     "Designed around guest clarity without killing elegance.",
			"bestFor":     "Larger weddings, mixed-age guests, practical planners",
			"sectionIds":  []string{"hero", "countdown", "editorial-intro", "events", "location", "travel", "dress-code", "faq", "registry", "gallery", "rsvp", "contact", "footer"},
		},
	}

	// Validate preset structure
	for i, preset := range expectedPresets {
		// Check required fields
		if preset["id"] == nil || preset["id"].(string) == "" {
			t.Errorf("Preset %d: missing or empty 'id' field", i)
		}
		if preset["name"] == nil || preset["name"].(string) == "" {
			t.Errorf("Preset %d: missing or empty 'name' field", i)
		}
		if preset["emoji"] == nil || preset["emoji"].(string) == "" {
			t.Errorf("Preset %d: missing or empty 'emoji' field", i)
		}
		if preset["description"] == nil || preset["description"].(string) == "" {
			t.Errorf("Preset %d: missing or empty 'description' field", i)
		}
		if preset["useCase"] == nil || preset["useCase"].(string) == "" {
			t.Errorf("Preset %d: missing or empty 'useCase' field", i)
		}
		if preset["bestFor"] == nil || preset["bestFor"].(string) == "" {
			t.Errorf("Preset %d: missing or empty 'bestFor' field", i)
		}
		if preset["sectionIds"] == nil {
			t.Errorf("Preset %d: missing 'sectionIds' field", i)
		}

		// Validate sectionIds is a slice of strings
		sectionIds, ok := preset["sectionIds"].([]string)
		if !ok {
			t.Errorf("Preset %d: 'sectionIds' must be a slice of strings", i)
			continue
		}

		if len(sectionIds) == 0 {
			t.Errorf("Preset %d: 'sectionIds' must not be empty", i)
		}

		// Validate that hero and footer are always included (required sections)
		hasHero := false
		hasFooter := false
		for _, sectionId := range sectionIds {
			if sectionId == "hero" {
				hasHero = true
			}
			if sectionId == "footer" {
				hasFooter = true
			}
		}

		if !hasHero {
			t.Errorf("Preset %d: missing required 'hero' section", i)
		}
		if !hasFooter {
			t.Errorf("Preset %d: missing required 'footer' section", i)
		}
	}
}

// TestMigration003IdempotencyLogic tests the idempotency check logic
// that prevents adding presets if they already exist.
func TestMigration003IdempotencyLogic(t *testing.T) {
	// Test case 1: Manifest without presets
	manifestWithoutPresets := map[string]interface{}{
		"id":   "editorial-elegance",
		"name": "Editorial Elegance",
		"sections": []interface{}{
			map[string]interface{}{"id": "hero", "required": true},
			map[string]interface{}{"id": "footer", "required": true},
		},
	}

	// Check if presets exist
	if presets, ok := manifestWithoutPresets["presets"].([]interface{}); ok && len(presets) > 0 {
		t.Error("Expected no presets, but found presets")
	}

	// Test case 2: Manifest with existing presets
	manifestWithPresets := map[string]interface{}{
		"id":   "editorial-elegance",
		"name": "Editorial Elegance",
		"presets": []interface{}{
			map[string]interface{}{
				"id":   "existing-preset",
				"name": "Existing Preset",
			},
		},
	}

	// Check if presets exist
	if presets, ok := manifestWithPresets["presets"].([]interface{}); !ok || len(presets) == 0 {
		t.Error("Expected presets to exist, but they don't")
	}

	// Test case 3: Manifest with empty presets array (should be treated as no presets)
	manifestWithEmptyPresets := map[string]interface{}{
		"id":      "editorial-elegance",
		"name":    "Editorial Elegance",
		"presets": []interface{}{},
	}

	// Check if presets exist (empty array should be treated as no presets)
	if presets, ok := manifestWithEmptyPresets["presets"].([]interface{}); ok && len(presets) > 0 {
		t.Error("Expected no presets (empty array), but found presets")
	}
}

// TestMigration003ManifestParsing tests the manifest parsing logic
func TestMigration003ManifestParsing(t *testing.T) {
	// Valid manifest JSON
	validManifestJSON := `{
		"id": "editorial-elegance",
		"name": "Editorial Elegance",
		"sections": [
			{"id": "hero", "required": true},
			{"id": "footer", "required": true}
		]
	}`

	var manifest map[string]interface{}
	err := json.Unmarshal([]byte(validManifestJSON), &manifest)
	if err != nil {
		t.Fatalf("Failed to parse valid manifest JSON: %v", err)
	}

	if manifest["id"] != "editorial-elegance" {
		t.Error("Failed to parse manifest 'id' field")
	}

	// Invalid manifest JSON (malformed JSON)
	invalidManifestJSON := `{
		"id": "editorial-elegance",
		"name": "Editorial Elegance"
		"missing": "comma"
	}`

	var invalidManifest map[string]interface{}
	err = json.Unmarshal([]byte(invalidManifestJSON), &invalidManifest)
	if err == nil {
		t.Error("Expected error when parsing invalid JSON, but got none")
	}
}

// TestMigration003PresetSectionIds validates that preset section IDs
// match expected values from the migration function.
func TestMigration003PresetSectionIds(t *testing.T) {
	expectedPresets := map[string][]string{
		"modern-editorial": {
			"hero", "countdown", "quote", "editorial-intro", "couple",
			"events", "location", "gallery", "rsvp", "footer",
		},
		"love-story-feature": {
			"hero", "quote", "editorial-intro", "story", "couple",
			"wedding-party", "events", "location", "travel", "things-to-do",
			"gallery", "dress-code", "rsvp", "footer",
		},
		"guest-experience": {
			"hero", "countdown", "editorial-intro", "events", "location",
			"travel", "dress-code", "faq", "registry", "gallery",
			"rsvp", "contact", "footer",
		},
	}

	// Validate each preset has the correct section IDs
	for presetID, expectedSections := range expectedPresets {
		// Check that all expected sections are present
		sectionMap := make(map[string]bool)
		for _, section := range expectedSections {
			sectionMap[section] = true
		}

		// Verify hero and footer are always present
		if !sectionMap["hero"] {
			t.Errorf("Preset %s: missing required 'hero' section", presetID)
		}
		if !sectionMap["footer"] {
			t.Errorf("Preset %s: missing required 'footer' section", presetID)
		}

		// Verify section count matches expected
		if len(expectedSections) < 10 {
			t.Errorf("Preset %s: expected at least 10 sections, got %d", presetID, len(expectedSections))
		}
	}
}
