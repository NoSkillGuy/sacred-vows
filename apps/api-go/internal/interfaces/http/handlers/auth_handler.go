package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	authinfra "github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/infrastructure/database/postgres"
	authuc "github.com/sacred-vows/api-go/internal/usecase/auth"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type AuthHandler struct {
	registerUC        *authuc.RegisterUseCase
	loginUC           *authuc.LoginUseCase
	getCurrentUserUC  *authuc.GetCurrentUserUseCase
	googleOAuthUC     *authuc.GoogleOAuthUseCase
	refreshTokenUC    *authuc.RefreshTokenUseCase
	refreshTokenRepo  repository.RefreshTokenRepository
	jwtService        *authinfra.JWTService
	googleOAuth       *authinfra.GoogleOAuthService
}

func NewAuthHandler(
	registerUC *authuc.RegisterUseCase,
	loginUC *authuc.LoginUseCase,
	getCurrentUserUC *authuc.GetCurrentUserUseCase,
	googleOAuthUC *authuc.GoogleOAuthUseCase,
	refreshTokenUC *authuc.RefreshTokenUseCase,
	refreshTokenRepo repository.RefreshTokenRepository,
	jwtService *authinfra.JWTService,
	googleOAuth *authinfra.GoogleOAuthService,
) *AuthHandler {
	return &AuthHandler{
		registerUC:       registerUC,
		loginUC:          loginUC,
		getCurrentUserUC: getCurrentUserUC,
		googleOAuthUC:    googleOAuthUC,
		refreshTokenUC:   refreshTokenUC,
		refreshTokenRepo: refreshTokenRepo,
		jwtService:       jwtService,
		googleOAuth:      googleOAuth,
	}
}

type RegisterRequest struct {
	Email    string  `json:"email" binding:"required" example:"user@example.com"`
	Password string  `json:"password" binding:"required" example:"securePassword123"`
	Name     *string `json:"name" example:"John Doe"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required" example:"user@example.com"`
	Password string `json:"password" binding:"required" example:"securePassword123"`
}

type GoogleVerifyRequest struct {
	Credential string `json:"credential" binding:"required" example:"eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiJ9..."`
}

