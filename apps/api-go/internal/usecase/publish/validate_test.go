package publish

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestValidateSubdomainUseCase_Execute_ValidAvailableSubdomain_ReturnsAvailable(t *testing.T) {
	// Arrange
	subdomain := "my-wedding"

	mockRepo := &MockPublishedSiteRepository{
		FindBySubdomainFn: func(ctx context.Context, sub string) (*domain.PublishedSite, error) {
			return nil, nil
		},
	}

	useCase := NewValidateSubdomainUseCase(mockRepo)

	// Act
	normalized, available, reason, err := useCase.Execute(context.Background(), subdomain)

	// Assert
	require.NoError(t, err, "Valid available subdomain should not return error")
	assert.Equal(t, subdomain, normalized, "Normalized subdomain should match")
	assert.True(t, available, "Subdomain should be available")
	assert.Empty(t, reason, "Reason should be empty for available subdomain")
}

func TestValidateSubdomainUseCase_Execute_ReservedSubdomain_ReturnsNotAvailable(t *testing.T) {
	// Arrange
	subdomain := "www"

	mockRepo := &MockPublishedSiteRepository{}

	useCase := NewValidateSubdomainUseCase(mockRepo)

	// Act
	normalized, available, reason, err := useCase.Execute(context.Background(), subdomain)

	// Assert
	require.Error(t, err, "Reserved subdomain should return error")
	assert.Equal(t, subdomain, normalized, "Normalized subdomain should match")
	assert.False(t, available, "Subdomain should not be available")
	assert.Equal(t, "reserved", reason, "Reason should be 'reserved'")
}

func TestValidateSubdomainUseCase_Execute_TakenSubdomain_ReturnsNotAvailable(t *testing.T) {
	// Arrange
	subdomain := "taken-subdomain"
	existingSite := &domain.PublishedSite{
		Subdomain: subdomain,
	}

	mockRepo := &MockPublishedSiteRepository{
		FindBySubdomainFn: func(ctx context.Context, sub string) (*domain.PublishedSite, error) {
			if sub == subdomain {
				return existingSite, nil
			}
			return nil, nil
		},
	}

	useCase := NewValidateSubdomainUseCase(mockRepo)

	// Act
	normalized, available, reason, err := useCase.Execute(context.Background(), subdomain)

	// Assert
	require.Error(t, err, "Taken subdomain should return error")
	assert.Equal(t, subdomain, normalized, "Normalized subdomain should match")
	assert.False(t, available, "Subdomain should not be available")
	assert.Equal(t, "taken", reason, "Reason should be 'taken'")
}

