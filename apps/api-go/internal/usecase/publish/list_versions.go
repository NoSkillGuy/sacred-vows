package publish

import (
	"context"
	"fmt"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type ListPublishedVersionsUseCase struct {
	publishedRepo repository.PublishedSiteRepository
	artifactStore ArtifactStorage
}

func NewListPublishedVersionsUseCase(
	publishedRepo repository.PublishedSiteRepository,
	artifactStore ArtifactStorage,
) *ListPublishedVersionsUseCase {
	return &ListPublishedVersionsUseCase{
		publishedRepo: publishedRepo,
		artifactStore: artifactStore,
	}
}

// VersionInfo represents information about a published version
type VersionInfo struct {
	Version      int  `json:"version"`
	IsCurrent    bool `json:"isCurrent"`
}

// Execute lists all available versions for a published site.
// It validates that the user owns the site and returns version information.
func (uc *ListPublishedVersionsUseCase) Execute(ctx context.Context, subdomain string, ownerUserID string) ([]VersionInfo, error) {
	// Find the published site
	site, err := uc.publishedRepo.FindBySubdomain(ctx, subdomain)
	if err != nil {
		return nil, fmt.Errorf("failed to find published site: %w", err)
	}
	if site == nil {
		return nil, fmt.Errorf("published site not found")
	}

	// Validate ownership
	if site.OwnerUserID != ownerUserID {
		return nil, fmt.Errorf("forbidden: user does not own this site")
	}

	// List all versions from storage
	versions, err := uc.artifactStore.ListVersions(ctx, subdomain)
	if err != nil {
		return nil, fmt.Errorf("failed to list versions: %w", err)
	}

	// Convert to VersionInfo with current version flag
	versionInfos := make([]VersionInfo, 0, len(versions))
	for _, version := range versions {
		versionInfos = append(versionInfos, VersionInfo{
			Version:   version,
			IsCurrent: version == site.CurrentVersion,
		})
	}

	return versionInfos, nil
}