type AuthResponse struct {
	Token string   `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	User  *UserDTO `json:"user"`
}

type UserDTO struct {
	ID    string  `json:"id" example:"1234567890"`
	Email string  `json:"email" example:"user@example.com"`
	Name  *string `json:"name,omitempty" example:"John Doe"`
}

type UserResponse struct {
	User *UserDTO `json:"user"`
}

type ErrorResponse struct {
	Error string `json:"error" example:"Error message"`
}

// Register registers a new user
// @Summary      Register a new user
// @Description  Register a new user with email and password. Returns JWT token and user information.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      RegisterRequest  true  "Registration request"
// @Success      201      {object}  AuthResponse     "User registered successfully"
// @Failure      400      {object}  ErrorResponse    "Invalid request"
// @Failure      409      {object}  ErrorResponse    "User already exists"
// @Failure      500      {object}  ErrorResponse    "Internal server error"
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	output, err := h.registerUC.Execute(c.Request.Context(), authuc.RegisterInput{
		Email:    req.Email,
		Password: req.Password,
		Name:     req.Name,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}

	// Generate access token
	accessToken, err := h.jwtService.GenerateAccessToken(output.User.ID, output.User.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Generate and set refresh token in HttpOnly cookie
	if err := h.setRefreshTokenCookie(c, output.User.ID, output.User.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"accessToken": accessToken,
		"user":        output.User,
	})
}

// Login authenticates a user
// @Summary      User login
// @Description  Authenticate a user with email and password. Returns JWT token and user information.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      LoginRequest   true  "Login request"
// @Success      200      {object}  AuthResponse    "Login successful"
// @Failure      400      {object}  ErrorResponse  "Invalid request"
// @Failure      401      {object}  ErrorResponse  "Invalid credentials"
// @Failure      500      {object}  ErrorResponse  "Internal server error"
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	output, err := h.loginUC.Execute(c.Request.Context(), authuc.LoginInput{
		Email:    req.Email,
		Password: req.Password,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate access token
	accessToken, err := h.jwtService.GenerateAccessToken(output.User.ID, output.User.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Generate and set refresh token in HttpOnly cookie
	if err := h.setRefreshTokenCookie(c, output.User.ID, output.User.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
		"user":        output.User,
	})
}

// RefreshToken refreshes an access token using a refresh token
// @Summary      Refresh access token
// @Description  Uses a refresh token from HttpOnly cookie to generate a new access token and refresh token (rotated).
// @Tags         auth
// @Accept       json
// @Produce      json
// @Success      200      {object}  RefreshTokenResponse  "Token refreshed successfully"
// @Failure      401      {object}  ErrorResponse         "Invalid or expired refresh token"
// @Failure      500      {object}  ErrorResponse         "Internal server error"
// @Router       /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	// Read refresh token from HttpOnly cookie
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token not found"})
		return
	}

	output, err := h.refreshTokenUC.Execute(c.Request.Context(), authuc.RefreshTokenInput{
		RefreshToken: refreshToken,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to refresh token"})
		return
	}

	// Set new refresh token in HttpOnly Secure SameSite cookie
	refreshExpiration := int(h.jwtService.GetRefreshExpiration().Seconds())
	c.SetCookie(
		"refresh_token",
		output.RefreshToken,
		refreshExpiration,
		"/api/auth",
		"",
		true,  // Secure (HTTPS only)
		true,  // HttpOnly (not accessible via JavaScript)
	)

	c.JSON(http.StatusOK, gin.H{
		"accessToken": output.AccessToken,
	})
}

// Logout logs out a user by revoking their refresh token
// @Summary      User logout
// @Description  Revokes the refresh token and clears the refresh token cookie.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200      {object}  MessageResponse    "Logout successful"
// @Failure      401      {object}  ErrorResponse      "Authentication required"
// @Failure      500      {object}  ErrorResponse      "Internal server error"
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// Revoke all refresh tokens for this user
	if err := h.refreshTokenRepo.RevokeByUserID(c.Request.Context(), userID.(string)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to revoke refresh token"})
		return
	}

	// Clear refresh token cookie
	c.SetCookie(
		"refresh_token",
		"",
		-1, // Expire immediately
		"/api/auth",
		"",
		true,  // Secure (HTTPS only)
		true,  // HttpOnly (not accessible via JavaScript)
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}

// GetCurrentUser gets the current authenticated user
// @Summary      Get current user
// @Description  Get information about the currently authenticated user.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200      {object}  UserResponse    "User information"
// @Failure      401      {object}  ErrorResponse  "Authentication required"
// @Failure      404      {object}  ErrorResponse  "User not found"
// @Router       /auth/me [get]
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	output, err := h.getCurrentUserUC.Execute(c.Request.Context(), userID.(string))
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": output.User,
	})
}

// GoogleOAuth initiates Google OAuth flow
// @Summary      Initiate Google OAuth
// @Description  Redirects to Google OAuth consent screen to initiate authentication flow.
// @Tags         auth
// @Produce      json
// @Success      307  "Redirect to Google OAuth"
// @Router       /auth/google [get]
func (h *AuthHandler) GoogleOAuth(c *gin.Context) {
	authURL := h.googleOAuth.GetAuthURL()
	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// GoogleCallback handles Google OAuth callback
// @Summary      Google OAuth callback
// @Description  Handles the callback from Google OAuth and redirects to frontend with token.
// @Tags         auth
// @Produce      json
// @Param        code   query     string  true  "OAuth authorization code"
// @Success      307    "Redirect to frontend with token"
// @Failure      307    "Redirect to frontend with error"
// @Router       /auth/google/callback [get]
func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	frontendURL := h.googleOAuth.GetFrontendURL()
	if code == "" {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/login?error=no_code")
		return
	}

	output, err := h.googleOAuthUC.Execute(c.Request.Context(), authuc.GoogleOAuthInput{Code: code})
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/login?error=oauth_failed")
		return
	}

	// Generate access token
	token, err := h.jwtService.GenerateAccessToken(output.User.ID, output.User.Email)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/login?error=token_failed")
		return
	}

	c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/builder?token="+token)
}

// GoogleVerify verifies Google ID token
// @Summary      Verify Google ID token
// @Description  Verifies a Google ID token from frontend Sign-In button and returns JWT token.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      GoogleVerifyRequest  true  "Google credential token"
// @Success      200      {object}  AuthResponse          "Verification successful"
// @Failure      400      {object}  ErrorResponse        "Invalid request"
// @Failure      401      {object}  ErrorResponse        "Invalid Google credential"
// @Failure      500      {object}  ErrorResponse        "Internal server error"
// @Router       /auth/google/verify [post]
func (h *AuthHandler) GoogleVerify(c *gin.Context) {
	var req GoogleVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Google credential is required"})
		return
	}

	output, err := h.googleOAuthUC.Verify(c.Request.Context(), authuc.GoogleVerifyInput{
		Credential: req.Credential,
	})
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google credential"})
		return
	}

	// Generate access token
	accessToken, err := h.jwtService.GenerateAccessToken(output.User.ID, output.User.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Generate and set refresh token in HttpOnly cookie
	if err := h.setRefreshTokenCookie(c, output.User.ID, output.User.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
		"user":        output.User,
	})
}

// setRefreshTokenCookie generates a refresh token, stores it in the database, and sets it in an HttpOnly cookie
func (h *AuthHandler) setRefreshTokenCookie(c *gin.Context, userID, email string) error {
	// Generate refresh token
	tokenID, refreshToken, err := h.jwtService.GenerateRefreshToken(userID, email)
	if err != nil {
		return err
	}

	// Hash the refresh token
	tokenHash, err := postgres.HashToken(refreshToken)
	if err != nil {
		return err
	}

	// Create refresh token entity
	expiresAt := time.Now().Add(h.jwtService.GetRefreshExpiration())
	refreshTokenEntity, err := domain.NewRefreshToken(tokenID, userID, tokenHash, expiresAt)
	if err != nil {
		return err
	}

	// Store in database
	if err := h.refreshTokenRepo.Create(c.Request.Context(), refreshTokenEntity); err != nil {
		return err
	}

	// Set cookie
	refreshExpiration := int(h.jwtService.GetRefreshExpiration().Seconds())
	c.SetCookie(
		"refresh_token",
		refreshToken,
		refreshExpiration,
		"/api/auth",
		"",
		true,  // Secure (HTTPS only)
		true,  // HttpOnly (not accessible via JavaScript)
	)

	return nil
}

type RefreshTokenResponse struct {
	AccessToken string `json:"accessToken" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}
