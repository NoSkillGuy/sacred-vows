package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/domain"
	authinfra "github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	authuc "github.com/sacred-vows/api-go/internal/usecase/auth"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type AuthHandler struct {
	registerUC                 *authuc.RegisterUseCase
	loginUC                    *authuc.LoginUseCase
	getCurrentUserUC           *authuc.GetCurrentUserUseCase
	deleteUserUC               *authuc.DeleteUserUseCase
	googleOAuthUC              *authuc.GoogleOAuthUseCase
	refreshTokenUC             *authuc.RefreshTokenUseCase
	requestPasswordResetUC     *authuc.RequestPasswordResetUseCase
	resetPasswordUC            *authuc.ResetPasswordUseCase
	requestPasswordChangeOTPUC *authuc.RequestPasswordChangeOTPUseCase
	verifyPasswordChangeOTPUC  *authuc.VerifyPasswordChangeOTPUseCase
	refreshTokenRepo           repository.RefreshTokenRepository
	jwtService                 *authinfra.JWTService
	googleOAuth                *authinfra.GoogleOAuthService
	hmacKeys                   []authinfra.RefreshTokenHMACKey
	activeHMACKeyID            int16
}

func NewAuthHandler(
	registerUC *authuc.RegisterUseCase,
	loginUC *authuc.LoginUseCase,
	getCurrentUserUC *authuc.GetCurrentUserUseCase,
	deleteUserUC *authuc.DeleteUserUseCase,
	googleOAuthUC *authuc.GoogleOAuthUseCase,
	refreshTokenUC *authuc.RefreshTokenUseCase,
	requestPasswordResetUC *authuc.RequestPasswordResetUseCase,
	resetPasswordUC *authuc.ResetPasswordUseCase,
	requestPasswordChangeOTPUC *authuc.RequestPasswordChangeOTPUseCase,
	verifyPasswordChangeOTPUC *authuc.VerifyPasswordChangeOTPUseCase,
	refreshTokenRepo repository.RefreshTokenRepository,
	jwtService *authinfra.JWTService,
	googleOAuth *authinfra.GoogleOAuthService,
	hmacKeys []authinfra.RefreshTokenHMACKey,
	activeHMACKeyID int16,
) *AuthHandler {
	return &AuthHandler{
		registerUC:                 registerUC,
		loginUC:                    loginUC,
		getCurrentUserUC:           getCurrentUserUC,
		deleteUserUC:               deleteUserUC,
		googleOAuthUC:              googleOAuthUC,
		refreshTokenUC:             refreshTokenUC,
		requestPasswordResetUC:     requestPasswordResetUC,
		resetPasswordUC:            resetPasswordUC,
		requestPasswordChangeOTPUC: requestPasswordChangeOTPUC,
		verifyPasswordChangeOTPUC:  verifyPasswordChangeOTPUC,
		refreshTokenRepo:           refreshTokenRepo,
		jwtService:                 jwtService,
		googleOAuth:                googleOAuth,
		hmacKeys:                   hmacKeys,
		activeHMACKeyID:            activeHMACKeyID,
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

	refreshExpiration := int(h.jwtService.GetRefreshExpiration().Seconds())

	oldCookie1 := &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.isSecureCookie(c),
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(c.Writer, oldCookie1)

	cookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    output.RefreshToken,
		Path:     "/",
		MaxAge:   refreshExpiration,
		HttpOnly: true,
		Secure:   h.isSecureCookie(c),
		SameSite: http.SameSiteLaxMode, // Lax works for same-site (localhost with different ports)
	}
	http.SetCookie(c.Writer, cookie)

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
		-1,  // Expire immediately
		"/", // Path "/" to match where cookie was set
		"",
		h.isSecureCookie(c), // Secure (HTTPS only) - conditional based on request
		true,                // HttpOnly (not accessible via JavaScript)
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

// DeleteUser deletes a user (TEST ONLY - only available in local/test environments)
// @Summary      Delete user (TEST ONLY)
// @Description  Deletes the currently authenticated user. This endpoint is only available in test/local environments for test cleanup purposes.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200      {object}  MessageResponse    "User deleted successfully"
// @Failure      401      {object}  ErrorResponse      "Authentication required"
// @Failure      404      {object}  ErrorResponse      "User not found"
// @Failure      500      {object}  ErrorResponse      "Internal server error"
// @Router       /auth/user [delete]
func (h *AuthHandler) DeleteUser(c *gin.Context) {
	// Check if test endpoints are enabled (only in local/test environments)
	appEnv := os.Getenv("APP_ENV")
	enableTestEndpoints := os.Getenv("ENABLE_TEST_ENDPOINTS") == "true"

	if appEnv != "local" && !enableTestEndpoints {
		c.JSON(http.StatusForbidden, gin.H{"error": "This endpoint is only available in test environments"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	err := h.deleteUserUC.Execute(c.Request.Context(), userID.(string))
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	// Also revoke all refresh tokens for this user
	_ = h.refreshTokenRepo.RevokeByUserID(c.Request.Context(), userID.(string))

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted successfully",
	})
}

// GoogleOAuth initiates Google OAuth flow
// @Summary      Initiate Google OAuth
// @Description  Redirects to Google OAuth consent screen to initiate authentication flow. This endpoint starts the OAuth 2.0 authorization code flow.
// @Tags         auth
// @Produce      json
// @Success      307  "Redirect to Google OAuth consent screen"
// @Router       /auth/google [get]
func (h *AuthHandler) GoogleOAuth(c *gin.Context) {
	authURL := h.googleOAuth.GetAuthURL()
	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// GoogleCallback handles Google OAuth callback
// @Summary      Google OAuth callback
// @Description  Handles the callback from Google OAuth after user authorization. Exchanges the authorization code for user information, creates/updates the user account, and redirects to the frontend with a JWT token. If any step fails, redirects to frontend with an error parameter.
// @Tags         auth
// @Produce      json
// @Param        code   query     string  true  "OAuth authorization code from Google"
// @Success      307    "Redirect to frontend with token (format: /builder?token=JWT_TOKEN)"
// @Failure      307    "Redirect to frontend with error (format: /login?error=ERROR_TYPE)"
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

	// Generate and set refresh token in HttpOnly cookie
	if err := h.setRefreshTokenCookie(c, output.User.ID, output.User.Email); err != nil {
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

func (h *AuthHandler) isSecureCookie(c *gin.Context) bool {
	// Check if request is HTTPS
	// Also check X-Forwarded-Proto header for proxies/load balancers
	if c.GetHeader("X-Forwarded-Proto") == "https" {
		return true
	}
	if c.Request.TLS != nil {
		return true
	}
	return false
}

// setRefreshTokenCookie generates a refresh token, stores it in the database, and sets it in an HttpOnly cookie
func (h *AuthHandler) setRefreshTokenCookie(c *gin.Context, userID, email string) error {
	// Generate refresh token
	tokenID, refreshToken, err := h.jwtService.GenerateRefreshToken(userID, email)
	if err != nil {
		return err
	}

	// Hash the refresh token
	tokenHash, err := authinfra.HashToken(refreshToken)
	if err != nil {
		return err
	}

	activeKey, ok := h.getActiveHMACKey()
	if !ok {
		return fmt.Errorf("refresh token hmac key not configured")
	}
	tokenBytes, err := authinfra.DecodeRefreshToken(refreshToken)
	if err != nil {
		return err
	}
	fingerprint := authinfra.ComputeRefreshTokenFingerprint(activeKey.Key, tokenBytes)

	// Create refresh token entity
	expiresAt := time.Now().Add(h.jwtService.GetRefreshExpiration())
	refreshTokenEntity, err := domain.NewRefreshToken(tokenID, userID, tokenHash, fingerprint, activeKey.ID, expiresAt)
	if err != nil {
		return err
	}

	// Store in database
	if err := h.refreshTokenRepo.Create(c.Request.Context(), refreshTokenEntity); err != nil {
		return err
	}

	refreshExpiration := int(h.jwtService.GetRefreshExpiration().Seconds())

	oldCookie1 := &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.isSecureCookie(c),
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(c.Writer, oldCookie1)

	cookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		MaxAge:   refreshExpiration,
		HttpOnly: true,
		Secure:   h.isSecureCookie(c),
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(c.Writer, cookie)

	return nil
}

func (h *AuthHandler) getActiveHMACKey() (authinfra.RefreshTokenHMACKey, bool) {
	for _, k := range h.hmacKeys {
		if k.ID == h.activeHMACKeyID {
			return k, true
		}
	}
	return authinfra.RefreshTokenHMACKey{}, false
}

type RefreshTokenResponse struct {
	AccessToken string `json:"accessToken" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required" example:"user@example.com"`
}

type ResetPasswordRequest struct {
	Token    string `json:"token" binding:"required" example:"abc123..."`
	Password string `json:"password" binding:"required" example:"newSecurePassword123"`
}

type RequestPasswordChangeOTPRequest struct {
	Email string `json:"email" binding:"required" example:"user@example.com"`
}

type VerifyPasswordChangeOTPRequest struct {
	OTP         string `json:"otp" binding:"required" example:"123456"`
	NewPassword string `json:"newPassword" binding:"required" example:"newSecurePassword123"`
}

// ForgotPassword handles password reset requests
// @Summary      Request password reset
// @Description  Sends a password reset email to the user if an account with that email exists. Always returns success for security reasons.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      ForgotPasswordRequest  true  "Password reset request"
// @Success      200      {object}  MessageResponse         "If an account with that email exists, a password reset link has been sent"
// @Failure      400      {object}  ErrorResponse           "Invalid request"
// @Failure      500      {object}  ErrorResponse           "Internal server error"
// @Router       /auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	if h.requestPasswordResetUC == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Email service is not configured. Password reset is currently unavailable."})
		return
	}

	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	_, err := h.requestPasswordResetUC.Execute(c.Request.Context(), authuc.RequestPasswordResetInput{
		Email: req.Email,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password reset request"})
		return
	}

	// Always return success message (security best practice - don't reveal if email exists)
	c.JSON(http.StatusOK, gin.H{
		"message": "If an account with that email exists, we've sent a password reset link.",
	})
}

// ResetPassword handles password reset with token
// @Summary      Reset password
// @Description  Resets the user's password using a valid reset token from the email link.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      ResetPasswordRequest  true  "Password reset with token"
// @Success      200      {object}  MessageResponse        "Password reset successfully"
// @Failure      400      {object}  ErrorResponse         "Invalid request"
// @Failure      401      {object}  ErrorResponse         "Invalid or expired reset token"
// @Failure      500      {object}  ErrorResponse         "Internal server error"
// @Router       /auth/reset-password [post]
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	if h.resetPasswordUC == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Password reset service is not configured. Please contact support."})
		return
	}

	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token and password are required"})
		return
	}

	_, err := h.resetPasswordUC.Execute(c.Request.Context(), authuc.ResetPasswordInput{
		Token:    req.Token,
		Password: req.Password,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to reset password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully",
	})
}

