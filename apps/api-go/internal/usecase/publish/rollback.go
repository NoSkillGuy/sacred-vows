package publish

import (
	"context"
	"fmt"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type RollbackPublishedSiteUseCase struct {
	publishedRepo repository.PublishedSiteRepository
	artifactStore ArtifactStorage
}

func NewRollbackPublishedSiteUseCase(
	publishedRepo repository.PublishedSiteRepository,
	artifactStore ArtifactStorage,
) *RollbackPublishedSiteUseCase {
	return &RollbackPublishedSiteUseCase{
		publishedRepo: publishedRepo,
		artifactStore: artifactStore,
	}
}

// Execute rolls back a published site to a previous version.
// It validates that:
// - The user owns the site
// - The target version exists
// - The target version is not the current version
func (uc *RollbackPublishedSiteUseCase) Execute(ctx context.Context, subdomain string, targetVersion int, ownerUserID string) error {
	// Find the published site
	site, err := uc.publishedRepo.FindBySubdomain(ctx, subdomain)
	if err != nil {
		return fmt.Errorf("failed to find published site: %w", err)
	}
	if site == nil {
		return fmt.Errorf("published site not found")
	}

	// Validate ownership
	if site.OwnerUserID != ownerUserID {
		return fmt.Errorf("forbidden: user does not own this site")
	}

	// Validate that target version is not the current version
	if site.CurrentVersion == targetVersion {
		return fmt.Errorf("target version is already the current version")
	}

	// Validate that target version exists in storage
	versions, err := uc.artifactStore.ListVersions(ctx, subdomain)
	if err != nil {
		return fmt.Errorf("failed to list versions: %w", err)
	}

	versionExists := false
	for _, v := range versions {
		if v == targetVersion {
			versionExists = true
			break
		}
	}

	if !versionExists {
		return fmt.Errorf("target version %d does not exist", targetVersion)
	}

	// Update current version pointer
	site.CurrentVersion = targetVersion
	if err := uc.publishedRepo.Update(ctx, site); err != nil {
		return fmt.Errorf("failed to update published site: %w", err)
	}

	return nil
}
