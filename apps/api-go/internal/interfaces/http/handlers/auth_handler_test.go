package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Note: For handler tests, we'll use a simpler approach - test the handler directly with real use cases mocked at repository level
// This is more integration-style testing. For unit tests of handlers, we'd need to create interfaces for use cases.

// mockRefreshTokenRepository is a mock implementation of RefreshTokenRepository
type mockRefreshTokenRepository struct {
	mock.Mock
}

func (m *mockRefreshTokenRepository) Create(ctx context.Context, token *domain.RefreshToken) error {
	args := m.Called(ctx, token)
	return args.Error(0)
}

func (m *mockRefreshTokenRepository) FindByTokenFingerprint(ctx context.Context, fingerprint []byte) (*domain.RefreshToken, error) {
	args := m.Called(ctx, fingerprint)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.RefreshToken), args.Error(1)
}

func (m *mockRefreshTokenRepository) FindByID(ctx context.Context, id string) (*domain.RefreshToken, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.RefreshToken), args.Error(1)
}

func (m *mockRefreshTokenRepository) RevokeByUserID(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *mockRefreshTokenRepository) RevokeByID(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *mockRefreshTokenRepository) DeleteExpired(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

func TestAuthHandler_Register_InvalidRequest_ReturnsBadRequest(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	
	reqBody := RegisterRequest{
		Email:    "", // Missing email
		Password: "ValidPass123",
	}
	bodyBytes, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	
	// Create a minimal handler (we're just testing request validation)
	handler := &AuthHandler{}
	
	// Act
	handler.Register(c)
	
	// Assert
	assert.Equal(t, http.StatusBadRequest, w.Code, "Should return 400 status for invalid request")
}

func TestAuthHandler_Login_InvalidRequest_ReturnsBadRequest(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	
	reqBody := LoginRequest{
		Email:    "", // Missing email
		Password: "ValidPass123",
	}
	bodyBytes, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	
	handler := &AuthHandler{}
	
	// Act
	handler.Login(c)
	
	// Assert
	assert.Equal(t, http.StatusBadRequest, w.Code, "Should return 400 status for invalid request")
}

func TestAuthHandler_GetCurrentUser_NoUserID_ReturnsUnauthorized(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	
	req := httptest.NewRequest(http.MethodGet, "/auth/me", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	// Note: userID is not set in context (simulating missing auth)
	
	handler := &AuthHandler{}
	
	// Act
	handler.GetCurrentUser(c)
	
	// Assert
	assert.Equal(t, http.StatusUnauthorized, w.Code, "Should return 401 status when userID not in context")
}

