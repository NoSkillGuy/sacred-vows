package publishinfra

import (
	"context"
	"errors"

	"github.com/sacred-vows/api-go/internal/usecase/publish"
)

type NoopSnapshotGenerator struct{}

func (g *NoopSnapshotGenerator) GenerateBundle(ctx context.Context, invitationID string) (*publish.SnapshotBundle, error) {
	return nil, errors.New("snapshot generator not configured")
}

type NoopArtifactStorage struct{}

func (s *NoopArtifactStorage) Put(ctx context.Context, key string, contentType string, cacheControl string, body []byte) error {
	return errors.New("artifact storage not configured")
}

func (s *NoopArtifactStorage) PublicURL(key string) string {
	return ""
}

func (s *NoopArtifactStorage) ListVersions(ctx context.Context, subdomain string) ([]int, error) {
	return nil, errors.New("artifact storage not configured")
}

func (s *NoopArtifactStorage) DeleteVersion(ctx context.Context, subdomain string, version int) error {
	return errors.New("artifact storage not configured")
}


