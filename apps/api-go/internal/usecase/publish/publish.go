package publish

import (
	"context"
	"fmt"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/segmentio/ksuid"
)

type PublishInvitationUseCase struct {
	invitationRepo repository.InvitationRepository
	publishedRepo  repository.PublishedSiteRepository
	snapshotGen    SnapshotGenerator
	artifactStore  ArtifactStorage
}

func NewPublishInvitationUseCase(
	invitationRepo repository.InvitationRepository,
	publishedRepo repository.PublishedSiteRepository,
	snapshotGen SnapshotGenerator,
	artifactStore ArtifactStorage,
) *PublishInvitationUseCase {
	return &PublishInvitationUseCase{
		invitationRepo: invitationRepo,
		publishedRepo:  publishedRepo,
		snapshotGen:    snapshotGen,
		artifactStore:  artifactStore,
	}
}

func (uc *PublishInvitationUseCase) Execute(ctx context.Context, invitationID, ownerUserID, rawSubdomain string) (subdomain string, version int, indexURL string, err error) {
	subdomain, err = NormalizeSubdomain(rawSubdomain)
	if err != nil {
		return "", 0, "", err
	}
	if IsReservedSubdomain(subdomain) {
		return "", 0, "", domain.ErrInvalidSubdomain
	}

	inv, err := uc.invitationRepo.FindByID(ctx, invitationID)
	if err != nil {
		return "", 0, "", err
	}
	if inv == nil {
		return "", 0, "", fmt.Errorf("invitation not found")
	}
	if inv.UserID != ownerUserID {
		return "", 0, "", fmt.Errorf("forbidden")
	}

	// Ensure subdomain isn't owned by someone else.
	existingBySub, err := uc.publishedRepo.FindBySubdomain(ctx, subdomain)
	if err != nil {
		return "", 0, "", err
	}
	if existingBySub != nil && existingBySub.OwnerUserID != ownerUserID {
		return "", 0, "", domain.ErrSubdomainTaken
	}

	site, err := uc.publishedRepo.FindByInvitationID(ctx, invitationID)
	if err != nil {
		return "", 0, "", err
	}

	now := time.Now()
	if site == nil {
		site = &domain.PublishedSite{
			ID:             ksuid.New().String(),
			InvitationID:   invitationID,
			OwnerUserID:    ownerUserID,
			Subdomain:      subdomain,
			Published:      false,
			CurrentVersion: 0,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
		if err := uc.publishedRepo.Create(ctx, site); err != nil {
			return "", 0, "", err
		}
	} else {
		// Update subdomain if user wants to change it.
		site.Subdomain = subdomain
		site.UpdatedAt = now
		if err := uc.publishedRepo.Update(ctx, site); err != nil {
			return "", 0, "", err
		}
	}

	version = site.CurrentVersion + 1
	// Generate snapshot bundle first. If this fails, do not advance any published pointers.
	bundle, err := uc.snapshotGen.GenerateBundle(ctx, invitationID)
	if err != nil {
		return "", 0, "", err
	}

	prefix := fmt.Sprintf("sites/%s/v%d", subdomain, version)
	indexKey := prefix + "/index.html"
	if err := uc.artifactStore.Put(ctx, indexKey, "text/html; charset=utf-8", "public, max-age=60", bundle.IndexHTML); err != nil {
		return "", 0, "", err
	}

	manifestKey := prefix + "/manifest.json"
	if len(bundle.Manifest) > 0 {
		_ = uc.artifactStore.Put(ctx, manifestKey, "application/json; charset=utf-8", "public, max-age=31536000, immutable", bundle.Manifest)
	}

	cssKey := prefix + "/styles.css"
	if len(bundle.StylesCSS) > 0 {
		if err := uc.artifactStore.Put(ctx, cssKey, "text/css; charset=utf-8", "public, max-age=31536000, immutable", bundle.StylesCSS); err != nil {
			return "", 0, "", err
		}
	}

	jsKey := prefix + "/app.js"
	jsBody := []byte("// placeholder\n")
	// Optional placeholder (can be removed once layouts no longer reference app.js)
	if err := uc.artifactStore.Put(ctx, jsKey, "application/javascript; charset=utf-8", "public, max-age=31536000, immutable", jsBody); err != nil {
		return "", 0, "", err
	}

	for _, a := range bundle.Assets {
		if a.KeySuffix == "" || len(a.Body) == 0 {
			continue
		}
		key := prefix + "/" + a.KeySuffix
		cc := "public, max-age=31536000, immutable"
		ct := a.ContentType
		if ct == "" {
			ct = "application/octet-stream"
		}
		if err := uc.artifactStore.Put(ctx, key, ct, cc, a.Body); err != nil {
			return "", 0, "", err
		}
	}

	// Only after all uploads succeed, update pointer to new version.
	site.Published = true
	site.CurrentVersion = version
	site.PublishedAt = &now
	site.UpdatedAt = now
	if err := uc.publishedRepo.Update(ctx, site); err != nil {
		return "", 0, "", err
	}

	indexURL = uc.artifactStore.PublicURL(indexKey)
	return subdomain, version, indexURL, nil
}


