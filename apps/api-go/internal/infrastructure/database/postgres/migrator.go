package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Migration represents a migration file
type Migration struct {
	Version int
	Name    string
	UpSQL   string
	DownSQL string
}

// RunMigrations runs pending SQL migrations from the migrations directory
func (d *DB) RunMigrations(ctx context.Context, migrationsDir string) error {
	log := logger.GetLogger()

	// Get underlying sql.DB
	sqlDB, err := d.DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// Create migrations table if it doesn't exist
	if err := d.createMigrationsTable(ctx, sqlDB); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Load migration files
	migrations, err := loadMigrations(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	// Get applied migrations
	applied, err := d.getAppliedMigrations(ctx, sqlDB)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Run pending migrations
	for _, migration := range migrations {
		if applied[migration.Version] {
			log.Info("Migration already applied", zap.Int("version", migration.Version), zap.String("name", migration.Name))
			continue
		}

		log.Info("Running migration", zap.Int("version", migration.Version), zap.String("name", migration.Name))

		// Run SQL migration in a transaction
		tx, err := sqlDB.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("failed to begin transaction: %w", err)
		}

		// Execute up migration
		// PostgreSQL ExecContext can handle multiple statements separated by semicolons
		// But for better error reporting, we'll split and execute individually
		statements := splitSQLStatements(migration.UpSQL)
		executedCount := 0
		for i, stmt := range statements {
			stmt = strings.TrimSpace(stmt)
			if stmt == "" {
				continue
			}
			// Skip comment-only statements
			stmtLines := strings.Split(stmt, "\n")
			hasNonComment := false
			for _, line := range stmtLines {
				trimmed := strings.TrimSpace(line)
				if trimmed != "" && !strings.HasPrefix(trimmed, "--") {
					hasNonComment = true
					break
				}
			}
			if !hasNonComment {
				continue
			}

			if _, err := tx.ExecContext(ctx, stmt); err != nil {
				tx.Rollback()
				log.Error("Migration statement failed",
					zap.Int("version", migration.Version),
					zap.Int("statement", i+1),
					zap.String("preview", stmt[:min(200, len(stmt))]),
					zap.Error(err))
				return fmt.Errorf("failed to execute migration %d, statement %d: %w", migration.Version, i+1, err)
			}
			executedCount++
		}
		log.Info("Migration statements executed", zap.Int("version", migration.Version), zap.Int("count", executedCount))

		// Record migration as applied
		if _, err := tx.ExecContext(ctx,
			"INSERT INTO schema_migrations (version, name) VALUES ($1, $2)",
			migration.Version, migration.Name); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %d: %w", migration.Version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %d: %w", migration.Version, err)
		}

		log.Info("Migration completed", zap.Int("version", migration.Version), zap.String("name", migration.Name))
	}

	return nil
}

