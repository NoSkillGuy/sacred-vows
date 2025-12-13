package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
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

	if len(migrations) == 0 {
		return fmt.Errorf("no migrations found in directory %s", migrationsDir)
	}

	// Get applied migrations
	applied, err := d.getAppliedMigrations(ctx, sqlDB)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Validate migration sequence to ensure no gaps
	if err := validateMigrationSequence(applied, migrations); err != nil {
		log.Error("Migration sequence validation failed", zap.Error(err))
		return fmt.Errorf("migration validation failed: %w", err)
	}

	// Run pending migrations
	nextExpectedVersion := getNextExpectedVersion(applied)
	for _, migration := range migrations {
		if applied[migration.Version] {
			log.Info("Migration already applied", zap.Int("version", migration.Version), zap.String("name", migration.Name))
			continue
		}

		// Validate that this migration is the next expected version
		if migration.Version != nextExpectedVersion {
			missingVersions := []int{}
			for v := nextExpectedVersion; v < migration.Version; v++ {
				if !applied[v] {
					missingVersions = append(missingVersions, v)
				}
			}
			errMsg := fmt.Sprintf(
				"cannot run migration %d (%s): expected version %d next, but found version %d",
				migration.Version,
				migration.Name,
				nextExpectedVersion,
				migration.Version,
			)
			if len(missingVersions) > 0 {
				errMsg += fmt.Sprintf(". Missing migrations: %v. Please run migrations in sequential order.", missingVersions)
			}
			log.Error("Migration version mismatch", zap.String("error", errMsg))
			return fmt.Errorf(errMsg)
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

		// Update next expected version after successful migration
		nextExpectedVersion = migration.Version + 1
		applied[migration.Version] = true

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

// getNextExpectedVersion returns the next expected migration version (max applied + 1)
// Returns 1 if no migrations have been applied yet
func getNextExpectedVersion(applied map[int]bool) int {
	if len(applied) == 0 {
		return 1
	}

	maxVersion := 0
	for version := range applied {
		if version > maxVersion {
			maxVersion = version
		}
	}

	return maxVersion + 1
}

// validateMigrationSequence checks for gaps in applied migrations and ensures
// migrations can run sequentially. Returns an error if gaps are detected.
func validateMigrationSequence(applied map[int]bool, migrations []Migration) error {
	if len(applied) == 0 {
		// No migrations applied yet, validation passes
		return nil
	}

	// Find the range of applied migrations
	minApplied := -1
	maxApplied := 0
	for version := range applied {
		if minApplied == -1 || version < minApplied {
			minApplied = version
		}
		if version > maxApplied {
			maxApplied = version
		}
	}

	// Check for gaps in applied migrations
	var missingVersions []int
	for v := minApplied; v <= maxApplied; v++ {
		if !applied[v] {
			missingVersions = append(missingVersions, v)
		}
	}

	if len(missingVersions) > 0 {
		return fmt.Errorf(
			"migration gap detected: versions %v are missing but versions before and after are applied. "+
				"This indicates migrations were run out of order. Please ensure all migrations run sequentially.",
			missingVersions,
		)
	}

	return nil
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
		baseName := strings.TrimSuffix(name, ext) // e.g., "001_initial_schema.up" or "001_initial_schema.down"
		// Extract direction from the last part (after the last dot)
		lastDotIndex := strings.LastIndex(baseName, ".")
		if lastDotIndex == -1 {
			continue
		}
		direction := baseName[lastDotIndex+1:] // e.g., "up" or "down"
		if direction != "up" && direction != "down" {
			continue
		}

		// Remove direction from baseName to get the version and name part
		namePart := baseName[:lastDotIndex] // e.g., "001_initial_schema"
		parts := strings.Split(namePart, "_")
		if len(parts) < 2 {
			continue
		}

		versionStr := parts[0]
		version, err := strconv.Atoi(versionStr)
		if err != nil {
			continue
		}

		// Get migration name (everything after version, all parts joined)
		migrationName := strings.Join(parts[1:], "_")

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
	dollarQuoteStartPos := -1 // Track where the dollar quote started

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
					dollarQuoteStartPos = current.Len()
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
			// Check if we've reached the closing tag by checking if current string ends with the dollar tag
			// But only if we've read content after the opening tag
			currentStr := current.String()
			if len(currentStr) > len(dollarTag) && strings.HasSuffix(currentStr, dollarTag) {
				// Make sure we're not just seeing the opening tag - check that we've read at least one char after it
				suffixStart := len(currentStr) - len(dollarTag)
				if suffixStart > dollarQuoteStartPos+len(dollarTag) {
					inDollarQuote = false
					dollarTag = ""
					dollarQuoteStartPos = -1
				}
			}
		} else {
			current.WriteByte(char)
			// If we hit a semicolon and we're not in a dollar quote, it's a statement boundary
			if char == ';' {
				stmt := strings.TrimSpace(current.String())
				if stmt != "" {
					// Remove leading comment lines but keep the actual SQL
					lines := strings.Split(stmt, "\n")
					var sqlLines []string
					for _, line := range lines {
						trimmed := strings.TrimSpace(line)
						if trimmed != "" && !strings.HasPrefix(trimmed, "--") {
							sqlLines = append(sqlLines, line)
						}
					}
					if len(sqlLines) > 0 {
						// Rejoin non-comment lines
						cleanStmt := strings.Join(sqlLines, "\n")
						statements = append(statements, cleanStmt)
					}
				}
				current.Reset()
			}
		}
	}

	// Add any remaining statement
	if remaining := strings.TrimSpace(current.String()); remaining != "" {
		// Remove leading comment lines but keep the actual SQL
		lines := strings.Split(remaining, "\n")
		var sqlLines []string
		for _, line := range lines {
			trimmed := strings.TrimSpace(line)
			if trimmed != "" && !strings.HasPrefix(trimmed, "--") {
				sqlLines = append(sqlLines, line)
			}
		}
		if len(sqlLines) > 0 {
			cleanStmt := strings.Join(sqlLines, "\n")
			statements = append(statements, cleanStmt)
		}
	}

	return statements
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
