package config

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server     ServerConfig
	Database   DatabaseConfig
	Auth       AuthConfig
	Storage    StorageConfig
	Google     GoogleConfig
	Publishing PublishingConfig
}

type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type DatabaseConfig struct {
	ProjectID  string
	DatabaseID string
}

type AuthConfig struct {
	JWTSecret                   string
	JWTAccessExpiration         time.Duration // Short-lived access token (default: 15 minutes)
	JWTRefreshExpiration        time.Duration // Long-lived refresh token (default: 30 days)
	JWTIssuer                   string        // JWT issuer claim (default: "sacred-vows-api")
	JWTAudience                 string        // JWT audience claim (default: "sacred-vows-client")
	ClockSkewTolerance          time.Duration // Clock skew tolerance (default: 60 seconds)
	RefreshTokenHMACKeys        []RefreshTokenHMACKey
	RefreshTokenHMACActiveKeyID int16
}

type RefreshTokenHMACKey struct {
	ID     int16  `json:"id"`
	KeyB64 string `json:"key_b64"`

	// Decoded key bytes (not serialized)
	Key []byte `json:"-"`
}

type StorageConfig struct {
	UploadPath   string
	MaxFileSize  int64
	AllowedTypes []string
}

type GoogleConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	FrontendURL  string
}

type PublishingConfig struct {
	BaseDomain    string
	ArtifactStore string // filesystem|r2

	// R2 (S3-compatible)
	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2Bucket          string
	R2PublicBase      string

	// Version retention: number of versions to keep (default: 3)
	VersionRetentionCount int
}

func Load() (*Config, error) {
	// Load .env file if it exists.
	// We try a few common locations to avoid surprises with working directory.
	if err := loadDotEnv(); err != nil {
		return nil, err
	}

	config := &Config{
		Server: ServerConfig{
			Port:         getEnv("PORT", "3000"),
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
		},
		Database: DatabaseConfig{
			ProjectID:  getEnv("GCP_PROJECT_ID", ""),
			DatabaseID: getEnv("FIRESTORE_DATABASE", "(default)"),
		},
		Auth: AuthConfig{
			JWTSecret:                   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			JWTAccessExpiration:         parseDuration(getEnv("JWT_ACCESS_EXPIRATION", "15m"), 15*time.Minute),
			JWTRefreshExpiration:        parseDuration(getEnv("JWT_REFRESH_EXPIRATION", "30d"), 30*24*time.Hour),
			JWTIssuer:                   getEnv("JWT_ISSUER", "sacred-vows-api"),
			JWTAudience:                 getEnv("JWT_AUDIENCE", "sacred-vows-client"),
			ClockSkewTolerance:          parseDuration(getEnv("JWT_CLOCK_SKEW", "60s"), 60*time.Second),
			RefreshTokenHMACActiveKeyID: int16(getEnvAsInt("REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID", 1)),
		},
		Storage: StorageConfig{
			UploadPath:   getEnv("UPLOAD_PATH", "./uploads"),
			MaxFileSize:  10 * 1024 * 1024, // 10MB
			AllowedTypes: []string{"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"},
		},
		Google: GoogleConfig{
			ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
			ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
			RedirectURI:  getEnv("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/google/callback"),
			FrontendURL:  getEnv("FRONTEND_URL", "http://localhost:5173"),
		},
		Publishing: PublishingConfig{
			BaseDomain:           getEnv("PUBLISHED_BASE_DOMAIN", ""),
			ArtifactStore:         getEnv("PUBLISH_ARTIFACT_STORE", "filesystem"),
			R2AccountID:          getEnv("R2_ACCOUNT_ID", ""),
			R2AccessKeyID:         getEnv("R2_ACCESS_KEY_ID", ""),
			R2SecretAccessKey:     getEnv("R2_SECRET_ACCESS_KEY", ""),
			R2Bucket:              getEnv("R2_BUCKET", ""),
			R2PublicBase:          getEnv("R2_PUBLIC_BASE", ""),
			VersionRetentionCount: getEnvAsInt("PUBLISH_VERSION_RETENTION_COUNT", 3),
		},
	}

	if err := config.validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	if err := config.loadRefreshTokenHMACKeys(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return config, nil
}

func loadDotEnv() error {
	// 1) If caller provided explicit path via ENV_FILE, use it.
	if envFile := os.Getenv("ENV_FILE"); envFile != "" {
		if err := godotenv.Overload(envFile); err != nil {
			return fmt.Errorf("failed to load ENV_FILE=%s: %w", envFile, err)
		}
		return nil
	}

	// 2) Try common paths relative to current working directory.
	candidates := []string{
		".env",
		filepath.Join(".", ".env"),
		filepath.Join("..", ".env"),
	}

	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			// Overload so local .env wins over any inherited env vars.
			if err := godotenv.Overload(p); err != nil {
				return fmt.Errorf("failed to load %s: %w", p, err)
			}
			return nil
		}
	}

	// If no .env present, that's OK (env may come from the process environment).
	return nil
}

func (c *Config) validate() error {
	if c.Database.ProjectID == "" {
		return fmt.Errorf("GCP_PROJECT_ID is required")
	}
	if c.Auth.JWTSecret == "" || c.Auth.JWTSecret == "your-secret-key-change-in-production" {
		return fmt.Errorf("JWT_SECRET must be set to a secure value")
	}
	if c.Publishing.VersionRetentionCount < 1 {
		return fmt.Errorf("PUBLISH_VERSION_RETENTION_COUNT must be >= 1")
	}
	return nil
}

func (c *Config) loadRefreshTokenHMACKeys() error {
	raw := getEnv("REFRESH_TOKEN_HMAC_KEYS", "")
	if raw == "" {
		return fmt.Errorf("REFRESH_TOKEN_HMAC_KEYS is required")
	}

	var keys []RefreshTokenHMACKey
	if err := json.Unmarshal([]byte(raw), &keys); err != nil {
		return fmt.Errorf("REFRESH_TOKEN_HMAC_KEYS must be valid JSON: %w", err)
	}
	if len(keys) == 0 {
		return fmt.Errorf("REFRESH_TOKEN_HMAC_KEYS must contain at least one key")
	}

	activeFound := false
	for i := range keys {
		b, err := base64.StdEncoding.DecodeString(keys[i].KeyB64)
		if err != nil {
			return fmt.Errorf("REFRESH_TOKEN_HMAC_KEYS[%d].key_b64 must be base64: %w", i, err)
		}
		if len(b) < 32 {
			return fmt.Errorf("REFRESH_TOKEN_HMAC_KEYS[%d] decoded key must be >= 32 bytes", i)
		}
		keys[i].Key = b
		if keys[i].ID == c.Auth.RefreshTokenHMACActiveKeyID {
			activeFound = true
		}
	}

	if !activeFound {
		return fmt.Errorf("REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID=%d not found in REFRESH_TOKEN_HMAC_KEYS", c.Auth.RefreshTokenHMACActiveKeyID)
	}

	c.Auth.RefreshTokenHMACKeys = keys
	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func parseDuration(value string, defaultValue time.Duration) time.Duration {
	if value == "" {
		return defaultValue
	}
	duration, err := time.ParseDuration(value)
	if err != nil {
		// If parsing fails, return default
		return defaultValue
	}
	return duration
}
