package publish

import "context"

// SnapshotGenerator generates a published snapshot (at minimum index.html bytes).
// Implementations may generate additional assets.
type SnapshotGenerator interface {
	GenerateBundle(ctx context.Context, invitationID string) (*SnapshotBundle, error)
}

type SnapshotBundle struct {
	IndexHTML []byte
	StylesCSS []byte
	Manifest  []byte
	// Assets are optional extra files: {KeySuffix:"assets/foo.png", ContentType:"image/png", Body:[]byte}
	Assets []SnapshotAsset
}

type SnapshotAsset struct {
	KeySuffix   string
	ContentType string
	Body        []byte
}

// ArtifactStorage stores published artifacts (index.html, assets).
type ArtifactStorage interface {
	// Put stores bytes at key (e.g. sites/<subdomain>/v<version>/index.html)
	Put(ctx context.Context, key string, contentType string, cacheControl string, body []byte) error
	// PublicURL returns a publicly reachable URL for key.
	PublicURL(key string) string
	// ListVersions returns all version numbers for a given subdomain
	ListVersions(ctx context.Context, subdomain string) ([]int, error)
	// DeleteVersion deletes all artifacts for a specific version of a subdomain
	DeleteVersion(ctx context.Context, subdomain string, version int) error
}
