package template

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetTemplateManifestUseCase struct {
	templatesDir string
}

func NewGetTemplateManifestUseCase(templatesDir string) *GetTemplateManifestUseCase {
	return &GetTemplateManifestUseCase{
		templatesDir: templatesDir,
	}
}

type GetTemplateManifestOutput struct {
	Manifest map[string]interface{}
}

func (uc *GetTemplateManifestUseCase) Execute(ctx context.Context, id string) (*GetTemplateManifestOutput, error) {
	manifestPath := filepath.Join(uc.templatesDir, id, "manifest.json")

	data, err := os.ReadFile(manifestPath)
	if err != nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Template not found", err)
	}

	var manifest map[string]interface{}
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to parse manifest", err)
	}

	// Normalize manifest
	normalized := uc.normalizeManifest(manifest, id)

	// Convert back to map for full manifest response
	result := make(map[string]interface{})
	result["id"] = normalized.ID
	result["name"] = normalized.Name
	if normalized.Description != nil {
		result["description"] = *normalized.Description
	}
	if normalized.PreviewImage != nil {
		result["previewImage"] = *normalized.PreviewImage
	}
	if len(normalized.Tags) > 0 {
		result["tags"] = normalized.Tags
	}
	if normalized.Category != nil {
		result["category"] = *normalized.Category
	}
	if normalized.Version != nil {
		result["version"] = *normalized.Version
	}
	if normalized.Status != nil {
		result["status"] = *normalized.Status
	}
	if normalized.IsAvailable != nil {
		result["isAvailable"] = *normalized.IsAvailable
	}
	if normalized.IsComingSoon != nil {
		result["isComingSoon"] = *normalized.IsComingSoon
	}
	if normalized.IsFeatured != nil {
		result["isFeatured"] = *normalized.IsFeatured
	}
	if normalized.Themes != nil {
		result["themes"] = normalized.Themes
	}

	return &GetTemplateManifestOutput{
		Manifest: result,
	}, nil
}

func (uc *GetTemplateManifestUseCase) normalizeManifest(input map[string]interface{}, templateId string) *TemplateSummaryDTO {
	manifest := &TemplateSummaryDTO{
		ID:   templateId,
		Name: templateId,
	}

	if id, ok := input["id"].(string); ok {
		manifest.ID = id
	}
	if name, ok := input["name"].(string); ok {
		manifest.Name = name
	}
	if desc, ok := input["description"].(string); ok {
		manifest.Description = &desc
	}
	if preview, ok := input["previewImage"].(string); ok {
		manifest.PreviewImage = &preview
	}
	if tags, ok := input["tags"].([]interface{}); ok {
		manifest.Tags = make([]string, 0, len(tags))
		for i, tag := range tags {
			if i >= 3 {
				break
			}
			if tagStr, ok := tag.(string); ok {
				manifest.Tags = append(manifest.Tags, tagStr)
			}
		}
	}
	if category, ok := input["category"].(string); ok {
		manifest.Category = &category
	}
	if version, ok := input["version"].(string); ok {
		manifest.Version = &version
	}

	if status, ok := input["status"].(string); ok {
		manifest.Status = &status
	} else if isAvailable, ok := input["isAvailable"].(bool); ok && isAvailable {
		status := "ready"
		manifest.Status = &status
	} else if isComingSoon, ok := input["isComingSoon"].(bool); ok && isComingSoon {
		status := "coming-soon"
		manifest.Status = &status
	} else {
		status := "hidden"
		manifest.Status = &status
	}

	if manifest.Status != nil {
		isAvailable := *manifest.Status == "ready"
		isComingSoon := *manifest.Status == "coming-soon"
		manifest.IsAvailable = &isAvailable
		manifest.IsComingSoon = &isComingSoon
	}

	if isFeatured, ok := input["isFeatured"].(bool); ok {
		manifest.IsFeatured = &isFeatured
	}

	if themes, ok := input["themes"].([]interface{}); ok {
		manifest.Themes = make([]interface{}, len(themes))
		copy(manifest.Themes, themes)
	}

	return manifest
}
