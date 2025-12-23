package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	"github.com/sacred-vows/api-go/internal/infrastructure/database/firestore"
	"github.com/sacred-vows/api-go/internal/usecase/asset"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	dryRun := flag.Bool("dry-run", false, "Preview what would be deleted without actually deleting")
	flag.Parse()

	// Initialize logger
	if err := logger.Init(); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.GetLogger().Sync()

	// Load configuration
	_, err := config.Load()
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

	// Initialize repositories
	assetRepo := firestore.NewAssetRepository(firestoreClient)

	// Initialize use case
	cleanupUC := asset.NewCleanupOrphanedAssetsUseCase(assetRepo)

	// Run cleanup
	logger.GetLogger().Info("Starting orphaned asset cleanup", zap.Bool("dryRun", *dryRun))

	output, err := cleanupUC.Execute(ctx, asset.CleanupOrphanedAssetsInput{
		DryRun: *dryRun,
	})

	if err != nil {
		logger.GetLogger().Fatal("Cleanup failed", zap.Error(err))
	}

	// Print results
	fmt.Printf("\n=== Cleanup Results ===\n")
	fmt.Printf("Orphaned in DB: %d\n", len(output.OrphanedAssets.OrphanedInDB))
	fmt.Printf("Orphaned in Storage: %d\n", len(output.OrphanedAssets.OrphanedInStorage))
	
	if *dryRun {
		fmt.Printf("\n[DRY RUN] No files were deleted\n")
	} else {
		fmt.Printf("Deleted from DB: %d\n", len(output.DeletedFromDB))
		fmt.Printf("Deleted from Storage: %d\n", len(output.DeletedFromStorage))
	}

	if len(output.Errors) > 0 {
		fmt.Printf("\nErrors:\n")
		for _, err := range output.Errors {
			fmt.Printf("  - %s\n", err)
		}
	}

	logger.GetLogger().Info("Cleanup completed")
}

