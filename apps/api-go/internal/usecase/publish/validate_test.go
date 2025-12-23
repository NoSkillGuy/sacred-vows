package publish

import (
	"context"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// mockPublishedSiteRepository is a mock implementation of PublishedSiteRepository
type mockPublishedSiteRepository struct {
	mock.Mock
}

func (m *mockPublishedSiteRepository) FindBySubdomain(ctx context.Context, subdomain string) (*domain.PublishedSite, error) {
	args := m.Called(ctx, subdomain)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PublishedSite), args.Error(1)
}

func (m *mockPublishedSiteRepository) FindByInvitationID(ctx context.Context, invitationID string) (*domain.PublishedSite, error) {
	args := m.Called(ctx, invitationID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PublishedSite), args.Error(1)
}

func (m *mockPublishedSiteRepository) Create(ctx context.Context, site *domain.PublishedSite) error {
	args := m.Called(ctx, site)
	return args.Error(0)
}

func (m *mockPublishedSiteRepository) Update(ctx context.Context, site *domain.PublishedSite) error {
	args := m.Called(ctx, site)
	return args.Error(0)
}

func TestValidateSubdomainUseCase_Execute_ValidAvailableSubdomain_ReturnsAvailable(t *testing.T) {
	// Arrange
	subdomain := "my-wedding"

	mockRepo := new(mockPublishedSiteRepository)
	mockRepo.On("FindBySubdomain", mock.Anything, subdomain).Return(nil, nil)

	useCase := NewValidateSubdomainUseCase(mockRepo)

	// Act
	normalized, available, reason, err := useCase.Execute(context.Background(), subdomain)

	// Assert
	require.NoError(t, err, "Valid available subdomain should not return error")
	assert.Equal(t, subdomain, normalized, "Normalized subdomain should match")
	assert.True(t, available, "Subdomain should be available")
	assert.Empty(t, reason, "Reason should be empty for available subdomain")
	mockRepo.AssertExpectations(t)
}

func TestValidateSubdomainUseCase_Execute_ReservedSubdomain_ReturnsNotAvailable(t *testing.T) {
	// Arrange
	subdomain := "www"

	mockRepo := new(mockPublishedSiteRepository)

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

	mockRepo := new(mockPublishedSiteRepository)
	mockRepo.On("FindBySubdomain", mock.Anything, subdomain).Return(existingSite, nil)

	useCase := NewValidateSubdomainUseCase(mockRepo)

	// Act
	normalized, available, reason, err := useCase.Execute(context.Background(), subdomain)

	// Assert
	require.Error(t, err, "Taken subdomain should return error")
	assert.Equal(t, subdomain, normalized, "Normalized subdomain should match")
	assert.False(t, available, "Subdomain should not be available")
	assert.Equal(t, "taken", reason, "Reason should be 'taken'")
	mockRepo.AssertExpectations(t)
}

