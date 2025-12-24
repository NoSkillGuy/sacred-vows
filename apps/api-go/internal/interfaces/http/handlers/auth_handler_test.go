package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// Note: Handler tests focus on HTTP behavior using httptest.Server
// For comprehensive testing, use integration tests with real dependencies

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
