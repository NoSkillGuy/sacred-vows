package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	authinfra "github.com/sacred-vows/api-go/internal/infrastructure/auth"
	authuc "github.com/sacred-vows/api-go/internal/usecase/auth"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type AuthHandler struct {
	registerUC       *authuc.RegisterUseCase
	loginUC          *authuc.LoginUseCase
	getCurrentUserUC *authuc.GetCurrentUserUseCase
	googleOAuthUC    *authuc.GoogleOAuthUseCase
	jwtService       *authinfra.JWTService
	googleOAuth      *authinfra.GoogleOAuthService
}

func NewAuthHandler(
	registerUC *authuc.RegisterUseCase,
	loginUC *authuc.LoginUseCase,
	getCurrentUserUC *authuc.GetCurrentUserUseCase,
	googleOAuthUC *authuc.GoogleOAuthUseCase,
	jwtService *authinfra.JWTService,
	googleOAuth *authinfra.GoogleOAuthService,
) *AuthHandler {
	return &AuthHandler{
		registerUC:       registerUC,
		loginUC:          loginUC,
		getCurrentUserUC: getCurrentUserUC,
		googleOAuthUC:    googleOAuthUC,
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

	// Generate token
	token, err := h.jwtService.GenerateToken(output.User.ID, output.User.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  output.User,
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

	// Generate token
	token, err := h.jwtService.GenerateToken(output.User.ID, output.User.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  output.User,
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

	// Generate token
	token, err := h.jwtService.GenerateToken(output.User.ID, output.User.Email)
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

	// Generate token
	token, err := h.jwtService.GenerateToken(output.User.ID, output.User.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  output.User,
	})
}
