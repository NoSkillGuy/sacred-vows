package firestore

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
)

// MigrationFunc represents a migration function
type MigrationFunc func(ctx context.Context, client *Client) error

// Migration represents a migration
type Migration struct {
	Version int
	Name    string
	Up      MigrationFunc
}

// RunMigrations runs pending Firestore migrations
func (c *Client) RunMigrations(ctx context.Context) error {
	log := logger.GetLogger()
	log.Info("Initializing migration process...")

	// Create migrations collection if it doesn't exist
	if err := c.createMigrationsCollection(ctx); err != nil {
		return fmt.Errorf("failed to create migrations collection: %w", err)
	}

	// Get applied migrations
	log.Info("Fetching applied migrations from Firestore...")
	applied, err := c.getAppliedMigrations(ctx)
	if err != nil {
		log.Error("Failed to get applied migrations", zap.Error(err))
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}
	log.Info("Retrieved applied migrations", zap.Int("count", len(applied)))

	// Get all migrations from registry
	migrations := getAllMigrations()
	log.Info("Found migrations in registry", zap.Int("total", len(migrations)))

	if len(migrations) == 0 {
		return fmt.Errorf("no migrations found")
	}

	// Validate migration sequence
	if err := validateMigrationSequence(applied, migrations); err != nil {
		log.Error("Migration sequence validation failed", zap.Error(err))
		return fmt.Errorf("migration validation failed: %w", err)
	}

	// Run pending migrations
	nextExpectedVersion := getNextExpectedVersion(applied)
	ranCount := 0
	skippedCount := 0
	for _, migration := range migrations {
		if applied[migration.Version] {
			log.Info("Migration already applied", zap.Int("version", migration.Version), zap.String("name", migration.Name))
			skippedCount++
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
			return fmt.Errorf("%s", errMsg)
		}

		log.Info("Running migration", zap.Int("version", migration.Version), zap.String("name", migration.Name))

		// Execute migration
		if err := migration.Up(ctx, c); err != nil {
			log.Error("Migration failed",
				zap.Int("version", migration.Version),
				zap.String("name", migration.Name),
				zap.Error(err))
			return fmt.Errorf("failed to execute migration %d (%s): %w", migration.Version, migration.Name, err)
		}

		// Record migration as applied
		now := time.Now()
		versionStr := fmt.Sprintf("%d", migration.Version)
		_, err := c.Collection("schema_migrations").Doc(versionStr).Set(ctx, map[string]interface{}{
			"version":    migration.Version,
			"name":       migration.Name,
			"applied_at": now,
		})
		if err != nil {
			log.Error("Failed to record migration",
				zap.Int("version", migration.Version),
				zap.String("name", migration.Name),
				zap.Error(err))
			return fmt.Errorf("failed to record migration %d: %w", migration.Version, err)
		}

		// Update next expected version after successful migration
		nextExpectedVersion = migration.Version + 1
		applied[migration.Version] = true
		ranCount++

		log.Info("Migration completed", zap.Int("version", migration.Version), zap.String("name", migration.Name))
	}

	log.Info("Migration process completed",
		zap.Int("total_migrations", len(migrations)),
		zap.Int("ran", ranCount),
		zap.Int("skipped", skippedCount))

	return nil
}

func (c *Client) createMigrationsCollection(ctx context.Context) error {
	log := logger.GetLogger()
	log.Info("Checking if schema_migrations collection exists...")

	// Check if schema_migrations collection exists by trying to read a document
	// If collection doesn't exist, this will just return empty, which is fine
	// We'll create it implicitly when we write the first migration record
	_, err := c.Collection("schema_migrations").Doc("_check").Get(ctx)
	if err != nil {
		log.Info("Collection doesn't exist yet, creating placeholder...")
		// Collection doesn't exist yet, create a placeholder document
		_, err = c.Collection("schema_migrations").Doc("_check").Set(ctx, map[string]interface{}{
			"created": time.Now(),
		})
		if err != nil {
			log.Error("Failed to create migrations collection", zap.Error(err))
			return fmt.Errorf("failed to create migrations collection: %w", err)
		}
		log.Info("Placeholder created, deleting it...")
		// Delete the placeholder
		_, _ = c.Collection("schema_migrations").Doc("_check").Delete(ctx)
		log.Info("Placeholder deleted")
	} else {
		log.Info("Collection already exists")
	}
	return nil
}

