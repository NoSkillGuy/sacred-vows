package publishinfra

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
)

// FilesystemArtifactStorage stores published artifacts on local disk.
// This is a development-friendly implementation that can be swapped for S3/R2 later.
type FilesystemArtifactStorage struct {
	rootDir   string
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


