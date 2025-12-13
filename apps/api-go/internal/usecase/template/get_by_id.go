package template

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/sacred-vows/api-go/pkg/errors"
)

type GetTemplateByIDUseCase struct {
	templatesDir string
}

func NewGetTemplateByIDUseCase(templatesDir string) *GetTemplateByIDUseCase {
	return &GetTemplateByIDUseCase{
		templatesDir: templatesDir,
	}
}

type GetTemplateByIDOutput struct {
	Template *TemplateSummaryDTO
}

func (uc *GetTemplateByIDUseCase) Execute(ctx context.Context, id string) (*GetTemplateByIDOutput, error) {
	manifest, err := uc.loadManifest(id)
	if err != nil || manifest == nil {
		return nil, errors.Wrap(errors.ErrNotFound.Code, "Template not found", err)
	}

	return &GetTemplateByIDOutput{
		Template: manifest,
	}, nil
}

func (uc *GetTemplateByIDUseCase) loadManifest(templateId string) (*TemplateSummaryDTO, error) {
	manifestPath := filepath.Join(uc.templatesDir, templateId, "manifest.json")

	data, err := os.ReadFile(manifestPath)
	if err != nil {
		return nil, err
	}

	var raw map[string]interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}

	return uc.normalizeManifest(raw, templateId), nil
}

func (uc *GetTemplateByIDUseCase) normalizeManifest(input map[string]interface{}, templateId string) *TemplateSummaryDTO {
	// Same normalization logic as get_all.go
	// This should be extracted to a shared function, but keeping it simple for now
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
