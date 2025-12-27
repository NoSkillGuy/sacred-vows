package publishinfra

import (
	"fmt"
	"path"
	"regexp"
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

// validateSubdomain prevents path injection and ensures subdomain is safe for filesystem operations.
// Subdomains must be alphanumeric with hyphens, cannot start/end with hyphen, and have reasonable length.
// This prevents directory traversal attacks (e.g., "../", "..", "/", "\").
func validateSubdomain(subdomain string) error {
	if subdomain == "" {
		return fmt.Errorf("subdomain is empty")
	}

	// Check length (DNS subdomain max is 63 chars, but we'll be more conservative)
	if len(subdomain) > 63 {
		return fmt.Errorf("subdomain is too long (max 63 characters)")
	}
	if len(subdomain) < 1 {
		return fmt.Errorf("subdomain is too short")
	}

	// Reject path traversal sequences explicitly
	if strings.Contains(subdomain, "..") {
		return fmt.Errorf("subdomain contains path traversal sequence")
	}
	if strings.Contains(subdomain, "/") {
		return fmt.Errorf("subdomain contains path separator")
	}
	if strings.Contains(subdomain, "\\") {
		return fmt.Errorf("subdomain contains path separator")
	}
	if strings.Contains(subdomain, ".") {
		return fmt.Errorf("subdomain contains invalid character")
	}

	// Must be alphanumeric with hyphens only
	// Cannot start or end with hyphen
	// Must match DNS subdomain rules: [a-z0-9]([a-z0-9-]*[a-z0-9])?
	subdomainRegex := regexp.MustCompile(`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`)
	if !subdomainRegex.MatchString(strings.ToLower(subdomain)) {
		return fmt.Errorf("subdomain contains invalid characters (must be alphanumeric with hyphens, cannot start/end with hyphen)")
	}

	return nil
}
