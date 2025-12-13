package template

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
)

type GetAllTemplatesUseCase struct {
	templatesDir string
}

func NewGetAllTemplatesUseCase(templatesDir string) *GetAllTemplatesUseCase {
	return &GetAllTemplatesUseCase{
		templatesDir: templatesDir,
	}
}

type GetAllTemplatesInput struct {
	Category *string
	Featured *bool
}

type GetAllTemplatesOutput struct {
	Templates  []*TemplateSummaryDTO
	Categories []string
}

func (uc *GetAllTemplatesUseCase) Execute(ctx context.Context, input GetAllTemplatesInput) (*GetAllTemplatesOutput, error) {
	catalog, err := uc.getTemplateCatalog()
	if err != nil {
		return nil, err
	}

	var filteredTemplates []*TemplateSummaryDTO
	categories := make(map[string]bool)
	categories["all"] = true

	for _, manifest := range catalog {
		// Filter out coming-soon templates - only show ready templates
		isReady := false
		if manifest.Status != nil && *manifest.Status == "ready" {
			isReady = true
		} else if manifest.IsAvailable != nil && *manifest.IsAvailable {
			isReady = true
		}
		if !isReady {
			continue
		}

		// Filter by category
		if input.Category != nil && *input.Category != "all" {
			if manifest.Category == nil || *manifest.Category != *input.Category {
				continue
			}
		}

		// Filter by featured
		if input.Featured != nil && *input.Featured {
			if manifest.IsFeatured == nil || !*manifest.IsFeatured {
				continue
			}
		}

		filteredTemplates = append(filteredTemplates, manifest)
		if manifest.Category != nil {
			categories[*manifest.Category] = true
		}
	}

	categoryList := make([]string, 0, len(categories))
	for cat := range categories {
		categoryList = append(categoryList, cat)
	}

	return &GetAllTemplatesOutput{
		Templates:  filteredTemplates,
		Categories: categoryList,
	}, nil
}

func (uc *GetAllTemplatesUseCase) getTemplateCatalog() ([]*TemplateSummaryDTO, error) {
	templateIds, err := uc.getTemplateIds()
	if err != nil {
		return nil, err
	}

	var catalog []*TemplateSummaryDTO
	for _, templateId := range templateIds {
		manifest, err := uc.loadManifest(templateId)
		if err != nil || manifest == nil {
			continue
		}
		catalog = append(catalog, manifest)
	}

	return catalog, nil
}

func (uc *GetAllTemplatesUseCase) getTemplateIds() ([]string, error) {
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

func (uc *GetAllTemplatesUseCase) loadManifest(templateId string) (*TemplateSummaryDTO, error) {
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

func (uc *GetAllTemplatesUseCase) normalizeManifest(input map[string]interface{}, templateId string) *TemplateSummaryDTO {
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

	// Handle status
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

	// Handle themes
	if themes, ok := input["themes"].([]interface{}); ok {
		manifest.Themes = make([]interface{}, len(themes))
		copy(manifest.Themes, themes)
	}

	return manifest
}
