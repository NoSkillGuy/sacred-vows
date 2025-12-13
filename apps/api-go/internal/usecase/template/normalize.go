package template

import (
	"encoding/json"

	"github.com/sacred-vows/api-go/internal/domain"
)

// ToTemplateSummaryDTO converts a domain.Template to TemplateSummaryDTO
// by parsing the manifest JSON and extracting relevant fields
func ToTemplateSummaryDTO(template *domain.Template) (*TemplateSummaryDTO, error) {
	dto := &TemplateSummaryDTO{
		ID:   template.ID,
		Name: template.Name,
	}

	// Set basic fields from domain
	if template.Description != nil {
		dto.Description = template.Description
	}
	if template.PreviewImage != nil {
		dto.PreviewImage = template.PreviewImage
	}
	if len(template.Tags) > 0 {
		dto.Tags = template.Tags
		// Limit to 3 tags
		if len(dto.Tags) > 3 {
			dto.Tags = dto.Tags[:3]
		}
	}
	if template.Version != "" {
		dto.Version = &template.Version
	}

	// Parse manifest JSON if available
	if template.Manifest != nil {
		var manifest map[string]interface{}
		if err := json.Unmarshal(*template.Manifest, &manifest); err != nil {
			return nil, err
		}

		// Override ID and Name from manifest if present
		if id, ok := manifest["id"].(string); ok && id != "" {
			dto.ID = id
		}
		if name, ok := manifest["name"].(string); ok && name != "" {
			dto.Name = name
		}

		// Extract description from manifest if not already set
		if dto.Description == nil {
			if desc, ok := manifest["description"].(string); ok {
				dto.Description = &desc
			}
		}

		// Extract previewImage from manifest if not already set
		if dto.PreviewImage == nil {
			if preview, ok := manifest["previewImage"].(string); ok {
				dto.PreviewImage = &preview
			}
		}

		// Extract tags from manifest if not already set
		if len(dto.Tags) == 0 {
			if tags, ok := manifest["tags"].([]interface{}); ok {
				dto.Tags = make([]string, 0, len(tags))
				for i, tag := range tags {
					if i >= 3 {
						break
					}
					if tagStr, ok := tag.(string); ok {
						dto.Tags = append(dto.Tags, tagStr)
					}
				}
			}
		}

		// Extract category
		if category, ok := manifest["category"].(string); ok {
			dto.Category = &category
		}

		// Extract version from manifest if not already set
		if dto.Version == nil {
			if version, ok := manifest["version"].(string); ok {
				dto.Version = &version
			}
		}

		// Handle status
		if status, ok := manifest["status"].(string); ok {
			dto.Status = &status
		} else if isAvailable, ok := manifest["isAvailable"].(bool); ok && isAvailable {
			status := "ready"
			dto.Status = &status
		} else if isComingSoon, ok := manifest["isComingSoon"].(bool); ok && isComingSoon {
			status := "coming-soon"
			dto.Status = &status
		} else {
			status := "hidden"
			dto.Status = &status
		}

		// Set IsAvailable and IsComingSoon based on status
		if dto.Status != nil {
			isAvailable := *dto.Status == "ready"
			isComingSoon := *dto.Status == "coming-soon"
			dto.IsAvailable = &isAvailable
			dto.IsComingSoon = &isComingSoon
		}

		// Extract isFeatured
		if isFeatured, ok := manifest["isFeatured"].(bool); ok {
			dto.IsFeatured = &isFeatured
		}

		// Extract themes
		if themes, ok := manifest["themes"].([]interface{}); ok {
			dto.Themes = make([]interface{}, len(themes))
			copy(dto.Themes, themes)
		}
	}

	return dto, nil
}

// ToManifestMap converts a domain.Template's manifest to a map[string]interface{}
func ToManifestMap(template *domain.Template) (map[string]interface{}, error) {
	if template.Manifest == nil {
		return nil, nil
	}

	var manifest map[string]interface{}
	if err := json.Unmarshal(*template.Manifest, &manifest); err != nil {
		return nil, err
	}

	// Normalize the manifest using the same logic as ToTemplateSummaryDTO
	// but return the full map structure
	normalized := make(map[string]interface{})

	// Copy all fields from manifest
	for k, v := range manifest {
		normalized[k] = v
	}

	// Ensure status is set
	if _, ok := normalized["status"]; !ok {
		if isAvailable, ok := manifest["isAvailable"].(bool); ok && isAvailable {
			normalized["status"] = "ready"
		} else if isComingSoon, ok := manifest["isComingSoon"].(bool); ok && isComingSoon {
			normalized["status"] = "coming-soon"
		} else {
			normalized["status"] = "hidden"
		}
	}

	// Set isAvailable and isComingSoon based on status
	if status, ok := normalized["status"].(string); ok {
		normalized["isAvailable"] = status == "ready"
		normalized["isComingSoon"] = status == "coming-soon"
	}

	return normalized, nil
}
