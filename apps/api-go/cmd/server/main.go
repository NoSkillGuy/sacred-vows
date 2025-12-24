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
	"github.com/sacred-vows/api-go/internal/infrastructure/email"
	"github.com/sacred-vows/api-go/internal/infrastructure/observability"
	publishinfra "github.com/sacred-vows/api-go/internal/infrastructure/publish"
	"github.com/sacred-vows/api-go/internal/infrastructure/storage"
	"github.com/sacred-vows/api-go/internal/interfaces/clock"
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
	logger.GetLogger().Info("Initializing Firestore client...",
		zap.String("emulator_host", os.Getenv("FIRESTORE_EMULATOR_HOST")),
		zap.String("project_id", cfg.Database.ProjectID),
		zap.String("database_id", cfg.Database.DatabaseID))
	firestoreClient, err := firestore.NewFromEnv(ctx)
	if err != nil {
		logger.GetLogger().Fatal("Failed to connect to Firestore", zap.Error(err))
	}
	defer firestoreClient.Close()
	logger.GetLogger().Info("Firestore client initialized successfully")

	logger.GetLogger().Info("Using Firestore database", zap.String("project_id", cfg.Database.ProjectID), zap.String("database_id", cfg.Database.DatabaseID))

	// Run Firestore migrations with timeout
	logger.GetLogger().Info("Starting Firestore migrations...")
	migrationCtx, migrationCancel := context.WithTimeout(ctx, 30*time.Second)
	defer migrationCancel()
	if err := firestoreClient.RunMigrations(migrationCtx); err != nil {
		logger.GetLogger().Error("Failed to run Firestore migrations", zap.Error(err))
		// Log to stderr as well for visibility in Docker logs
		fmt.Fprintf(os.Stderr, "[MIGRATIONS] ERROR: Failed to run Firestore migrations: %v\n", err)
		// Continue anyway - migrations may have partially succeeded
		// But data migrations (like loading layouts) may fail
	} else {
		logger.GetLogger().Info("Firestore migrations completed successfully")
		fmt.Fprintf(os.Stderr, "[MIGRATIONS] Successfully completed all migrations\n")
	}

	// Initialize Firestore repositories
	var userRepo repository.UserRepository
	var invitationRepo repository.InvitationRepository
	var layoutRepo repository.LayoutRepository
	var assetRepo repository.AssetRepository
	var rsvpRepo repository.RSVPRepository
	var analyticsRepo repository.AnalyticsRepository
	var refreshTokenRepo repository.RefreshTokenRepository
	var passwordResetRepo repository.PasswordResetRepository
	var passwordChangeOTPRepo repository.PasswordChangeOTPRepository
	var publishedSiteRepo repository.PublishedSiteRepository
	var emailUsageRepo repository.EmailUsageRepository

	userRepo = firestore.NewUserRepository(firestoreClient)
	invitationRepo = firestore.NewInvitationRepository(firestoreClient)
	layoutRepo = firestore.NewLayoutRepository(firestoreClient)
	assetRepo = firestore.NewAssetRepository(firestoreClient)
	rsvpRepo = firestore.NewRSVPRepository(firestoreClient)
	analyticsRepo = firestore.NewAnalyticsRepository(firestoreClient)
	refreshTokenRepo = firestore.NewRefreshTokenRepository(firestoreClient)
	passwordResetRepo = firestore.NewPasswordResetRepository(firestoreClient)
	passwordChangeOTPRepo = firestore.NewPasswordChangeOTPRepository(firestoreClient)
	publishedSiteRepo = firestore.NewPublishedSiteRepository(firestoreClient)
	emailUsageRepo = firestore.NewEmailUsageRepository(firestoreClient)

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

	// Initialize email service
	emailService, err := email.NewEmailService(cfg.Email, emailUsageRepo)
	if err != nil {
		logger.GetLogger().Warn("Email service not configured; password reset will fail", zap.Error(err))
		// Continue anyway - email service is optional for other features
	}

	// Initialize storage (GCS for production, S3/MinIO for local)
	var fileStorage storage.Storage
	var gcsStorage storage.SignedURLStorage
	if cfg.Storage.GCSBucket != "" {
		// Production: GCS storage
		gcsStorageImpl, err := storage.NewGCSStorage(ctx, cfg.Storage.GCSBucket, "", cfg.Storage.MaxFileSize, cfg.Storage.AllowedTypes)
		if err != nil {
			logger.GetLogger().Fatal("Failed to initialize GCS storage", zap.Error(err))
		}
		fileStorage = gcsStorageImpl
		gcsStorage = gcsStorageImpl
		logger.GetLogger().Info("Using GCS storage", zap.String("bucket", cfg.Storage.GCSBucket))
	} else if cfg.Storage.S3Endpoint != "" && cfg.Storage.S3AccessKeyID != "" && cfg.Storage.S3SecretAccessKey != "" && cfg.Storage.S3Bucket != "" {
		// Local: S3-compatible storage (MinIO)
		s3StorageImpl, err := storage.NewS3Storage(ctx, storage.S3Config{
			AccessKeyID:     cfg.Storage.S3AccessKeyID,
			SecretAccessKey: cfg.Storage.S3SecretAccessKey,
			Bucket:          cfg.Storage.S3Bucket,
			Endpoint:        cfg.Storage.S3Endpoint,
			PublicEndpoint:  cfg.Storage.S3PublicEndpoint,
			Region:          cfg.Storage.S3Region,
		}, cfg.Storage.MaxFileSize, cfg.Storage.AllowedTypes)
		if err != nil {
			logger.GetLogger().Fatal("Failed to initialize S3 storage", zap.Error(err))
		}
		fileStorage = s3StorageImpl
		gcsStorage = s3StorageImpl
		logger.GetLogger().Info("Using S3-compatible storage",
			zap.String("bucket", cfg.Storage.S3Bucket),
			zap.String("endpoint", cfg.Storage.S3Endpoint))
	} else {
		logger.GetLogger().Fatal("Storage not configured. For production, set GCS_ASSETS_BUCKET. For local, configure S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ASSETS_BUCKET.")
	}

	// Initialize image processor if max dimensions or quality are configured
	var imageProcessor *storage.ImageProcessor
	if cfg.Storage.MaxImageWidth > 0 || cfg.Storage.MaxImageHeight > 0 || cfg.Storage.ImageQuality > 0 {
		imageProcessor = storage.NewImageProcessor(cfg.Storage.MaxImageWidth, cfg.Storage.MaxImageHeight, cfg.Storage.ImageQuality)
		logger.GetLogger().Info("Image processor enabled",
			zap.Int("maxWidth", cfg.Storage.MaxImageWidth),
			zap.Int("maxHeight", cfg.Storage.MaxImageHeight),
			zap.Int("quality", cfg.Storage.ImageQuality))
	}

	// Initialize use cases
	registerUC := authUC.NewRegisterUseCase(userRepo)
	loginUC := authUC.NewLoginUseCase(userRepo)
	getCurrentUserUC := authUC.NewGetCurrentUserUseCase(userRepo)
	deleteUserUC := authUC.NewDeleteUserUseCase(userRepo)
	googleOAuthUC := authUC.NewGoogleOAuthUseCaseWithService(userRepo, googleOAuthService.GetOAuthConfig(), googleOAuthService)

	// Initialize clock
	clk := clock.NewRealClock()

	hmacKeys := make([]auth.RefreshTokenHMACKey, 0, len(cfg.Auth.RefreshTokenHMACKeys))
	for _, k := range cfg.Auth.RefreshTokenHMACKeys {
		hmacKeys = append(hmacKeys, auth.RefreshTokenHMACKey{ID: k.ID, Key: k.Key})
	}
	refreshTokenUC := authUC.NewRefreshTokenUseCase(refreshTokenRepo, userRepo, jwtService, clk, hmacKeys, cfg.Auth.RefreshTokenHMACActiveKeyID)

	// Password reset use cases (only if email service is configured)
	var requestPasswordResetUC *authUC.RequestPasswordResetUseCase
	var resetPasswordUC *authUC.ResetPasswordUseCase
	var requestPasswordChangeOTPUC *authUC.RequestPasswordChangeOTPUseCase
	var verifyPasswordChangeOTPUC *authUC.VerifyPasswordChangeOTPUseCase
	if emailService != nil {
		requestPasswordResetUC = authUC.NewRequestPasswordResetUseCase(userRepo, passwordResetRepo, emailService, clk, cfg.Google.FrontendURL)
		resetPasswordUC = authUC.NewResetPasswordUseCase(passwordResetRepo, userRepo)
		requestPasswordChangeOTPUC = authUC.NewRequestPasswordChangeOTPUseCase(userRepo, passwordChangeOTPRepo, emailService, clk)
		verifyPasswordChangeOTPUC = authUC.NewVerifyPasswordChangeOTPUseCase(userRepo, passwordChangeOTPRepo)
	}

	createInvitationUC := invitation.NewCreateInvitationUseCase(invitationRepo, assetRepo)
	getInvitationByIDUC := invitation.NewGetInvitationByIDUseCase(invitationRepo)
	getAllInvitationsUC := invitation.NewGetAllInvitationsUseCase(invitationRepo)
	getInvitationPreviewUC := invitation.NewGetInvitationPreviewUseCase(invitationRepo)
	updateInvitationUC := invitation.NewUpdateInvitationUseCase(invitationRepo, assetRepo)
	migrateInvitationsUC := invitation.NewMigrateInvitationsUseCase(invitationRepo)

	getAllLayoutsUC := layout.NewGetAllLayoutsUseCase(layoutRepo)
	getLayoutByIDUC := layout.NewGetLayoutByIDUseCase(layoutRepo)
	getLayoutManifestUC := layout.NewGetLayoutManifestUseCase(layoutRepo)
	getManifestsUC := layout.NewGetManifestsUseCase(layoutRepo)

	uploadAssetUC := asset.NewUploadAssetUseCase(assetRepo, cfg.Storage.MaxFileSize, cfg.Storage.AllowedTypes)
	getAllAssetsUC := asset.NewGetAllAssetsUseCase(assetRepo)
	deleteAssetUC := asset.NewDeleteAssetUseCase(assetRepo)
	deleteAssetsByURLsUC := asset.NewDeleteAssetsByURLsUseCase(assetRepo)
	getAssetsByURLsUC := asset.NewGetAssetsByURLsUseCase(assetRepo)
	deleteInvitationUC := invitation.NewDeleteInvitationUseCase(invitationRepo, assetRepo, deleteAssetsByURLsUC)

	submitRSVPUC := rsvp.NewSubmitRSVPUseCase(rsvpRepo)
	getRSVPByInvitationUC := rsvp.NewGetRSVPByInvitationUseCase(rsvpRepo)

	trackViewUC := analytics.NewTrackViewUseCase(analyticsRepo)
	getAnalyticsByInvitationUC := analytics.NewGetAnalyticsByInvitationUseCase(analyticsRepo)

	// Publish use cases (wiring generator/storage happens later; defaults to noop)
	validateSubdomainUC := publishUC.NewValidateSubdomainUseCase(publishedSiteRepo)
	var snapshotGen publishUC.SnapshotGenerator
	var artifactStore publishUC.ArtifactStorage

	snapshotGenConcrete, err := publishinfra.NewNodeSnapshotGenerator(
		invitationRepo,
		cfg.Publishing.SnapshotRendererScript,
		cfg.Publishing.SnapshotRendererNode,
	)
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
			Endpoint:        cfg.Publishing.R2Endpoint,
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
	publishInvitationUC := publishUC.NewPublishInvitationUseCase(invitationRepo, publishedSiteRepo, snapshotGen, artifactStore, clk, cfg.Publishing.VersionRetentionCount)
	listVersionsUC := publishUC.NewListPublishedVersionsUseCase(publishedSiteRepo, artifactStore)
	rollbackUC := publishUC.NewRollbackPublishedSiteUseCase(publishedSiteRepo, artifactStore)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(registerUC, loginUC, getCurrentUserUC, deleteUserUC, googleOAuthUC, refreshTokenUC, requestPasswordResetUC, resetPasswordUC, requestPasswordChangeOTPUC, verifyPasswordChangeOTPUC, refreshTokenRepo, jwtService, googleOAuthService, hmacKeys, cfg.Auth.RefreshTokenHMACActiveKeyID)
	invitationHandler := handlers.NewInvitationHandler(createInvitationUC, getInvitationByIDUC, getAllInvitationsUC, getInvitationPreviewUC, updateInvitationUC, deleteInvitationUC, migrateInvitationsUC, fileStorage)
	layoutHandler := handlers.NewLayoutHandler(getAllLayoutsUC, getLayoutByIDUC, getLayoutManifestUC, getManifestsUC)
	assetHandler := handlers.NewAssetHandler(uploadAssetUC, getAllAssetsUC, deleteAssetUC, deleteAssetsByURLsUC, getAssetsByURLsUC, fileStorage, gcsStorage, cfg.Storage.SignedURLExpiration, imageProcessor)
	rsvpHandler := handlers.NewRSVPHandler(submitRSVPUC, getRSVPByInvitationUC)
	analyticsHandler := handlers.NewAnalyticsHandler(trackViewUC, getAnalyticsByInvitationUC)
	publishHandler := handlers.NewPublishHandler(validateSubdomainUC, publishInvitationUC, listVersionsUC, rollbackUC, cfg.Publishing.BaseDomain, cfg.Publishing.SubdomainSuffix, cfg.Server.Port)
	resolveHandler := handlers.NewPublishedSiteResolveHandler(publishedSiteRepo, cfg.Publishing.BaseDomain)
	resolveAPIHandler := handlers.NewPublishedResolveAPIHandler(publishedSiteRepo, cfg.Publishing.BaseDomain)

	// Initialize observability if enabled
	if cfg.Observability.Enabled {
		tracerCfg := observability.TracerConfig{
			Enabled:               cfg.Observability.Enabled,
			Endpoint:              cfg.Observability.ExporterEndpoint,
			Protocol:              cfg.Observability.ExporterProtocol,
			ServiceName:           cfg.Observability.ServiceName,
			ServiceVersion:        cfg.Observability.ServiceVersion,
			DeploymentEnvironment: cfg.Observability.DeploymentEnvironment,
			SamplingRate:          cfg.Observability.SamplingRate,
		}
		meterCfg := observability.MeterConfig{
			Enabled:               cfg.Observability.Enabled,
			Endpoint:              cfg.Observability.ExporterEndpoint,
			Protocol:              cfg.Observability.ExporterProtocol,
			ServiceName:           cfg.Observability.ServiceName,
			ServiceVersion:        cfg.Observability.ServiceVersion,
			DeploymentEnvironment: cfg.Observability.DeploymentEnvironment,
		}
		if err := observability.Init(ctx, tracerCfg, meterCfg); err != nil {
			logger.GetLogger().Error("Failed to initialize observability", zap.Error(err))
		} else {
			// Initialize metrics
			meter := observability.Meter("sacred-vows-api")
			if err := observability.InitMetrics(meter); err != nil {
				logger.GetLogger().Warn("Failed to initialize metrics", zap.Error(err))
			}
		}
	}

	// Setup router
	router := httpRouter.NewRouter(authHandler, invitationHandler, layoutHandler, assetHandler, rsvpHandler, analyticsHandler, publishHandler, resolveHandler, resolveAPIHandler, jwtService, cfg.Google.FrontendURL, cfg.Observability)
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

	// Shutdown observability (flush telemetry)
	if cfg.Observability.Enabled {
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		if err := observability.Shutdown(shutdownCtx); err != nil {
			logger.GetLogger().Warn("Failed to shutdown observability", zap.Error(err))
		}
	}

	logger.GetLogger().Info("Server exited")
}
