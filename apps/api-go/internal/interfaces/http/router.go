package http

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	"github.com/sacred-vows/api-go/internal/interfaces/http/handlers"
	"github.com/sacred-vows/api-go/internal/interfaces/http/middleware"
	"github.com/sacred-vows/api-go/pkg/logger"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

type Router struct {
	authHandler       *handlers.AuthHandler
	invitationHandler *handlers.InvitationHandler
	layoutHandler     *handlers.LayoutHandler
	assetHandler      *handlers.AssetHandler
	rsvpHandler       *handlers.RSVPHandler
	analyticsHandler  *handlers.AnalyticsHandler
	publishHandler    *handlers.PublishHandler
	resolveHandler    *handlers.PublishedSiteResolveHandler
	resolveAPIHandler *handlers.PublishedResolveAPIHandler
	jwtService        *auth.JWTService
	frontendURL       string
	observabilityCfg  config.ObservabilityConfig
}

func NewRouter(
	authHandler *handlers.AuthHandler,
	invitationHandler *handlers.InvitationHandler,
	layoutHandler *handlers.LayoutHandler,
	assetHandler *handlers.AssetHandler,
	rsvpHandler *handlers.RSVPHandler,
	analyticsHandler *handlers.AnalyticsHandler,
	publishHandler *handlers.PublishHandler,
	resolveHandler *handlers.PublishedSiteResolveHandler,
	resolveAPIHandler *handlers.PublishedResolveAPIHandler,
	jwtService *auth.JWTService,
	frontendURL string,
	observabilityCfg config.ObservabilityConfig,
) *Router {
	return &Router{
		authHandler:       authHandler,
		invitationHandler: invitationHandler,
		layoutHandler:     layoutHandler,
		assetHandler:      assetHandler,
		rsvpHandler:       rsvpHandler,
		analyticsHandler:  analyticsHandler,
		publishHandler:    publishHandler,
		resolveHandler:    resolveHandler,
		resolveAPIHandler: resolveAPIHandler,
		jwtService:        jwtService,
		frontendURL:       frontendURL,
		observabilityCfg:  observabilityCfg,
	}
}