func (c *Client) getAppliedMigrations(ctx context.Context) (map[int]bool, error) {
	log := logger.GetLogger()
	log.Info("Querying schema_migrations collection...")
	iter := c.Collection("schema_migrations").Documents(ctx)
	log.Info("Got iterator, calling GetAll()...")
	docs, err := iter.GetAll()
	if err != nil {
		log.Error("Error getting documents from schema_migrations", zap.Error(err))
		// Collection might not exist yet, return empty map
		return make(map[int]bool), nil
	}
	log.Info("Successfully retrieved documents", zap.Int("count", len(docs)))

	applied := make(map[int]bool)
	for _, doc := range docs {
		// Skip placeholder document
		if doc.Ref.ID == "_check" {
			continue
		}
		data := doc.Data()
		if version, ok := data["version"].(int64); ok {
			applied[int(version)] = true
		}
	}

	return applied, nil
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

// validateMigrationSequence checks for gaps in applied migrations
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

// getAllMigrations returns all migrations in order
// Simplified for Firestore: only data seeding migrations are kept
// Firestore doesn't require schema migrations (collections are created automatically)
func getAllMigrations() []Migration {
	return []Migration{
		{Version: 1, Name: "load_layouts", Up: migration001LoadLayouts},                                   // Seeds classic-scroll and editorial-elegance layouts
		{Version: 2, Name: "create_password_reset_tokens", Up: migration002CreatePasswordResetTokens},     // Creates password_reset_tokens collection structure
		{Version: 3, Name: "add_editorial_elegance_presets", Up: migration003AddEditorialElegancePresets}, // Adds presets to existing editorial-elegance layouts
	}
}

// Migration 001: Load Layouts
// Seeds initial layout data into layouts collection
// Creates both classic-scroll and editorial-elegance layouts with correct paths and naming
// Layout IDs are defined as constants to ensure consistency across environments
func migration001LoadLayouts(ctx context.Context, client *Client) error {
	// Define canonical layout IDs - these must remain consistent across all environments
	const (
		classicScrollID     = "classic-scroll"
		editorialEleganceID = "editorial-elegance"
	)

	// Load both layouts directly (optimized for fresh Firestore setup)
	now := time.Now()

	configJSON := fmt.Sprintf(`{
  "id": "%s",
  "name": "Classic Scroll",
  "version": "1.0.0",
  "metadata": {
    "description": "Traditional single-column layout with elegant typography and centered content. Perfect for couples who appreciate classic design and formal celebrations.",
    "previewImage": "/layouts/classic-scroll/preview.jpg",
    "tags": ["elegant", "classic", "traditional"],
    "author": "Sacred Vows"
  },
  "sections": [
    {"id": "header", "enabled": true, "config": {}},
    {"id": "hero", "enabled": true, "config": {}},
    {"id": "couple", "enabled": true, "config": {}},
    {"id": "fathers-letter", "enabled": true, "config": {}},
    {"id": "gallery", "enabled": true, "config": {}},
    {"id": "events", "enabled": true, "config": {}},
    {"id": "venue", "enabled": true, "config": {}},
    {"id": "rsvp", "enabled": true, "config": {}},
    {"id": "footer", "enabled": true, "config": {}}
  ],
  "themes": [
    {
      "id": "royal-gold",
      "name": "Royal Gold",
      "isDefault": true,
      "colors": {
        "primary": "#d4af37",
        "secondary": "#8b6914",
        "background": "#fff8f0",
        "text": "#2c2c2c",
        "accent": "#c9a227"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "rose-blush",
      "name": "Rose Blush",
      "isDefault": false,
      "colors": {
        "primary": "#c77d8a",
        "secondary": "#9b5c6a",
        "background": "#fff5f7",
        "text": "#4a3539",
        "accent": "#e8b4b8"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Lato",
        "script": "Dancing Script"
      }
    },
    {
      "id": "ivory-cream",
      "name": "Ivory Cream",
      "isDefault": false,
      "colors": {
        "primary": "#a67c52",
        "secondary": "#8b6914",
        "background": "#fffef5",
        "text": "#3d3d3d",
        "accent": "#d4b896"
      },
      "fonts": {
        "heading": "Libre Baskerville",
        "body": "Inter",
        "script": "Alex Brush"
      }
    },
    {
      "id": "forest-sage",
      "name": "Forest Sage",
      "isDefault": false,
      "colors": {
        "primary": "#6b8e6b",
        "secondary": "#4a6f4a",
        "background": "#f5f8f5",
        "text": "#2c3c2c",
        "accent": "#8fbc8f"
      },
      "fonts": {
        "heading": "EB Garamond",
        "body": "Montserrat",
        "script": "Tangerine"
      }
    },
    {
      "id": "midnight-navy",
      "name": "Midnight Navy",
      "isDefault": false,
      "colors": {
        "primary": "#1e3a5f",
        "secondary": "#2c5282",
        "background": "#f7fafc",
        "text": "#1a202c",
        "accent": "#4299e1"
      },
      "fonts": {
        "heading": "Crimson Text",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "lavender-dream",
      "name": "Lavender Dream",
      "isDefault": false,
      "colors": {
        "primary": "#9b8bb4",
        "secondary": "#7a6a96",
        "background": "#f8f5fc",
        "text": "#3c3544",
        "accent": "#c4b5dc"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Lato",
        "script": "Dancing Script"
      }
    }
  ],
  "theme": {
    "preset": "royal-gold",
    "colors": {
      "primary": "#d4af37",
      "secondary": "#8b6914",
      "background": "#fff8f0",
      "text": "#2c2c2c",
      "accent": "#c9a227"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Poppins",
      "script": "Great Vibes"
    }
  }
}`, classicScrollID)

	manifestJSON := fmt.Sprintf(`{
  "id": "%s",
  "name": "Classic Scroll",
  "version": "1.0.0",
  "description": "Traditional single-column layout with elegant typography and centered content. Perfect for couples who appreciate classic design and formal celebrations.",
  "names": "Capt (Dr) Priya & Dr Saurabh",
  "date": "22 & 23 January 2026",
  "previewImage": "/layouts/classic-scroll/preview.jpg",
  "previewImages": [
    "/layouts/classic-scroll/preview-1.jpg",
    "/layouts/classic-scroll/preview-2.jpg"
  ],
  "tags": ["elegant", "classic", "traditional"],
  "category": "traditional",
  "author": "Sacred Vows",
  "price": 499,
  "currency": "INR",
  "status": "ready",
  "isAvailable": true,
  "isFeatured": true,
  "sections": [
    {"id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true},
    {"id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo and countdown", "icon": "🖼️", "required": false, "defaultEnabled": true},
    {"id": "couple", "name": "Couple Profile", "description": "Bride and groom information with photos", "icon": "💑", "required": false, "defaultEnabled": true},
    {"id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true},
    {"id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true},
    {"id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true},
    {"id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true},
    {"id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form and contacts", "icon": "💌", "required": false, "defaultEnabled": true},
    {"id": "footer", "name": "Footer", "description": "Closing message and credits", "icon": "🎀", "required": true, "defaultEnabled": true}
  ],
  "defaultSectionOrder": [
    "header",
    "hero",
    "couple",
    "fathers-letter",
    "gallery",
    "events",
    "venue",
    "rsvp",
    "footer"
  ],
  "themes": [
    {
      "id": "royal-gold",
      "name": "Royal Gold",
      "isDefault": true,
      "colors": {
        "primary": "#d4af37",
        "secondary": "#8b6914",
        "background": "#fff8f0",
        "text": "#2c2c2c",
        "accent": "#c9a227"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "rose-blush",
      "name": "Rose Blush",
      "isDefault": false,
      "colors": {
        "primary": "#c77d8a",
        "secondary": "#9b5c6a",
        "background": "#fff5f7",
        "text": "#4a3539",
        "accent": "#e8b4b8"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Lato",
        "script": "Dancing Script"
      }
    },
    {
      "id": "ivory-cream",
      "name": "Ivory Cream",
      "isDefault": false,
      "colors": {
        "primary": "#a67c52",
        "secondary": "#8b6914",
        "background": "#fffef5",
        "text": "#3d3d3d",
        "accent": "#d4b896"
      },
      "fonts": {
        "heading": "Libre Baskerville",
        "body": "Inter",
        "script": "Alex Brush"
      }
    },
    {
      "id": "forest-sage",
      "name": "Forest Sage",
      "isDefault": false,
      "colors": {
        "primary": "#6b8e6b",
        "secondary": "#4a6f4a",
        "background": "#f5f8f5",
        "text": "#2c3c2c",
        "accent": "#8fbc8f"
      },
      "fonts": {
        "heading": "EB Garamond",
        "body": "Montserrat",
        "script": "Tangerine"
      }
    },
    {
      "id": "midnight-navy",
      "name": "Midnight Navy",
      "isDefault": false,
      "colors": {
        "primary": "#1e3a5f",
        "secondary": "#2c5282",
        "background": "#f7fafc",
        "text": "#1a202c",
        "accent": "#4299e1"
      },
      "fonts": {
        "heading": "Crimson Text",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "lavender-dream",
      "name": "Lavender Dream",
      "isDefault": false,
      "colors": {
        "primary": "#9b8bb4",
        "secondary": "#7a6a96",
        "background": "#f8f5fc",
        "text": "#3c3544",
        "accent": "#c4b5dc"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Lato",
        "script": "Dancing Script"
      }
    }
  ]
}`, classicScrollID)

	// Create classic-scroll layout
	classicScrollDoc, err := client.Collection("layouts").Doc(classicScrollID).Get(ctx)
	if err == nil && classicScrollDoc.Exists() {
		// Layout already exists, skip (idempotent)
	} else {
		classicScrollData := map[string]interface{}{
			"id":            classicScrollID,
			"name":          "Classic Scroll",
			"description":   "Traditional single-column layout with elegant typography and centered content. Perfect for couples who appreciate classic design and formal celebrations.",
			"preview_image": "/layouts/classic-scroll/preview.jpg",
			"tags":          []string{"elegant", "classic", "traditional"},
			"version":       "1.0.0",
			"config":        configJSON,
			"manifest":      manifestJSON,
			"is_active":     true,
			"created_at":    now,
			"updated_at":    now,
		}

		_, err = client.Collection("layouts").Doc(classicScrollID).Set(ctx, classicScrollData)
		if err != nil {
			return fmt.Errorf("failed to create classic-scroll layout: %w", err)
		}
	}

	// Create editorial-elegance layout
	editorialEleganceConfigJSON := fmt.Sprintf(`{
  "id": "%s",
  "name": "Editorial Elegance",
  "version": "1.0.0",
  "metadata": {
    "description": "Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.",
    "previewImage": "/layouts/editorial-elegance/preview.jpg",
    "tags": ["luxury", "minimal", "editorial", "modern", "premium", "magazine"],
    "author": "Sacred Vows",
    "category": "Modern",
    "featured": true,
    "status": "ready"
  },
  "sections": [
    {"id": "hero", "name": "Editorial Cover", "icon": "📰", "description": "Full-height hero with image or video background", "required": true, "enabled": true, "order": 0, "config": {"alignment": "center", "mediaType": "image"}},
    {"id": "editorial-intro", "name": "Editorial Intro", "icon": "✍️", "description": "Magazine-style opening paragraph with portrait", "required": false, "enabled": true, "order": 1, "config": {"layout": "two-column"}},
    {"id": "couple", "name": "The Couple", "icon": "💑", "description": "Bride and groom photos and names", "required": false, "enabled": false, "order": 2, "config": {}},
    {"id": "events", "name": "Event Schedule", "icon": "📅", "description": "Horizontal card-based event schedule", "required": false, "enabled": true, "order": 3, "config": {}},
    {"id": "wedding-party", "name": "Wedding Party", "icon": "👥", "description": "Optional party members (bridesmaids, groomsmen, etc.)", "required": false, "enabled": false, "order": 4, "config": {"showBios": false, "filter": "bw"}},
    {"id": "location", "name": "Location", "icon": "📍", "description": "Venue details with embedded map", "required": false, "enabled": true, "order": 5, "config": {"mapStyle": "desaturated"}},
    {"id": "gallery", "name": "Gallery", "icon": "🖼️", "description": "Editorial-style masonry or single-column gallery (8-12 images)", "required": false, "enabled": true, "order": 6, "config": {"layout": "masonry", "maxImages": 12}},
    {"id": "rsvp", "name": "RSVP", "icon": "✉️", "description": "Ultra-minimal centered RSVP form", "required": false, "enabled": true, "order": 7, "config": {}},
    {"id": "footer", "name": "Footer", "icon": "📄", "description": "Minimal footer with couple names", "required": true, "enabled": true, "order": 8, "config": {}}
  ],
  "themes": [
    {
      "id": "editorial-classic",
      "name": "Editorial Classic",
      "isDefault": true,
      "colors": {
        "primary": "#C6A15B",
        "background": "#FAF9F7",
        "text": "#1C1C1C",
        "accent": "#C6A15B",
        "secondary": "#6B6B6B",
        "divider": "#E6E6E6"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      },
      "typography": {
        "heroNames": "80px",
        "sectionHeadings": "42px",
        "subHeadings": "24px",
        "bodyText": "18px",
        "metaText": "14px",
        "letterSpacing": {"metaText": "0.1em"}
      }
    },
    {
      "id": "warm-editorial",
      "name": "Warm Editorial",
      "isDefault": false,
      "colors": {
        "primary": "#B8956A",
        "background": "#FAF7F2",
        "text": "#2C2416",
        "accent": "#B8956A",
        "secondary": "#7C7265",
        "divider": "#E8E4DE"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    },
    {
      "id": "cool-editorial",
      "name": "Cool Editorial",
      "isDefault": false,
      "colors": {
        "primary": "#94A3B8",
        "background": "#F9FAFB",
        "text": "#1A1D23",
        "accent": "#94A3B8",
        "secondary": "#64748B",
        "divider": "#E2E8F0"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    }
  ],
  "features": {
    "videoHero": true,
    "imageFilters": true,
    "embeddedMaps": true,
    "masonryGallery": true,
    "minimalAnimations": true,
    "premiumFonts": false
  }
}`, editorialEleganceID)

	editorialEleganceManifestJSON := fmt.Sprintf(`{
  "id": "%s",
  "name": "Editorial Elegance",
  "version": "1.0.0",
  "description": "Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.",
  "previewImage": "/layouts/editorial-elegance/preview.jpg",
  "previewImages": [
    "/layouts/editorial-elegance/preview-1.jpg",
    "/layouts/editorial-elegance/preview-2.jpg"
  ],
  "tags": ["luxury", "minimal", "editorial", "modern", "premium", "magazine"],
  "category": "Modern",
  "author": "Sacred Vows",
  "price": 0,
  "currency": "INR",
  "status": "ready",
  "isAvailable": true,
  "isFeatured": true,
  "sections": [
    {"id": "hero", "name": "Editorial Cover", "description": "Full-height hero with image or video background", "icon": "📰", "required": true, "defaultEnabled": true},
    {"id": "editorial-intro", "name": "Editorial Intro", "description": "Magazine-style opening paragraph with portrait", "icon": "✍️", "required": false, "defaultEnabled": true},
    {"id": "couple", "name": "The Couple", "description": "Bride and groom photos and names", "icon": "💑", "required": false, "defaultEnabled": false},
    {"id": "events", "name": "Event Schedule", "description": "Horizontal card-based event schedule", "icon": "📅", "required": false, "defaultEnabled": true},
    {"id": "wedding-party", "name": "Wedding Party", "description": "Optional party members (bridesmaids, groomsmen, etc.)", "icon": "👥", "required": false, "defaultEnabled": false},
    {"id": "location", "name": "Location", "description": "Venue details with embedded map", "icon": "📍", "required": false, "defaultEnabled": true},
    {"id": "gallery", "name": "Gallery", "description": "Editorial-style masonry or single-column gallery (8-12 images)", "icon": "🖼️", "required": false, "defaultEnabled": true},
    {"id": "rsvp", "name": "RSVP", "description": "Ultra-minimal centered RSVP form", "icon": "✉️", "required": false, "defaultEnabled": true},
    {"id": "footer", "name": "Footer", "description": "Minimal footer with couple names", "icon": "📄", "required": true, "defaultEnabled": true}
  ],
  "defaultSectionOrder": [
    "hero",
    "editorial-intro",
    "couple",
    "events",
    "wedding-party",
    "location",
    "gallery",
    "rsvp",
    "footer"
  ],
  "themes": [
    {
      "id": "editorial-classic",
      "name": "Editorial Classic",
      "isDefault": true,
      "colors": {
        "primary": "#C6A15B",
        "background": "#FAF9F7",
        "text": "#1C1C1C",
        "accent": "#C6A15B",
        "secondary": "#6B6B6B"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    },
    {
      "id": "warm-editorial",
      "name": "Warm Editorial",
      "isDefault": false,
      "colors": {
        "primary": "#B8956A",
        "background": "#FAF7F2",
        "text": "#2C2416",
        "accent": "#B8956A",
        "secondary": "#7C7265"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    },
    {
      "id": "cool-editorial",
      "name": "Cool Editorial",
      "isDefault": false,
      "colors": {
        "primary": "#94A3B8",
        "background": "#F9FAFB",
        "text": "#1A1D23",
        "accent": "#94A3B8",
        "secondary": "#64748B"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    }
  ],
  "presets": [
    {
      "id": "modern-editorial",
      "name": "Modern Editorial",
      "emoji": "🖤",
      "description": "Minimal & Luxe",
      "useCase": "For couples who want elegance, restraint, and strong visual impact.",
      "bestFor": "City weddings, intimate guest lists, design-forward couples",
      "sectionIds": ["hero", "countdown", "quote", "editorial-intro", "couple", "events", "location", "gallery", "rsvp", "footer"]
    },
    {
      "id": "love-story-feature",
      "name": "Love Story Feature",
      "emoji": "🤍",
      "description": "Romantic & Narrative",
      "useCase": "Feels like a full magazine wedding spread. Perfect for couples who love storytelling.",
      "bestFor": "Couples who love storytelling, emotional depth, destination weddings",
      "sectionIds": ["hero", "quote", "editorial-intro", "story", "couple", "wedding-party", "events", "location", "travel", "things-to-do", "gallery", "dress-code", "rsvp", "footer"]
    },
    {
      "id": "guest-experience",
      "name": "Guest Experience",
      "emoji": "✨",
      "description": "Clean & Thoughtful",
      "useCase": "Designed around guest clarity without killing elegance.",
      "bestFor": "Larger weddings, mixed-age guests, practical planners",
      "sectionIds": ["hero", "countdown", "editorial-intro", "events", "location", "travel", "dress-code", "faq", "registry", "gallery", "rsvp", "contact", "footer"]
    }
  ]
}`, editorialEleganceID)

	editorialEleganceDoc, err := client.Collection("layouts").Doc(editorialEleganceID).Get(ctx)
	if err == nil && editorialEleganceDoc.Exists() {
		// Layout already exists, update manifest to include presets
		_, err = client.Collection("layouts").Doc(editorialEleganceID).Update(ctx, []firestore.Update{
			{Path: "manifest", Value: editorialEleganceManifestJSON},
			{Path: "updated_at", Value: now},
		})
		if err != nil {
			return fmt.Errorf("failed to update editorial-elegance layout manifest: %w", err)
		}
		return nil
	}

	editorialEleganceData := map[string]interface{}{
		"id":            editorialEleganceID,
		"name":          "Editorial Elegance",
		"description":   "Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.",
		"preview_image": "/layouts/editorial-elegance/preview.jpg",
		"tags":          []string{"luxury", "minimal", "editorial", "modern", "premium", "magazine"},
		"version":       "1.0.0",
		"config":        editorialEleganceConfigJSON,
		"manifest":      editorialEleganceManifestJSON,
		"is_active":     true,
		"created_at":    now,
		"updated_at":    now,
	}

	_, err = client.Collection("layouts").Doc(editorialEleganceID).Set(ctx, editorialEleganceData)
	if err != nil {
		return fmt.Errorf("failed to create editorial-elegance layout: %w", err)
	}

	return nil
}

// Migration 002: Create Password Reset Tokens Collection
// Firestore creates collections automatically, but this migration documents the collection structure
// and ensures the collection exists. Indexes should be created in Firebase Console:
// - Single-field index on "token_hash" for lookups
// - Single-field index on "expires_at" for cleanup queries
func migration002CreatePasswordResetTokens(ctx context.Context, client *Client) error {
	// Firestore creates collections automatically when first document is written
	// This migration just ensures the collection structure is documented
	// The collection will be created when the first password reset token is stored

	// Create a placeholder document to ensure collection exists, then delete it
	placeholderID := "_schema_placeholder"
	placeholderData := map[string]interface{}{
		"id":         placeholderID,
		"user_id":    "_schema",
		"token_hash": "_schema",
		"expires_at": time.Now().Add(24 * time.Hour),
		"used":       false,
		"created_at": time.Now(),
		"_note":      "This is a schema placeholder. Collection structure: id (string), user_id (string), token_hash (string), expires_at (timestamp), used (boolean), created_at (timestamp). Indexes needed: token_hash (single-field), expires_at (single-field).",
	}

	_, err := client.Collection("password_reset_tokens").Doc(placeholderID).Set(ctx, placeholderData)
	if err != nil {
		return fmt.Errorf("failed to create password_reset_tokens collection: %w", err)
	}

	// Delete the placeholder
	_, err = client.Collection("password_reset_tokens").Doc(placeholderID).Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete schema placeholder: %w", err)
	}

	return nil
}

