package publish

import (
	"context"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type ValidateSubdomainUseCase struct {
	publishedRepo repository.PublishedSiteRepository
}

func NewValidateSubdomainUseCase(publishedRepo repository.PublishedSiteRepository) *ValidateSubdomainUseCase {
	return &ValidateSubdomainUseCase{publishedRepo: publishedRepo}
}

func (uc *ValidateSubdomainUseCase) Execute(ctx context.Context, rawSubdomain string) (normalized string, available bool, reason string, err error) {
	normalized, err = NormalizeSubdomain(rawSubdomain)
	if err != nil {
		return "", false, "invalid", err
	}
	if IsReservedSubdomain(normalized) {
		return normalized, false, "reserved", domain.ErrInvalidSubdomain
	}
	existing, err := uc.publishedRepo.FindBySubdomain(ctx, normalized)
	if err != nil {
		return normalized, false, "error", err
	}
	if existing != nil {
		return normalized, false, "taken", domain.ErrSubdomainTaken
	}
	return normalized, true, "", nil
}


