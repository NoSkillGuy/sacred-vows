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
	Email    string  `json:"email" binding:"required"`
	Password string  `json:"password" binding:"required"`
	Name     *string `json:"name"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type GoogleVerifyRequest struct {
	Credential string `json:"credential" binding:"required"`
}

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

func (h *AuthHandler) GoogleOAuth(c *gin.Context) {
	authURL := h.googleOAuth.GetAuthURL()
	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

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