// Migration 003: Add Presets to Editorial Elegance Layout
// Updates existing editorial-elegance layouts to include presets in their manifest
func migration003AddEditorialElegancePresets(ctx context.Context, client *Client) error {
	const editorialEleganceID = "editorial-elegance"

	// Get existing layout
	doc, err := client.Collection("layouts").Doc(editorialEleganceID).Get(ctx)
	if err != nil {
		// Layout doesn't exist, nothing to update
		return nil
	}

	if !doc.Exists() {
		// Layout doesn't exist, nothing to update
		return nil
	}

	// Get current manifest
	data := doc.Data()
	manifestStr, ok := data["manifest"].(string)
	if !ok || manifestStr == "" {
		// No manifest to update
		return nil
	}

	// Parse existing manifest to check if presets already exist
	var manifest map[string]interface{}
	if err := json.Unmarshal([]byte(manifestStr), &manifest); err != nil {
		return fmt.Errorf("failed to parse existing manifest: %w", err)
	}

	// Check if presets already exist
	if presets, ok := manifest["presets"].([]interface{}); ok && len(presets) > 0 {
		// Presets already exist, skip update
		return nil
	}

	// Add presets to manifest
	manifest["presets"] = []map[string]interface{}{
		{
			"id":          "modern-editorial",
			"name":        "Modern Editorial",
			"emoji":       "🖤",
			"description": "Minimal & Luxe",
			"useCase":     "For couples who want elegance, restraint, and strong visual impact.",
			"bestFor":     "City weddings, intimate guest lists, design-forward couples",
			"sectionIds":  []string{"hero", "countdown", "quote", "editorial-intro", "couple", "events", "location", "gallery", "rsvp", "footer"},
		},
		{
			"id":          "love-story-feature",
			"name":        "Love Story Feature",
			"emoji":       "🤍",
			"description": "Romantic & Narrative",
			"useCase":     "Feels like a full magazine wedding spread. Perfect for couples who love storytelling.",
			"bestFor":     "Couples who love storytelling, emotional depth, destination weddings",
			"sectionIds":  []string{"hero", "quote", "editorial-intro", "story", "couple", "wedding-party", "events", "location", "travel", "things-to-do", "gallery", "dress-code", "rsvp", "footer"},
		},
		{
			"id":          "guest-experience",
			"name":        "Guest Experience",
			"emoji":       "✨",
			"description": "Clean & Thoughtful",
			"useCase":     "Designed around guest clarity without killing elegance.",
			"bestFor":     "Larger weddings, mixed-age guests, practical planners",
			"sectionIds":  []string{"hero", "countdown", "editorial-intro", "events", "location", "travel", "dress-code", "faq", "registry", "gallery", "rsvp", "contact", "footer"},
		},
	}

	// Marshal updated manifest
	updatedManifestJSON, err := json.Marshal(manifest)
	if err != nil {
		return fmt.Errorf("failed to marshal updated manifest: %w", err)
	}

	// Update the layout document
	_, err = client.Collection("layouts").Doc(editorialEleganceID).Update(ctx, []firestore.Update{
		{Path: "manifest", Value: string(updatedManifestJSON)},
		{Path: "updated_at", Value: time.Now()},
	})
	if err != nil {
		return fmt.Errorf("failed to update editorial-elegance layout manifest: %w", err)
	}

	return nil
}
