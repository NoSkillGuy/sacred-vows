package layout

import (
	"encoding/json"
	"strings"

	"github.com/sacred-vows/api-go/internal/domain"
)

// normalizeImagePath converts /templates/ paths to /layouts/ paths
// This ensures backward compatibility with old data while using new paths
func normalizeImagePath(path string) string {
	if path == "" {
		return path
	}
	return strings.ReplaceAll(path, "/templates/", "/layouts/")
}

// ToLayoutSummaryDTO converts a domain.Layout to LayoutSummaryDTO
// by parsing the manifest JSON and extracting relevant fields
func ToLayoutSummaryDTO(layout *domain.Layout) (*LayoutSummaryDTO, error) {
	dto := &LayoutSummaryDTO{
		ID:   layout.ID,
		Name: layout.Name,
	}

	// Set basic fields from domain
	if layout.Description != nil {
		dto.Description = layout.Description
	}
	if layout.PreviewImage != nil {
		normalizedPath := normalizeImagePath(*layout.PreviewImage)
		dto.PreviewImage = &normalizedPath
	}
	if len(layout.Tags) > 0 {
		dto.Tags = layout.Tags
		// Limit to 3 tags
		if len(dto.Tags) > 3 {
			dto.Tags = dto.Tags[:3]
		}
	}
	if layout.Version != "" {
		dto.Version = &layout.Version
	}

	// Parse manifest JSON if available
	if layout.Manifest != nil {
		var manifest map[string]interface{}
		if err := json.Unmarshal(*layout.Manifest, &manifest); err != nil {
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
				normalizedPath := normalizeImagePath(preview)
				dto.PreviewImage = &normalizedPath
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

// ToManifestMap converts a domain.Layout's manifest to a map[string]interface{}
func ToManifestMap(layout *domain.Layout) (map[string]interface{}, error) {
	if layout.Manifest == nil {
		return nil, nil
	}

	var manifest map[string]interface{}
	if err := json.Unmarshal(*layout.Manifest, &manifest); err != nil {
		return nil, err
	}

	// Normalize the manifest using the same logic as ToLayoutSummaryDTO
	// but return the full map structure
	normalized := make(map[string]interface{})

	// Copy all fields from manifest
	for k, v := range manifest {
		normalized[k] = v
	}

	// Normalize image paths in the manifest
	if previewImage, ok := normalized["previewImage"].(string); ok {
		normalized["previewImage"] = normalizeImagePath(previewImage)
	}

	// Normalize paths in metadata if present
	if metadata, ok := normalized["metadata"].(map[string]interface{}); ok {
		if previewImage, ok := metadata["previewImage"].(string); ok {
			metadata["previewImage"] = normalizeImagePath(previewImage)
		}
		normalized["metadata"] = metadata
	}

	// Normalize previewImages array if present
	if previewImages, ok := normalized["previewImages"].([]interface{}); ok {
		normalizedPreviewImages := make([]interface{}, len(previewImages))
		for i, img := range previewImages {
			if imgStr, ok := img.(string); ok {
				normalizedPreviewImages[i] = normalizeImagePath(imgStr)
			} else {
				normalizedPreviewImages[i] = img
			}
		}
		normalized["previewImages"] = normalizedPreviewImages
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


