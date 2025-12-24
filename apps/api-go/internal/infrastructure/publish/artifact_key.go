package publishinfra

import (
	"fmt"
	"path"
	"strings"
)

// validateArtifactKey prevents directory traversal and absolute paths.
// Keys are expected to be slash-separated (e.g. "sites/foo/v1/index.html").
func validateArtifactKey(key string) error {
	if key == "" {
		return fmt.Errorf("artifact key is empty")
	}
	if strings.HasPrefix(key, "/") {
		return fmt.Errorf("artifact key must be relative")
	}

	clean := path.Clean(key)
	// path.Clean can collapse to "." for empty-ish inputs; also reject anything that escapes root.
	if clean == "." || clean == ".." || strings.HasPrefix(clean, "../") {
		return fmt.Errorf("artifact key is invalid")
	}
	// Ensure we didn't normalize away segments (e.g. "a/../b").
	// This is a conservative check; callers can store clean keys only.
	if clean != key {
		return fmt.Errorf("artifact key must be normalized")
	}
	return nil
}
