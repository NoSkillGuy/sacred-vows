// @title           Wedding Invitation Builder API
// @version         1.0
// @description     API for managing wedding invitations, layouts, assets, RSVP responses, and analytics. This API follows Clean Architecture principles.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.example.com/support
// @contact.email  support@example.com

// @license.name  ISC
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:3000
// @BasePath  /api

// @securityDefinitions.bearer  BearerAuth
// @in                          header
// @name                        Authorization
// @description                 JWT Bearer token authentication. Format: "Bearer {token}"

package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/sacred-vows/api-go/docs" // Swagger documentation
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	"github.com/sacred-vows/api-go/internal/infrastructure/database/firestore"
	publishinfra "github.com/sacred-vows/api-go/internal/infrastructure/publish"
	"github.com/sacred-vows/api-go/internal/infrastructure/storage"
	httpRouter "github.com/sacred-vows/api-go/internal/interfaces/http"
	"github.com/sacred-vows/api-go/internal/interfaces/http/handlers"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/internal/usecase/analytics"
	"github.com/sacred-vows/api-go/internal/usecase/asset"
	authUC "github.com/sacred-vows/api-go/internal/usecase/auth"
	"github.com/sacred-vows/api-go/internal/usecase/invitation"
	"github.com/sacred-vows/api-go/internal/usecase/layout"
	publishUC "github.com/sacred-vows/api-go/internal/usecase/publish"
	"github.com/sacred-vows/api-go/internal/usecase/rsvp"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	fmt.Fprintf(os.Stderr, "[MAIN] Application starting...\n")
	// Initialize logger
	if err := logger.Init(); err != nil {
		panic(fmt.Sprintf("Failed to initialize logger: %v", err))
	}
	defer logger.GetLogger().Sync()
	fmt.Fprintf(os.Stderr, "[MAIN] Logger initialized\n")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.GetLogger().Fatal("Failed to load configuration", zap.Error(err))
	}

	// Initialize Firestore database
	ctx := context.Background()
	firestoreClient, err := firestore.NewFromEnv(ctx)
	if err != nil {
		logger.GetLogger().Fatal("Failed to connect to Firestore", zap.Error(err))
	}
	defer firestoreClient.Close()

	logger.GetLogger().Info("Using Firestore database", zap.String("project_id", cfg.Database.ProjectID), zap.String("database_id", cfg.Database.DatabaseID))

	// Run Firestore migrations
	if err := firestoreClient.RunMigrations(ctx); err != nil {
		logger.GetLogger().Error("Failed to run Firestore migrations", zap.Error(err))
		// Continue anyway - migrations may have partially succeeded
		// But data migrations (like loading layouts) may fail
	}

	// Initialize Firestore repositories
	var userRepo repository.UserRepository
	var invitationRepo repository.InvitationRepository
	var layoutRepo repository.LayoutRepository
	var assetRepo repository.AssetRepository
	var rsvpRepo repository.RSVPRepository
	var analyticsRepo repository.AnalyticsRepository
	var refreshTokenRepo repository.RefreshTokenRepository
	var publishedSiteRepo repository.PublishedSiteRepository

	userRepo = firestore.NewUserRepository(firestoreClient)
	invitationRepo = firestore.NewInvitationRepository(firestoreClient)
	layoutRepo = firestore.NewLayoutRepository(firestoreClient)
	assetRepo = firestore.NewAssetRepository(firestoreClient)
	rsvpRepo = firestore.NewRSVPRepository(firestoreClient)
	analyticsRepo = firestore.NewAnalyticsRepository(firestoreClient)
	refreshTokenRepo = firestore.NewRefreshTokenRepository(firestoreClient)
	publishedSiteRepo = firestore.NewPublishedSiteRepository(firestoreClient)

	// Initialize services
	jwtService := auth.NewJWTService(
		cfg.Auth.JWTSecret,
		cfg.Auth.JWTAccessExpiration,
		cfg.Auth.JWTRefreshExpiration,
		cfg.Auth.JWTIssuer,
		cfg.Auth.JWTAudience,
		cfg.Auth.ClockSkewTolerance,
	)
	googleOAuthService := auth.NewGoogleOAuthService(&cfg.Google)

	// Initialize storage (GCS if bucket is configured, otherwise filesystem)
	var fileStorage storage.Storage
	var gcsStorage storage.SignedURLStorage
	gcsBucket := os.Getenv("GCS_ASSETS_BUCKET")
	publicAssetsBaseURL := os.Getenv("PUBLIC_ASSETS_BASE_URL")
	if gcsBucket != "" {
		gcsStorageImpl, err := storage.NewGCSStorage(ctx, gcsBucket, publicAssetsBaseURL, cfg.Storage.MaxFileSize, cfg.Storage.AllowedTypes)
		if err != nil {
			logger.GetLogger().Fatal("Failed to initialize GCS storage", zap.Error(err))
		}
		fileStorage = gcsStorageImpl
		gcsStorage = gcsStorageImpl
		logger.GetLogger().Info("Using GCS storage", zap.String("bucket", gcsBucket))
	} else {
		fsStorage, err := storage.NewFileStorage(cfg.Storage.UploadPath, cfg.Storage.MaxFileSize, cfg.Storage.AllowedTypes)
		if err != nil {
			logger.GetLogger().Fatal("Failed to initialize file storage", zap.Error(err))
		}
		fileStorage = fsStorage
		logger.GetLogger().Info("Using filesystem storage", zap.String("path", cfg.Storage.UploadPath))
	}

	// Initialize use cases
	registerUC := authUC.NewRegisterUseCase(userRepo)
	loginUC := authUC.NewLoginUseCase(userRepo)
	getCurrentUserUC := authUC.NewGetCurrentUserUseCase(userRepo)
	googleOAuthUC := authUC.NewGoogleOAuthUseCaseWithService(userRepo, googleOAuthService.GetOAuthConfig(), googleOAuthService)

	hmacKeys := make([]auth.RefreshTokenHMACKey, 0, len(cfg.Auth.RefreshTokenHMACKeys))
	for _, k := range cfg.Auth.RefreshTokenHMACKeys {
		hmacKeys = append(hmacKeys, auth.RefreshTokenHMACKey{ID: k.ID, Key: k.Key})
	}
	refreshTokenUC := authUC.NewRefreshTokenUseCase(refreshTokenRepo, userRepo, jwtService, hmacKeys, cfg.Auth.RefreshTokenHMACActiveKeyID)

	createInvitationUC := invitation.NewCreateInvitationUseCase(invitationRepo)
	getInvitationByIDUC := invitation.NewGetInvitationByIDUseCase(invitationRepo)
	getAllInvitationsUC := invitation.NewGetAllInvitationsUseCase(invitationRepo)
	getInvitationPreviewUC := invitation.NewGetInvitationPreviewUseCase(invitationRepo)
	updateInvitationUC := invitation.NewUpdateInvitationUseCase(invitationRepo)
	deleteInvitationUC := invitation.NewDeleteInvitationUseCase(invitationRepo)
	migrateInvitationsUC := invitation.NewMigrateInvitationsUseCase(invitationRepo)

	getAllLayoutsUC := layout.NewGetAllLayoutsUseCase(layoutRepo)
	getLayoutByIDUC := layout.NewGetLayoutByIDUseCase(layoutRepo)
	getLayoutManifestUC := layout.NewGetLayoutManifestUseCase(layoutRepo)
	getManifestsUC := layout.NewGetManifestsUseCase(layoutRepo)

	uploadAssetUC := asset.NewUploadAssetUseCase(assetRepo, cfg.Storage.UploadPath, cfg.Storage.MaxFileSize, cfg.Storage.AllowedTypes)
	getAllAssetsUC := asset.NewGetAllAssetsUseCase(assetRepo)
	deleteAssetUC := asset.NewDeleteAssetUseCase(assetRepo)

	submitRSVPUC := rsvp.NewSubmitRSVPUseCase(rsvpRepo)
	getRSVPByInvitationUC := rsvp.NewGetRSVPByInvitationUseCase(rsvpRepo)

	trackViewUC := analytics.NewTrackViewUseCase(analyticsRepo)
	getAnalyticsByInvitationUC := analytics.NewGetAnalyticsByInvitationUseCase(analyticsRepo)

	// Publish use cases (wiring generator/storage happens later; defaults to noop)
	validateSubdomainUC := publishUC.NewValidateSubdomainUseCase(publishedSiteRepo)
	var snapshotGen publishUC.SnapshotGenerator
	var artifactStore publishUC.ArtifactStorage

	snapshotGenConcrete, err := publishinfra.NewNodeSnapshotGenerator(invitationRepo)
	if err != nil {
		logger.GetLogger().Warn("Publish snapshot generator not configured; publishing will fail", zap.Error(err))
		snapshotGen = &publishinfra.NoopSnapshotGenerator{}
	} else {
		snapshotGen = snapshotGenConcrete
	}

	switch cfg.Publishing.ArtifactStore {
	case "r2":
		r2Store, err := publishinfra.NewR2ArtifactStorage(ctx, publishinfra.R2Config{
			AccountID:       cfg.Publishing.R2AccountID,
			AccessKeyID:     cfg.Publishing.R2AccessKeyID,
			SecretAccessKey: cfg.Publishing.R2SecretAccessKey,
			Bucket:          cfg.Publishing.R2Bucket,
			PublicBase:      cfg.Publishing.R2PublicBase,
		})
		if err != nil {
			logger.GetLogger().Warn("R2 artifact storage not configured; publishing will fail", zap.Error(err))
			artifactStore = &publishinfra.NoopArtifactStorage{}
		} else {
			artifactStore = r2Store
		}
	default:
		artifactStoreConcrete, err := publishinfra.NewFilesystemArtifactStorage()
		if err != nil {
			logger.GetLogger().Warn("Filesystem artifact storage not configured; publishing will fail", zap.Error(err))
			artifactStore = &publishinfra.NoopArtifactStorage{}
		} else {
			artifactStore = artifactStoreConcrete
		}
	}
	publishInvitationUC := publishUC.NewPublishInvitationUseCase(invitationRepo, publishedSiteRepo, snapshotGen, artifactStore)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(registerUC, loginUC, getCurrentUserUC, googleOAuthUC, refreshTokenUC, refreshTokenRepo, jwtService, googleOAuthService, hmacKeys, cfg.Auth.RefreshTokenHMACActiveKeyID)
	invitationHandler := handlers.NewInvitationHandler(createInvitationUC, getInvitationByIDUC, getAllInvitationsUC, getInvitationPreviewUC, updateInvitationUC, deleteInvitationUC, migrateInvitationsUC)
	layoutHandler := handlers.NewLayoutHandler(getAllLayoutsUC, getLayoutByIDUC, getLayoutManifestUC, getManifestsUC)
	assetHandler := handlers.NewAssetHandler(uploadAssetUC, getAllAssetsUC, deleteAssetUC, fileStorage, gcsStorage)
	rsvpHandler := handlers.NewRSVPHandler(submitRSVPUC, getRSVPByInvitationUC)
	analyticsHandler := handlers.NewAnalyticsHandler(trackViewUC, getAnalyticsByInvitationUC)
	publishHandler := handlers.NewPublishHandler(validateSubdomainUC, publishInvitationUC, cfg.Publishing.BaseDomain, cfg.Server.Port)
	resolveHandler := handlers.NewPublishedSiteResolveHandler(publishedSiteRepo, cfg.Publishing.BaseDomain)
	resolveAPIHandler := handlers.NewPublishedResolveAPIHandler(publishedSiteRepo, cfg.Publishing.BaseDomain)

	// Setup router
	router := httpRouter.NewRouter(authHandler, invitationHandler, layoutHandler, assetHandler, rsvpHandler, analyticsHandler, publishHandler, resolveHandler, resolveAPIHandler, jwtService, cfg.Google.FrontendURL)
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
