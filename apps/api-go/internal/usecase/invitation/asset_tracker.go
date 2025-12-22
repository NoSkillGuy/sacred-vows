package invitation

import (
	"encoding/json"
	"regexp"
	"strings"
)

// extractAssetURLs extracts all asset URLs from invitation data
// Looks for URLs that match asset patterns (e.g., /uploads/, signed URLs, etc.)
func extractAssetURLs(data json.RawMessage) []string {
	if len(data) == 0 {
		return []string{}
	}

	var dataMap map[string]interface{}
	if err := json.Unmarshal(data, &dataMap); err != nil {
		return []string{}
	}

	urls := make(map[string]bool)
	extractURLsFromValue(dataMap, urls)

	// Convert map to slice
	result := make([]string, 0, len(urls))
	for url := range urls {
		if isAssetURL(url) {
			result = append(result, url)
		}
	}

	return result
}

// extractURLsFromValue recursively extracts URLs from any JSON value
func extractURLsFromValue(value interface{}, urls map[string]bool) {
	switch v := value.(type) {
	case string:
		if isAssetURL(v) {
			urls[v] = true
		}
	case map[string]interface{}:
		for _, val := range v {
			extractURLsFromValue(val, urls)
		}
	case []interface{}:
		for _, item := range v {
			extractURLsFromValue(item, urls)
		}
	}
}

// isAssetURL checks if a string is an asset URL
// Matches patterns like:
// - /uploads/...
// - https://storage.googleapis.com/... (signed URLs)
// - http://localhost:3000/api/assets/... (local dev)
func isAssetURL(url string) bool {
	if url == "" {
		return false
	}

	// Check for /uploads/ pattern (most common)
	if strings.HasPrefix(url, "/uploads/") {
		return true
	}

	// Check for signed URL patterns
	signedURLPattern := regexp.MustCompile(`^https?://.*storage\.googleapis\.com/.*\?.*X-Goog-Signature=`)
	if signedURLPattern.MatchString(url) {
		return true
	}

	// Check for local dev asset URLs
	if strings.Contains(url, "/api/assets/") || strings.Contains(url, "/assets/upload") {
		return true
	}

	return false
}

