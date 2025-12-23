package layout

// LayoutSummaryDTO represents a layout summary data transfer object
type LayoutSummaryDTO struct {
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Description  *string       `json:"description,omitempty"`
	PreviewImage *string       `json:"previewImage,omitempty"`
	Tags         []string      `json:"tags,omitempty"`
	Category     *string       `json:"category,omitempty"`
	Version      *string       `json:"version,omitempty"`
	Status       *string       `json:"status,omitempty"`
	IsAvailable  *bool         `json:"isAvailable,omitempty"`
	IsComingSoon *bool         `json:"isComingSoon,omitempty"`
	IsFeatured   *bool         `json:"isFeatured,omitempty"`
	Themes       []interface{} `json:"themes,omitempty"`
}