// RequestPasswordChangeOTP handles password change OTP requests
// @Summary      Request password change OTP
// @Description  Sends a 6-digit OTP to the user's email for password change verification. Requires authentication.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      RequestPasswordChangeOTPRequest  true  "Password change OTP request"
// @Success      200      {object}  MessageResponse                  "OTP sent successfully"
// @Failure      400      {object}  ErrorResponse                   "Invalid request"
// @Failure      401      {object}  ErrorResponse                   "Authentication required"
// @Failure      429      {object}  ErrorResponse                   "Too many requests (cooldown)"
// @Failure      500      {object}  ErrorResponse                   "Internal server error"
// @Router       /auth/password/request-otp [post]
func (h *AuthHandler) RequestPasswordChangeOTP(c *gin.Context) {
	if h.requestPasswordChangeOTPUC == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Email service is not configured. Password change is currently unavailable."})
		return
	}

	// Get user ID from JWT token (set by AuthenticateToken middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var req RequestPasswordChangeOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	_, err := h.requestPasswordChangeOTPUC.Execute(c.Request.Context(), authuc.RequestPasswordChangeOTPInput{
		UserID: userID.(string),
		Email:  req.Email,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send OTP"})
		return
	}

	// Always return success (security best practice - don't reveal if email exists)
	c.JSON(http.StatusOK, gin.H{
		"message": "If an account with that email exists, we've sent a verification code.",
	})
}

// VerifyPasswordChangeOTP handles password change with OTP verification
// @Summary      Verify password change OTP
// @Description  Verifies the OTP and updates the user's password. Requires authentication.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      VerifyPasswordChangeOTPRequest  true  "Password change OTP verification"
// @Success      200      {object}  MessageResponse                "Password updated successfully"
// @Failure      400      {object}  ErrorResponse                  "Invalid request"
// @Failure      401      {object}  ErrorResponse                  "Invalid or expired OTP"
// @Failure      500      {object}  ErrorResponse                  "Internal server error"
// @Router       /auth/password/verify-otp [post]
func (h *AuthHandler) VerifyPasswordChangeOTP(c *gin.Context) {
	if h.verifyPasswordChangeOTPUC == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Password change service is not configured. Please contact support."})
		return
	}

	// Get user ID from JWT token (set by AuthenticateToken middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var req VerifyPasswordChangeOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP and new password are required"})
		return
	}

	_, err := h.verifyPasswordChangeOTPUC.Execute(c.Request.Context(), authuc.VerifyPasswordChangeOTPInput{
		UserID:      userID.(string),
		OTP:         req.OTP,
		NewPassword: req.NewPassword,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to verify OTP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password updated successfully",
	})
}
