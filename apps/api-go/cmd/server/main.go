package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	"github.com/sacred-vows/api-go/internal/infrastructure/database/postgres"
	"github.com/sacred-vows/api-go/internal/infrastructure/storage"
	httpRouter "github.com/sacred-vows/api-go/internal/interfaces/http"
	"github.com/sacred-vows/api-go/internal/interfaces/http/handlers"
	"github.com/sacred-vows/api-go/internal/usecase/analytics"
	"github.com/sacred-vows/api-go/internal/usecase/asset"
	authUC "github.com/sacred-vows/api-go/internal/usecase/auth"
	"github.com/sacred-vows/api-go/internal/usecase/invitation"
	"github.com/sacred-vows/api-go/internal/usecase/rsvp"
	"github.com/sacred-vows/api-go/internal/usecase/template"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	// Initialize logger
	if err := logger.Init(); err != nil {
		panic(fmt.Sprintf("Failed to initialize logger: %v", err))
	}
	defer logger.GetLogger().Sync()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.GetLogger().Fatal("Failed to load configuration", zap.Error(err))
	}

	// Initialize database
	db, err := postgres.New(&cfg.Database)
	if err != nil {
		logger.GetLogger().Fatal("Failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	// Run SQL migrations
	ctx := context.Background()
	// Migrations folder path - in Docker it's /app/migrations, locally it's ../../migrations
	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	if migrationsDir == "" {
		// Try Docker path first, then local path
		if _, err := os.Stat("/app/migrations"); err == nil {
			migrationsDir = "/app/migrations"
		} else {
			migrationsDir = "../../migrations"
		}
	}
	if err := db.RunMigrations(ctx, migrationsDir); err != nil {
		logger.GetLogger().Error("Failed to run SQL migrations", zap.Error(err))
		// Continue anyway - GORM AutoMigrate will handle schema changes
		// But data migrations (like loading templates) may fail
	}

	// Run GORM AutoMigrate
	if err := db.AutoMigrate(
		&postgres.UserModel{},
		&postgres.InvitationModel{},
		&postgres.TemplateModel{},
		&postgres.AssetModel{},
		&postgres.RSVPResponseModel{},
		&postgres.AnalyticsModel{},
	); err != nil {
		logger.GetLogger().Fatal("Failed to run GORM migrations", zap.Error(err))
	}

	// Initialize repositories
	userRepo := postgres.NewUserRepository(db.DB)
	invitationRepo := postgres.NewInvitationRepository(db.DB)
	templateRepo := postgres.NewTemplateRepository(db.DB)
	assetRepo := postgres.NewAssetRepository(db.DB)
	rsvpRepo := postgres.NewRSVPRepository(db.DB)
	analyticsRepo := postgres.NewAnalyticsRepository(db.DB)

	// Initialize services
	jwtService := auth.NewJWTService(cfg.Auth.JWTSecret, cfg.Auth.JWTExpiration)
	googleOAuthService := auth.NewGoogleOAuthService(&cfg.Google)
	fileStorage, err := storage.NewFileStorage(cfg.Storage.UploadPath, cfg.Storage.MaxFileSize, cfg.Storage.AllowedTypes)
	if err != nil {
		logger.GetLogger().Fatal("Failed to initialize file storage", zap.Error(err))
	}

	// Initialize use cases
	registerUC := authUC.NewRegisterUseCase(userRepo)
	loginUC := authUC.NewLoginUseCase(userRepo)
	getCurrentUserUC := authUC.NewGetCurrentUserUseCase(userRepo)
	googleOAuthUC := authUC.NewGoogleOAuthUseCaseWithService(userRepo, googleOAuthService.GetOAuthConfig(), googleOAuthService)

	createInvitationUC := invitation.NewCreateInvitationUseCase(invitationRepo)
	getInvitationByIDUC := invitation.NewGetInvitationByIDUseCase(invitationRepo)
	getAllInvitationsUC := invitation.NewGetAllInvitationsUseCase(invitationRepo)
	getInvitationPreviewUC := invitation.NewGetInvitationPreviewUseCase(invitationRepo)
	updateInvitationUC := invitation.NewUpdateInvitationUseCase(invitationRepo)
	deleteInvitationUC := invitation.NewDeleteInvitationUseCase(invitationRepo)

	getAllTemplatesUC := template.NewGetAllTemplatesUseCase(templateRepo)
	getTemplateByIDUC := template.NewGetTemplateByIDUseCase(templateRepo)
	getTemplateManifestUC := template.NewGetTemplateManifestUseCase(templateRepo)
	getManifestsUC := template.NewGetManifestsUseCase(templateRepo)

	uploadAssetUC := asset.NewUploadAssetUseCase(assetRepo, cfg.Storage.UploadPath, cfg.Storage.MaxFileSize, cfg.Storage.AllowedTypes)
	getAllAssetsUC := asset.NewGetAllAssetsUseCase(assetRepo)
	deleteAssetUC := asset.NewDeleteAssetUseCase(assetRepo)

	submitRSVPUC := rsvp.NewSubmitRSVPUseCase(rsvpRepo)
	getRSVPByInvitationUC := rsvp.NewGetRSVPByInvitationUseCase(rsvpRepo)

	trackViewUC := analytics.NewTrackViewUseCase(analyticsRepo)
	getAnalyticsByInvitationUC := analytics.NewGetAnalyticsByInvitationUseCase(analyticsRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(registerUC, loginUC, getCurrentUserUC, googleOAuthUC, jwtService, googleOAuthService)
	invitationHandler := handlers.NewInvitationHandler(createInvitationUC, getInvitationByIDUC, getAllInvitationsUC, getInvitationPreviewUC, updateInvitationUC, deleteInvitationUC)
	templateHandler := handlers.NewTemplateHandler(getAllTemplatesUC, getTemplateByIDUC, getTemplateManifestUC, getManifestsUC)
	assetHandler := handlers.NewAssetHandler(uploadAssetUC, getAllAssetsUC, deleteAssetUC, fileStorage)
	rsvpHandler := handlers.NewRSVPHandler(submitRSVPUC, getRSVPByInvitationUC)
	analyticsHandler := handlers.NewAnalyticsHandler(trackViewUC, getAnalyticsByInvitationUC)

	// Setup router
	router := httpRouter.NewRouter(authHandler, invitationHandler, templateHandler, assetHandler, rsvpHandler, analyticsHandler, jwtService)
	engine := router.Setup()

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      engine,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	// Start server in goroutine
	go func() {
		logger.GetLogger().Info("Starting server", zap.String("port", cfg.Server.Port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.GetLogger().Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.GetLogger().Info("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.GetLogger().Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.GetLogger().Info("Server exited")
}