func (r *Router) Setup() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	// Middleware
	router.Use(gin.Recovery())

	// Request ID middleware (early in chain for correlation)
	router.Use(middleware.RequestIDMiddleware())

	// OpenTelemetry middleware (if enabled)
	if r.observabilityCfg.Enabled {
		router.Use(otelgin.Middleware(r.observabilityCfg.ServiceName))
	}

	router.Use(middleware.CORS(r.frontendURL))
	router.Use(middleware.ErrorHandler())
	router.Use(logger.GinLogger())

	// Health check (support both GET and HEAD for health checks)
	router.GET("/health", handlers.HealthCheck)
	router.HEAD("/health", handlers.HealthCheck)

	// API routes
	api := router.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", r.authHandler.Register)
			auth.POST("/login", r.authHandler.Login)
			auth.POST("/refresh", r.authHandler.RefreshToken)
			auth.POST("/logout", middleware.AuthenticateToken(r.jwtService), r.authHandler.Logout)
			auth.GET("/me", middleware.AuthenticateToken(r.jwtService), r.authHandler.GetCurrentUser)
			auth.GET("/google", r.authHandler.GoogleOAuth)
			auth.GET("/google/callback", r.authHandler.GoogleCallback)
			auth.POST("/google/verify", r.authHandler.GoogleVerify)
			auth.POST("/forgot-password", r.authHandler.ForgotPassword)
			auth.POST("/reset-password", r.authHandler.ResetPassword)
			auth.POST("/password/request-otp", middleware.RateLimit(1, 0.033), middleware.AuthenticateToken(r.jwtService), r.authHandler.RequestPasswordChangeOTP)
			auth.POST("/password/verify-otp", middleware.AuthenticateToken(r.jwtService), r.authHandler.VerifyPasswordChangeOTP)

			// Test-only endpoint: Delete user (only enabled in local/test environments)
			appEnv := os.Getenv("APP_ENV")
			enableTestEndpoints := os.Getenv("ENABLE_TEST_ENDPOINTS") == "true"
			if appEnv == "local" || enableTestEndpoints {
				auth.DELETE("/user", middleware.AuthenticateToken(r.jwtService), r.authHandler.DeleteUser)
			}
		}

		// Invitation routes
		invitations := api.Group("/invitations")
		{
			invitations.GET("", middleware.OptionalAuth(r.jwtService), r.invitationHandler.GetAll)
			invitations.GET("/:id/preview", r.invitationHandler.GetPreview)
			invitations.GET("/:id", r.invitationHandler.GetByID)
			invitations.POST("", middleware.OptionalAuth(r.jwtService), r.invitationHandler.Create)
			invitations.PUT("/:id", middleware.OptionalAuth(r.jwtService), r.invitationHandler.Update)
			invitations.DELETE("/:id", middleware.OptionalAuth(r.jwtService), r.invitationHandler.Delete)
			invitations.POST("/migrate", middleware.AuthenticateToken(r.jwtService), r.invitationHandler.MigrateInvitations)
		}

		// Layout routes
		layouts := api.Group("/layouts")
		{
			layouts.GET("", r.layoutHandler.GetAll)
			layouts.GET("/manifests", r.layoutHandler.GetManifests)
			layouts.GET("/:id/manifest", r.layoutHandler.GetManifest)
			layouts.GET("/:id", r.layoutHandler.GetByID)
		}

		// Asset routes
		assets := api.Group("/assets")
		{
			assets.POST("/upload", middleware.AuthenticateToken(r.jwtService), r.assetHandler.Upload)
			assets.POST("/upload-url", middleware.AuthenticateToken(r.jwtService), r.assetHandler.GenerateSignedURL)
			assets.GET("", middleware.AuthenticateToken(r.jwtService), r.assetHandler.GetAll)
			assets.DELETE("/delete", middleware.AuthenticateToken(r.jwtService), r.assetHandler.Delete)
			assets.POST("/count-by-urls", middleware.AuthenticateToken(r.jwtService), r.assetHandler.CountByURLs)
		}

		// RSVP routes
		rsvp := api.Group("/rsvp")
		{
			rsvp.POST("/:invitationId", r.rsvpHandler.Submit)
			rsvp.GET("/:invitationId", r.rsvpHandler.GetByInvitation)
		}

		// Analytics routes
		analytics := api.Group("/analytics")
		{
			analytics.POST("/view", r.analyticsHandler.TrackView)
			analytics.GET("/:invitationId", r.analyticsHandler.GetByInvitation)
		}

		// Publish routes
		publish := api.Group("/publish")
		{
			publish.POST("/validate", middleware.RateLimit(20, 2), r.publishHandler.ValidateSubdomain)
			publish.POST("", middleware.RateLimit(10, 1), middleware.AuthenticateToken(r.jwtService), r.publishHandler.Publish)
		}

		// Published resolve endpoint for edge (no auth)
		published := api.Group("/published")
		{
			published.GET("/resolve", r.resolveAPIHandler.Resolve)
			published.GET("/versions", middleware.AuthenticateToken(r.jwtService), r.publishHandler.ListVersions)
			published.POST("/rollback", middleware.AuthenticateToken(r.jwtService), r.publishHandler.Rollback)
		}
	}

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Serve published artifacts
	// For filesystem storage: serve from local directory
	// For R2/MinIO storage: proxy to MinIO public URL
	publishedGroup := router.Group("/published")
	{
		// Exclude /published/resolve, /published/versions, /published/rollback (handled by API routes above)
		publishedGroup.GET("/*path", func(c *gin.Context) {
			// Check if this is an API route (shouldn't happen due to route ordering, but safety check)
			path := c.Param("path")
			if path == "/resolve" || strings.HasPrefix(path, "/versions") || strings.HasPrefix(path, "/rollback") {
				c.Next()
				return
			}

			// For R2/MinIO: redirect to MinIO public URL
			// The r2PublicBase is passed via resolveHandler, but we need it here too
			// For now, redirect to MinIO if r2PublicBase is configured
			// This is a simple solution - a full proxy would require passing artifactStore to router
			r2PublicBase := os.Getenv("R2_PUBLIC_BASE")
			if r2PublicBase != "" {
				// Redirect to MinIO public URL
				// Sanitize the path to prevent path traversal attacks
				key := strings.TrimPrefix(path, "/")
				// Remove any path traversal attempts
				key = filepath.Clean(key)
				// Ensure no directory traversal (should not start with ..)
				if strings.HasPrefix(key, "..") || strings.Contains(key, "../") {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid path"})
					return
				}
				c.Redirect(http.StatusFound, fmt.Sprintf("%s/%s", r2PublicBase, key))
				return
			}

			// For filesystem: serve from local directory (fallback to Static handler behavior)
			// Sanitize the path to prevent path traversal attacks
			// Remove leading slash and clean the path
			sanitizedPath := strings.TrimPrefix(path, "/")
			sanitizedPath = filepath.Clean(sanitizedPath)
			// Ensure no directory traversal (should not start with ..)
			if strings.HasPrefix(sanitizedPath, "..") || strings.Contains(sanitizedPath, "../") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid path"})
				return
			}
			// Construct safe file path within published directory
			fullPath := filepath.Join("./published", sanitizedPath)
			// Verify the resolved path is still within published directory (prevent absolute paths)
			absPublished, _ := filepath.Abs("./published")
			absFullPath, _ := filepath.Abs(fullPath)
			if !strings.HasPrefix(absFullPath, absPublished) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid path"})
				return
			}
			c.File(fullPath)
		})
	}

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		// Attempt to resolve published sites by Host header, otherwise return default 404.
		if r.resolveHandler != nil {
			r.resolveHandler.Handle(c)
			return
		}
		c.JSON(404, gin.H{"error": "Route not found"})
	})

	return router
}
