package publishinfra

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
)

// FilesystemArtifactStorage stores published artifacts on local disk.
// This is a development-friendly implementation that can be swapped for S3/R2 later.
type FilesystemArtifactStorage struct {
	rootDir    string
	publicBase string // e.g. http://localhost:3000
}

func NewFilesystemArtifactStorage() (*FilesystemArtifactStorage, error) {
	root := os.Getenv("PUBLISHED_ARTIFACTS_DIR")
	if root == "" {
		root = "./published"
	}
	if err := os.MkdirAll(root, 0755); err != nil {
		return nil, err
	}
	publicBase := os.Getenv("PUBLISHED_ARTIFACTS_PUBLIC_BASE")
	if publicBase == "" {
		publicBase = ""
	}
	return &FilesystemArtifactStorage{rootDir: root, publicBase: publicBase}, nil
}

func (s *FilesystemArtifactStorage) Put(ctx context.Context, key string, contentType string, cacheControl string, body []byte) error {
	// contentType/cacheControl are ignored for filesystem implementation; the HTTP layer will set headers.
	if err := validateArtifactKey(key); err != nil {
		return err
	}
	full := filepath.Join(s.rootDir, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(full), 0755); err != nil {
		return err
	}
	return os.WriteFile(full, body, 0644)
}

func (s *FilesystemArtifactStorage) PublicURL(key string) string {
	// Served by API under /published/<key>
	if s.publicBase == "" {
		return "/published/" + key
	}
	return fmt.Sprintf("%s/published/%s", s.publicBase, key)
}

// ListVersions lists all version numbers for a given subdomain.
// It scans the filesystem for directories matching "sites/{subdomain}/v{version}/" and extracts version numbers.
func (s *FilesystemArtifactStorage) ListVersions(ctx context.Context, subdomain string) ([]int, error) {
	// Validate subdomain to prevent path injection
	if err := validateSubdomain(subdomain); err != nil {
		return nil, fmt.Errorf("invalid subdomain: %w", err)
	}
	subdomainPath := filepath.Join(s.rootDir, "sites", subdomain)
	versionMap := make(map[int]bool)

	// Check if subdomain directory exists
	if _, err := os.Stat(subdomainPath); os.IsNotExist(err) {
		return []int{}, nil // No versions found
	}

	// Read directory entries
	entries, err := os.ReadDir(subdomainPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read subdomain directory: %w", err)
	}

	// Regex to extract version number from directory name like "v123"
	versionRegex := regexp.MustCompile(`^v(\d+)$`)

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		matches := versionRegex.FindStringSubmatch(entry.Name())
		if len(matches) >= 2 {
			if version, err := strconv.Atoi(matches[1]); err == nil {
				versionMap[version] = true
			}
		}
	}

	// Convert map to sorted slice
	versions := make([]int, 0, len(versionMap))
	for v := range versionMap {
		versions = append(versions, v)
	}
	sort.Sort(sort.Reverse(sort.IntSlice(versions))) // Sort descending

	return versions, nil
}

// DeleteVersion deletes all artifacts for a specific version of a subdomain.
// It removes the entire version directory "sites/{subdomain}/v{version}/".
func (s *FilesystemArtifactStorage) DeleteVersion(ctx context.Context, subdomain string, version int) error {
	// Validate subdomain to prevent path injection
	if err := validateSubdomain(subdomain); err != nil {
		return fmt.Errorf("invalid subdomain: %w", err)
	}
	versionPath := filepath.Join(s.rootDir, "sites", subdomain, fmt.Sprintf("v%d", version))

	// Check if version directory exists
	if _, err := os.Stat(versionPath); os.IsNotExist(err) {
		return nil // Nothing to delete
	}

	// Remove the entire version directory and all its contents
	if err := os.RemoveAll(versionPath); err != nil {
		return fmt.Errorf("failed to delete version directory: %w", err)
	}

	return nil
}
