package template

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
)

type GetManifestsUseCase struct {
	templatesDir string
}

func NewGetManifestsUseCase(templatesDir string) *GetManifestsUseCase {
	return &GetManifestsUseCase{
		templatesDir: templatesDir,
	}
}

type GetManifestsOutput struct {
	Manifests []map[string]interface{}
}

func (uc *GetManifestsUseCase) Execute(ctx context.Context) (*GetManifestsOutput, error) {
	templateIds, err := uc.getTemplateIds()
	if err != nil {
		return nil, err
	}

	var manifests []map[string]interface{}
	for _, templateId := range templateIds {
		manifest, err := uc.loadManifest(templateId)
		if err != nil || manifest == nil {
			continue
		}

		// Convert to map
		manifestMap := make(map[string]interface{})
		manifestMap["id"] = manifest.ID
		manifestMap["name"] = manifest.Name
		if manifest.Description != nil {
			manifestMap["description"] = *manifest.Description
		}
		if manifest.PreviewImage != nil {
			manifestMap["previewImage"] = *manifest.PreviewImage
		}
		if len(manifest.Tags) > 0 {
			manifestMap["tags"] = manifest.Tags
		}
		if manifest.Category != nil {
			manifestMap["category"] = *manifest.Category
		}
		if manifest.Version != nil {
			manifestMap["version"] = *manifest.Version
		}
		if manifest.Status != nil {
			manifestMap["status"] = *manifest.Status
		}
		if manifest.IsAvailable != nil {
			manifestMap["isAvailable"] = *manifest.IsAvailable
		}
		if manifest.IsComingSoon != nil {
			manifestMap["isComingSoon"] = *manifest.IsComingSoon
		}
		if manifest.IsFeatured != nil {
			manifestMap["isFeatured"] = *manifest.IsFeatured
		}
		if manifest.Themes != nil {
			manifestMap["themes"] = manifest.Themes
		}

		manifests = append(manifests, manifestMap)
	}

	return &GetManifestsOutput{
		Manifests: manifests,
	}, nil
}

func (uc *GetManifestsUseCase) getTemplateIds() ([]string, error) {
	entries, err := os.ReadDir(uc.templatesDir)
	if err != nil {
		return nil, err
	}

	var templateIds []string
	for _, entry := range entries {
		if entry.IsDir() {
			fullPath := filepath.Join(uc.templatesDir, entry.Name())
			info, err := os.Stat(fullPath)
			if err == nil && info.IsDir() {
				templateIds = append(templateIds, entry.Name())
			}
		}
	}

	return templateIds, nil
}

func (uc *GetManifestsUseCase) loadManifest(templateId string) (*TemplateSummaryDTO, error) {
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

func (uc *GetManifestsUseCase) normalizeManifest(input map[string]interface{}, templateId string) *TemplateSummaryDTO {
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
