package http

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/interfaces/http/handlers"
	"github.com/sacred-vows/api-go/internal/interfaces/http/middleware"
	"github.com/sacred-vows/api-go/pkg/logger"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Router struct {
	authHandler       *handlers.AuthHandler
	invitationHandler *handlers.InvitationHandler
	layoutHandler     *handlers.LayoutHandler
	assetHandler      *handlers.AssetHandler
	rsvpHandler       *handlers.RSVPHandler
	analyticsHandler  *handlers.AnalyticsHandler
	jwtService        *auth.JWTService
	frontendURL       string
}

func NewRouter(
	authHandler *handlers.AuthHandler,
	invitationHandler *handlers.InvitationHandler,
	layoutHandler *handlers.LayoutHandler,
	assetHandler *handlers.AssetHandler,
	rsvpHandler *handlers.RSVPHandler,
	analyticsHandler *handlers.AnalyticsHandler,
	jwtService *auth.JWTService,
	frontendURL string,
) *Router {
	return &Router{
		authHandler:       authHandler,
		invitationHandler: invitationHandler,
		layoutHandler:     layoutHandler,
		assetHandler:      assetHandler,
		rsvpHandler:       rsvpHandler,
		analyticsHandler:  analyticsHandler,
		jwtService:        jwtService,
		frontendURL:       frontendURL,
	}
}

func (r *Router) Setup() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	// Middleware
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(r.frontendURL))
	router.Use(middleware.ErrorHandler())
	router.Use(logger.GinLogger())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

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
			assets.POST("/upload", middleware.OptionalAuth(r.jwtService), r.assetHandler.Upload)
			assets.GET("", middleware.OptionalAuth(r.jwtService), r.assetHandler.GetAll)
			assets.DELETE("/delete", middleware.OptionalAuth(r.jwtService), r.assetHandler.Delete)
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
	}

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "Route not found"})
	})

	return router
}
