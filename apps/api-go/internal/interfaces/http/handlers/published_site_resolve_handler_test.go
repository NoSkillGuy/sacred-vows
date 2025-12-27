package handlers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockPublishedSiteRepository is a mock implementation of PublishedSiteRepository
type MockPublishedSiteRepository struct {
	mock.Mock
}

func (m *MockPublishedSiteRepository) FindBySubdomain(ctx context.Context, subdomain string) (*domain.PublishedSite, error) {
	args := m.Called(ctx, subdomain)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PublishedSite), args.Error(1)
}

func (m *MockPublishedSiteRepository) Create(ctx context.Context, site *domain.PublishedSite) error {
	args := m.Called(ctx, site)
	return args.Error(0)
}

func (m *MockPublishedSiteRepository) Update(ctx context.Context, site *domain.PublishedSite) error {
	args := m.Called(ctx, site)
	return args.Error(0)
}

func (m *MockPublishedSiteRepository) FindByID(ctx context.Context, id string) (*domain.PublishedSite, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PublishedSite), args.Error(1)
}

func (m *MockPublishedSiteRepository) ListVersions(ctx context.Context, subdomain string) ([]*domain.PublishedSite, error) {
	args := m.Called(ctx, subdomain)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.PublishedSite), args.Error(1)
}

func (m *MockPublishedSiteRepository) FindByInvitationID(ctx context.Context, invitationID string) (*domain.PublishedSite, error) {
	args := m.Called(ctx, invitationID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PublishedSite), args.Error(1)
}

func TestPublishedSiteResolveHandler_R2StorageRedirect(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name          string
		r2PublicBase  string
		artifactStore string
		subdomain     string
		site          *domain.PublishedSite
		wantCode      int
		wantLocation  string
	}{
		{
			name:          "redirects to R2 when artifactStore is r2 and r2PublicBase is set",
			r2PublicBase:  "http://localhost:9000/sacred-vows-published-local",
			artifactStore: "r2",
			subdomain:     "test",
			site: &domain.PublishedSite{
				Subdomain:      "test",
				Published:      true,
				CurrentVersion: 1,
			},
			wantCode:     http.StatusFound,
			wantLocation: "http://localhost:9000/sacred-vows-published-local/sites/test/v1/index.html",
		},
		{
			name:          "redirects to filesystem when artifactStore is not r2",
			r2PublicBase:  "http://localhost:9000/sacred-vows-published-local",
			artifactStore: "filesystem",
			subdomain:     "test",
			site: &domain.PublishedSite{
				Subdomain:      "test",
				Published:      true,
				CurrentVersion: 1,
			},
			wantCode:     http.StatusFound,
			wantLocation: "/published/sites/test/v1/index.html",
		},
		{
			name:          "redirects to filesystem when r2PublicBase is empty",
			r2PublicBase:  "",
			artifactStore: "r2",
			subdomain:     "test",
			site: &domain.PublishedSite{
				Subdomain:      "test",
				Published:      true,
				CurrentVersion: 1,
			},
			wantCode:     http.StatusFound,
			wantLocation: "/published/sites/test/v1/index.html",
		},
		{
			name:          "redirects to filesystem when artifactStore is empty",
			r2PublicBase:  "http://localhost:9000/sacred-vows-published-local",
			artifactStore: "",
			subdomain:     "test",
			site: &domain.PublishedSite{
				Subdomain:      "test",
				Published:      true,
				CurrentVersion: 1,
			},
			wantCode:     http.StatusFound,
			wantLocation: "/published/sites/test/v1/index.html",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockPublishedSiteRepository)
			handler := NewPublishedSiteResolveHandler(
				mockRepo,
				"localhost",
				tt.r2PublicBase,
				tt.artifactStore,
			)

			// Setup mock expectations
			mockRepo.On("FindBySubdomain", mock.Anything, tt.subdomain).Return(tt.site, nil)

			// Create test request
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			req.Host = tt.subdomain + ".localhost"
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request = req

			// Execute handler
			handler.Handle(c)

			// Assertions
			assert.Equal(t, tt.wantCode, w.Code, "HTTP status code incorrect")
			if tt.wantLocation != "" {
				assert.Equal(t, tt.wantLocation, w.Header().Get("Location"), "Redirect location incorrect")
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestPublishedSiteResolveHandler_EdgeCases(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name          string
		r2PublicBase  string
		artifactStore string
		subdomain     string
		site          *domain.PublishedSite
		siteError     error
		wantCode      int
	}{
		{
			name:          "returns 404 when site not found",
			r2PublicBase:  "http://localhost:9000/sacred-vows-published-local",
			artifactStore: "r2",
			subdomain:     "nonexistent",
			site:          nil,
			siteError:     nil, // Repository returns nil, nil for not found
			wantCode:      http.StatusNotFound,
		},
		{
			name:          "returns 404 when site not published",
			r2PublicBase:  "http://localhost:9000/sacred-vows-published-local",
			artifactStore: "r2",
			subdomain:     "test",
			site: &domain.PublishedSite{
				Subdomain:      "test",
				Published:      false,
				CurrentVersion: 1,
			},
			wantCode: http.StatusNotFound,
		},
		{
			name:          "returns 404 when current version is 0",
			r2PublicBase:  "http://localhost:9000/sacred-vows-published-local",
			artifactStore: "r2",
			subdomain:     "test",
			site: &domain.PublishedSite{
				Subdomain:      "test",
				Published:      true,
				CurrentVersion: 0,
			},
			wantCode: http.StatusNotFound,
		},
		{
			name:          "handles version 2 correctly",
			r2PublicBase:  "http://localhost:9000/sacred-vows-published-local",
			artifactStore: "r2",
			subdomain:     "test",
			site: &domain.PublishedSite{
				Subdomain:      "test",
				Published:      true,
				CurrentVersion: 2,
			},
			wantCode: http.StatusFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockPublishedSiteRepository)
			handler := NewPublishedSiteResolveHandler(
				mockRepo,
				"localhost",
				tt.r2PublicBase,
				tt.artifactStore,
			)

			// Setup mock expectations
			if tt.siteError != nil {
				mockRepo.On("FindBySubdomain", mock.Anything, tt.subdomain).Return(nil, tt.siteError)
			} else {
				mockRepo.On("FindBySubdomain", mock.Anything, tt.subdomain).Return(tt.site, nil)
			}

			// Create test request
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			req.Host = tt.subdomain + ".localhost"
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request = req

			// Execute handler
			handler.Handle(c)

			// Assertions
			assert.Equal(t, tt.wantCode, w.Code, "HTTP status code incorrect")

			mockRepo.AssertExpectations(t)
		})
	}
}