func (d *DB) createMigrationsTable(ctx context.Context, sqlDB *sql.DB) error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`
	_, err := sqlDB.ExecContext(ctx, query)
	return err
}

func (d *DB) getAppliedMigrations(ctx context.Context, sqlDB *sql.DB) (map[int]bool, error) {
	rows, err := sqlDB.QueryContext(ctx, "SELECT version FROM schema_migrations")
	if err != nil {
		// Table might not exist yet, return empty map
		return make(map[int]bool), nil
	}
	defer rows.Close()

	applied := make(map[int]bool)
	for rows.Next() {
		var version int
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		applied[version] = true
	}

	return applied, rows.Err()
}

func loadMigrations(migrationsDir string) ([]Migration, error) {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	migrationMap := make(map[int]*Migration)

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		ext := filepath.Ext(name)
		if ext != ".sql" {
			continue
		}

		// Parse version and direction from filename: 001_name.up.sql or 001_name.down.sql
		baseName := strings.TrimSuffix(name, ext)
		parts := strings.Split(baseName, "_")
		if len(parts) < 2 {
			continue
		}

		versionStr := parts[0]
		version, err := strconv.Atoi(versionStr)
		if err != nil {
			continue
		}

		direction := parts[len(parts)-1] // "up" or "down"
		if direction != "up" && direction != "down" {
			continue
		}

		// Get migration name (everything between version and direction)
		migrationName := strings.Join(parts[1:len(parts)-1], "_")

		// Read migration file
		content, err := os.ReadFile(filepath.Join(migrationsDir, name))
		if err != nil {
			return nil, fmt.Errorf("failed to read migration file %s: %w", name, err)
		}

		if migrationMap[version] == nil {
			migrationMap[version] = &Migration{
				Version: version,
				Name:    migrationName,
			}
		}

		if direction == "up" {
			migrationMap[version].UpSQL = string(content)
		} else {
			migrationMap[version].DownSQL = string(content)
		}
	}

	// Convert map to sorted slice
	migrations := make([]Migration, 0, len(migrationMap))
	for _, m := range migrationMap {
		if m.UpSQL == "" {
			continue // Skip migrations without up SQL
		}
		migrations = append(migrations, *m)
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

// splitSQLStatements splits SQL into individual statements, respecting dollar-quoted strings
func splitSQLStatements(sql string) []string {
	var statements []string
	var current strings.Builder
	var dollarTag string
	inDollarQuote := false

	// Process character by character to properly handle dollar quotes
	for i := 0; i < len(sql); i++ {
		char := sql[i]

		// Check for dollar quote start/end
		if char == '$' && !inDollarQuote {
			// Look for the tag end ($tag$)
			tagStart := i
			for j := i + 1; j < len(sql); j++ {
				if sql[j] == '$' {
					dollarTag = sql[tagStart : j+1]
					inDollarQuote = true
					current.WriteString(dollarTag)
					i = j
					break
				}
			}
			if !inDollarQuote {
				current.WriteByte(char)
			}
		} else if inDollarQuote {
			current.WriteByte(char)
			// Check if we've reached the closing tag
			if i+1 >= len(dollarTag) && strings.HasSuffix(current.String(), dollarTag) {
				inDollarQuote = false
				dollarTag = ""
			}
		} else {
			current.WriteByte(char)
			// If we hit a semicolon and we're not in a dollar quote, it's a statement boundary
			if char == ';' {
				stmt := strings.TrimSpace(current.String())
				if stmt != "" && !strings.HasPrefix(strings.TrimSpace(stmt), "--") {
					statements = append(statements, stmt)
				}
				current.Reset()
			}
		}
	}

	// Add any remaining statement
	if remaining := strings.TrimSpace(current.String()); remaining != "" {
		statements = append(statements, remaining)
	}

	return statements
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// MigrateLayoutsFromFiles migrates layouts from file system to database
func MigrateLayoutsFromFiles(ctx context.Context, db *gorm.DB, layoutsDir string, layoutRepo repository.LayoutRepository) error {
	log := logger.GetLogger()

	// Check if templates table is empty
	var count int64
	if err := db.WithContext(ctx).Model(&TemplateModel{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to check layouts count: %w", err)
	}

	if count > 0 {
		log.Info("Layouts already exist in database, skipping migration")
		return nil
	}

	log.Info("Starting layout migration from files", zap.String("layoutsDir", layoutsDir))

	entries, err := os.ReadDir(layoutsDir)
	if err != nil {
		return fmt.Errorf("failed to read layouts directory: %w", err)
	}

	successCount := 0
	errorCount := 0

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		layoutID := entry.Name()
		layoutPath := filepath.Join(layoutsDir, layoutID)

		// Check if manifest.json exists
		manifestPath := filepath.Join(layoutPath, "manifest.json")
		configPath := filepath.Join(layoutPath, "config.json")

		manifestData, err := os.ReadFile(manifestPath)
		if err != nil {
			log.Warn("Skipping layout (manifest.json not found)", zap.String("layoutId", layoutID))
			errorCount++
			continue
		}

		// Read config.json (optional)
		var configData []byte
		if _, err := os.Stat(configPath); err == nil {
			configData, err = os.ReadFile(configPath)
			if err != nil {
				log.Warn("Config.json exists but could not be read", zap.String("layoutId", layoutID), zap.Error(err))
			}
		}

		// Parse manifest to extract basic fields
		var manifest map[string]interface{}
		if err := json.Unmarshal(manifestData, &manifest); err != nil {
			log.Warn("Failed to parse manifest.json", zap.String("layoutId", layoutID), zap.Error(err))
			errorCount++
			continue
		}

		// Extract layout fields
		name := layoutID
		if nameStr, ok := manifest["name"].(string); ok {
			name = nameStr
		}

		var description *string
		if desc, ok := manifest["description"].(string); ok {
			description = &desc
		}

		var previewImage *string
		if preview, ok := manifest["previewImage"].(string); ok {
			previewImage = &preview
		}

		var tags []string
		if tagsArr, ok := manifest["tags"].([]interface{}); ok {
			for _, tag := range tagsArr {
				if tagStr, ok := tag.(string); ok {
					tags = append(tags, tagStr)
				}
			}
		}

		version := "1.0.0"
		if versionStr, ok := manifest["version"].(string); ok {
			version = versionStr
		}

		// Create domain layout
		manifestRaw := json.RawMessage(manifestData)
		var configRaw *json.RawMessage
		if len(configData) > 0 {
			configRawVal := json.RawMessage(configData)
			configRaw = &configRawVal
		}

		layout := &domain.Layout{
			ID:           layoutID,
			Name:         name,
			Description:  description,
			PreviewImage: previewImage,
			Tags:         tags,
			Version:      version,
			Config:       configRaw,
			Manifest:     &manifestRaw,
			IsActive:     true,
		}

		// Check if layout already exists
		existing, err := layoutRepo.FindByID(ctx, layoutID)
		if err != nil {
			log.Warn("Error checking for existing layout", zap.String("layoutId", layoutID), zap.Error(err))
			errorCount++
			continue
		}

		if existing != nil {
			log.Info("Layout already exists, skipping", zap.String("layoutId", layoutID))
			continue
		}

		// Insert layout
		if err := layoutRepo.Create(ctx, layout); err != nil {
			log.Warn("Failed to create layout", zap.String("layoutId", layoutID), zap.Error(err))
			errorCount++
			continue
		}

		successCount++
		log.Info("Migrated layout", zap.String("layoutId", layoutID))
	}

	log.Info("Layout migration completed",
		zap.Int("success", successCount),
		zap.Int("errors", errorCount))

	return nil
}
