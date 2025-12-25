package config

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Server        ServerConfig
	Database      DatabaseConfig
	Auth          AuthConfig
	Storage       StorageConfig
	Google        GoogleConfig
	Publishing    PublishingConfig
	PublicAssets  PublicAssetsConfig
	Email         EmailConfig
	Observability ObservabilityConfig
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
	MaxFileSize         int64
	AllowedTypes        []string
	GCSBucket           string        // GCS bucket name for assets (private bucket, accessed via signed URLs)
	S3Endpoint          string        // S3-compatible endpoint for API access (e.g., http://minio:9000 for MinIO)
	S3PublicEndpoint    string        // S3 public endpoint for presigned URLs (e.g., http://localhost:9000 for browser access)
	S3AccessKeyID       string        // S3 access key ID
	S3SecretAccessKey   string        // S3 secret access key
	S3Bucket            string        // S3 bucket name for assets (used when GCSBucket is not set)
	S3Region            string        // S3 region (default: us-east-1 for MinIO)
	SignedURLExpiration time.Duration // Signed URL expiration duration (default: 1 hour)
	MaxImageWidth       int           // Maximum image width after resizing (0 = no resize)
	MaxImageHeight      int           // Maximum image height after resizing (0 = no resize)
	ImageQuality        int           // JPEG compression quality (1-100, default: 85)
}

type GoogleConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	FrontendURL  string
}

type PublishingConfig struct {
	BaseDomain      string
	SubdomainSuffix string // Optional suffix for subdomain in URL (e.g., "-dev" for dev environment)
	ArtifactStore   string // filesystem|r2

	// R2 (S3-compatible)
	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2Bucket          string
	R2PublicBase      string
	R2Endpoint        string // Optional custom endpoint (for local MinIO, etc.)

	// Version retention: number of versions to keep (default: 3)
	VersionRetentionCount int

	// Snapshot renderer
	SnapshotRendererScript string
	SnapshotRendererNode   string
}

type PublicAssetsConfig struct {
	R2Bucket   string // R2 bucket name for public default assets
	CDNBaseURL string // CDN base URL for public assets
}

// EmailVendorConfig represents configuration for a single email vendor
type EmailVendorConfig struct {
	Provider     string // "mailjet" | "mailgun"
	APIKey       string
	SecretKey    string // For Mailjet (not used for Mailgun)
	Domain       string // For Mailgun (domain to send from)
	DailyLimit   int    // e.g., 100 for Mailgun free, 200 for Mailjet free
	MonthlyLimit int    // e.g., 10000 for Mailgun paid, 15000 for Mailjet paid
	Enabled      bool
	FromAddress  string
	FromName     string
}

type EmailConfig struct {
	Vendors     []EmailVendorConfig
	FromAddress string // Default from address (used if vendor doesn't specify)
	FromName    string // Default from name (used if vendor doesn't specify)
}

type ObservabilityConfig struct {
	Enabled               bool    // OTEL_ENABLED, default: true in dev/local, false in prod unless explicitly enabled
	ExporterEndpoint      string  // OTEL_EXPORTER_OTLP_ENDPOINT
	ExporterProtocol      string  // OTEL_EXPORTER_OTLP_PROTOCOL, default: grpc
	ServiceName           string  // OTEL_SERVICE_NAME, default: sacred-vows-api
	ServiceVersion        string  // from git SHA or build info
	DeploymentEnvironment string  // OTEL_RESOURCE_ATTRIBUTES or APP_ENV
	SamplingRate          float64 // OTEL_TRACES_SAMPLER_ARG, default: 0.1 for normal, 1.0 for errors
}

// ConfigFile represents the YAML config file structure
type ConfigFile struct {
	Server struct {
		Port         string `yaml:"port"`
		ReadTimeout  string `yaml:"read_timeout"`
		WriteTimeout string `yaml:"write_timeout"`
	} `yaml:"server"`
	Auth struct {
		JWTAccessExpiration  string `yaml:"jwt_access_expiration"`
		JWTRefreshExpiration string `yaml:"jwt_refresh_expiration"`
		JWTIssuer            string `yaml:"jwt_issuer"`
		JWTAudience          string `yaml:"jwt_audience"`
		JWTClockSkew         string `yaml:"jwt_clock_skew"`
	} `yaml:"auth"`
	Storage struct {
		MaxFileSize int64  `yaml:"max_file_size"`
		GCSBucket   string `yaml:"gcs_bucket"`
	} `yaml:"storage"`
	Google struct {
		RedirectURI string `yaml:"redirect_uri"`
		FrontendURL string `yaml:"frontend_url"`
	} `yaml:"google"`
	Publishing struct {
		BaseDomain                   string `yaml:"base_domain"`
		SubdomainSuffix              string `yaml:"subdomain_suffix"`
		ArtifactStore                string `yaml:"artifact_store"`
		R2AccountID                  string `yaml:"r2_account_id"`
		R2Bucket                     string `yaml:"r2_bucket"`
		R2PublicBase                 string `yaml:"r2_public_base"`
		R2Endpoint                   string `yaml:"r2_endpoint"`
		VersionRetentionCount        int    `yaml:"version_retention_count"`
		SnapshotRendererScript       string `yaml:"snapshot_renderer_script"`
		SnapshotRendererNode         string `yaml:"snapshot_renderer_node"`
		PublishedArtifactsDir        string `yaml:"published_artifacts_dir"`
		PublishedArtifactsPublicBase string `yaml:"published_artifacts_public_base"`
	} `yaml:"publishing"`
	PublicAssets struct {
		R2Bucket   string `yaml:"r2_bucket"`
		CDNBaseURL string `yaml:"cdn_base_url"`
	} `yaml:"public_assets"`
	Email struct {
		Vendors     string `yaml:"vendors"`
		FromAddress string `yaml:"from_address"`
		FromName    string `yaml:"from_name"`
		Mailjet     struct {
			DailyLimit   int `yaml:"daily_limit"`
			MonthlyLimit int `yaml:"monthly_limit"`
		} `yaml:"mailjet"`
		Mailgun struct {
			Domain       string `yaml:"domain"`
			DailyLimit   int    `yaml:"daily_limit"`
			MonthlyLimit int    `yaml:"monthly_limit"`
		} `yaml:"mailgun"`
	} `yaml:"email"`
}

func Load() (*Config, error) {
	// Load .env file if it exists.
	// We try a few common locations to avoid surprises with working directory.
	if err := loadDotEnv(); err != nil {
		return nil, err
	}

	// Load YAML config file first (provides defaults for non-sensitive values)
	yamlConfig, err := loadConfigFile()
	if err != nil {
		// If YAML file doesn't exist, that's OK - we'll use env var defaults
		// Log but don't fail (backward compatibility)
		fmt.Printf("Warning: Could not load config file: %v. Using environment variables only.\n", err)
	}

	// Build config, using YAML values as defaults, then overriding with env vars
	// Environment variables take precedence (for sensitive values and overrides)
	config := &Config{
		Server: ServerConfig{
			Port:         getEnv("PORT", getYAMLString(yamlConfig, "server.port", "3000")),
			ReadTimeout:  parseDuration(getEnv("SERVER_READ_TIMEOUT", getYAMLString(yamlConfig, "server.read_timeout", "15s")), 15*time.Second),
			WriteTimeout: parseDuration(getEnv("SERVER_WRITE_TIMEOUT", getYAMLString(yamlConfig, "server.write_timeout", "15s")), 15*time.Second),
		},
		Database: DatabaseConfig{
			ProjectID:  getEnv("GCP_PROJECT_ID", ""),              // Always from env (sensitive/infrastructure)
			DatabaseID: getEnv("FIRESTORE_DATABASE", "(default)"), // Always from env (infrastructure)
		},
		Auth: AuthConfig{
			JWTSecret:                   getEnv("JWT_SECRET", "your-secret-key-change-in-production"), // Always from env (sensitive)
			JWTAccessExpiration:         parseDuration(getEnv("JWT_ACCESS_EXPIRATION", getYAMLString(yamlConfig, "auth.jwt_access_expiration", "15m")), 15*time.Minute),
			JWTRefreshExpiration:        parseDuration(getEnv("JWT_REFRESH_EXPIRATION", getYAMLString(yamlConfig, "auth.jwt_refresh_expiration", "30d")), 30*24*time.Hour),
			JWTIssuer:                   getEnv("JWT_ISSUER", getYAMLString(yamlConfig, "auth.jwt_issuer", "sacred-vows-api")),
			JWTAudience:                 getEnv("JWT_AUDIENCE", getYAMLString(yamlConfig, "auth.jwt_audience", "sacred-vows-client")),
			ClockSkewTolerance:          parseDuration(getEnv("JWT_CLOCK_SKEW", getYAMLString(yamlConfig, "auth.jwt_clock_skew", "60s")), 60*time.Second),
			RefreshTokenHMACActiveKeyID: int16(getEnvAsInt("REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID", 1)), // Always from env (sensitive)
		},
		Storage: StorageConfig{
			MaxFileSize:         getYAMLInt64(yamlConfig, "storage.max_file_size", 10*1024*1024),
			AllowedTypes:        []string{"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"},
			GCSBucket:           getEnv("GCS_ASSETS_BUCKET", getYAMLString(yamlConfig, "storage.gcs_bucket", "")),
			S3Endpoint:          getEnv("S3_ENDPOINT", getYAMLString(yamlConfig, "storage.s3_endpoint", "")),
			S3PublicEndpoint:    getEnv("S3_PUBLIC_ENDPOINT", getYAMLString(yamlConfig, "storage.s3_public_endpoint", "")),
			S3AccessKeyID:       getEnv("S3_ACCESS_KEY_ID", getYAMLString(yamlConfig, "storage.s3_access_key_id", "")),
			S3SecretAccessKey:   getEnv("S3_SECRET_ACCESS_KEY", ""), // Always from env (sensitive)
			S3Bucket:            getEnv("S3_ASSETS_BUCKET", getYAMLString(yamlConfig, "storage.s3_bucket", "")),
			S3Region:            getEnv("S3_REGION", getYAMLString(yamlConfig, "storage.s3_region", "us-east-1")),
			SignedURLExpiration: parseDuration(getEnv("ASSET_SIGNED_URL_EXPIRATION", getYAMLString(yamlConfig, "storage.signed_url_expiration", "1h")), 1*time.Hour),
			MaxImageWidth:       getEnvAsInt("ASSET_MAX_IMAGE_WIDTH", getYAMLInt(yamlConfig, "storage.max_image_width", 1920)),
			MaxImageHeight:      getEnvAsInt("ASSET_MAX_IMAGE_HEIGHT", getYAMLInt(yamlConfig, "storage.max_image_height", 1920)),
			ImageQuality:        getEnvAsInt("ASSET_IMAGE_QUALITY", getYAMLInt(yamlConfig, "storage.image_quality", 85)),
		},
		Google: GoogleConfig{
			ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),     // Always from env (sensitive)
			ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""), // Always from env (sensitive)
			RedirectURI:  getEnv("GOOGLE_REDIRECT_URI", getYAMLString(yamlConfig, "google.redirect_uri", "http://localhost:3000/api/auth/google/callback")),
			FrontendURL:  getEnv("FRONTEND_URL", getYAMLString(yamlConfig, "google.frontend_url", "http://localhost:5173")),
		},
		Publishing: PublishingConfig{
			BaseDomain:             getEnv("PUBLISHED_BASE_DOMAIN", getYAMLString(yamlConfig, "publishing.base_domain", "")),
			SubdomainSuffix:        getEnv("PUBLISHED_SUBDOMAIN_SUFFIX", getYAMLString(yamlConfig, "publishing.subdomain_suffix", "")),
			ArtifactStore:          getEnv("PUBLISH_ARTIFACT_STORE", getYAMLString(yamlConfig, "publishing.artifact_store", "filesystem")),
			R2AccountID:            getEnv("R2_ACCOUNT_ID", getYAMLString(yamlConfig, "publishing.r2_account_id", "")),
			R2AccessKeyID:          getEnv("R2_ACCESS_KEY_ID", ""),     // Always from env (sensitive)
			R2SecretAccessKey:      getEnv("R2_SECRET_ACCESS_KEY", ""), // Always from env (sensitive)
			R2Bucket:               getEnv("R2_BUCKET", getYAMLString(yamlConfig, "publishing.r2_bucket", "")),
			R2PublicBase:           getEnv("R2_PUBLIC_BASE", getYAMLString(yamlConfig, "publishing.r2_public_base", "")),
			R2Endpoint:             getEnv("R2_ENDPOINT", getYAMLString(yamlConfig, "publishing.r2_endpoint", "")),
			VersionRetentionCount:  getEnvAsInt("PUBLISH_VERSION_RETENTION_COUNT", getYAMLInt(yamlConfig, "publishing.version_retention_count", 3)),
			SnapshotRendererScript: getEnv("SNAPSHOT_RENDERER_SCRIPT", getYAMLString(yamlConfig, "publishing.snapshot_renderer_script", "")),
			SnapshotRendererNode:   getEnv("SNAPSHOT_RENDERER_NODE", getYAMLString(yamlConfig, "publishing.snapshot_renderer_node", "node")),
		},
		PublicAssets: PublicAssetsConfig{
			R2Bucket:   getEnv("PUBLIC_ASSETS_R2_BUCKET", getYAMLString(yamlConfig, "public_assets.r2_bucket", "")),
			CDNBaseURL: getEnv("PUBLIC_ASSETS_CDN_URL", getYAMLString(yamlConfig, "public_assets.cdn_base_url", "")),
		},
		Email:         loadEmailConfig(yamlConfig),
		Observability: loadObservabilityConfig(yamlConfig),
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
		// Use Load instead of Overload to preserve existing env vars (e.g., from docker-compose)
		if err := godotenv.Load(envFile); err != nil {
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
			// Use Load instead of Overload to preserve existing env vars (e.g., from docker-compose)
			// This ensures docker-compose environment variables take precedence over .env file values
			if err := godotenv.Load(p); err != nil {
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

// loadConfigFile loads the YAML configuration file based on APP_ENV
func loadConfigFile() (*ConfigFile, error) {
	env := getEnv("APP_ENV", "local")
	if env == "" {
		env = "local"
	}

	// Try to find config file relative to common locations
	candidates := []string{
		filepath.Join("config", fmt.Sprintf("%s.yaml", env)),
		filepath.Join(".", "config", fmt.Sprintf("%s.yaml", env)),
		filepath.Join("..", "config", fmt.Sprintf("%s.yaml", env)),
		filepath.Join("apps", "api-go", "config", fmt.Sprintf("%s.yaml", env)),
		filepath.Join(".", "apps", "api-go", "config", fmt.Sprintf("%s.yaml", env)),
	}

	var configFile *ConfigFile
	var lastErr error

	for _, path := range candidates {
		data, err := os.ReadFile(path)
		if err == nil {
			configFile = &ConfigFile{}
			if err := yaml.Unmarshal(data, configFile); err == nil {
				return configFile, nil
			}
			lastErr = fmt.Errorf("failed to parse %s: %w", path, err)
		} else {
			lastErr = fmt.Errorf("failed to read %s: %w", path, err)
		}
	}

	// If specific env file not found, try local.yaml as fallback
	if env != "local" {
		for _, path := range candidates {
			// Replace env with "local"
			localPath := strings.Replace(path, fmt.Sprintf("%s.yaml", env), "local.yaml", 1)
			data, err := os.ReadFile(localPath)
			if err == nil {
				configFile = &ConfigFile{}
				if err := yaml.Unmarshal(data, configFile); err == nil {
					return configFile, nil
				}
			}
		}
	}

	return nil, fmt.Errorf("config file not found: %w", lastErr)
}

// Helper functions to extract values from YAML config with dot notation
func getYAMLString(cfg *ConfigFile, path string, defaultValue string) string {
	if cfg == nil {
		return defaultValue
	}

	parts := strings.Split(path, ".")
	switch parts[0] {
	case "server":
		switch parts[1] {
		case "port":
			if cfg.Server.Port != "" {
				return cfg.Server.Port
			}
		case "read_timeout":
			if cfg.Server.ReadTimeout != "" {
				return cfg.Server.ReadTimeout
			}
		case "write_timeout":
			if cfg.Server.WriteTimeout != "" {
				return cfg.Server.WriteTimeout
			}
		}
	case "auth":
		switch parts[1] {
		case "jwt_access_expiration":
			if cfg.Auth.JWTAccessExpiration != "" {
				return cfg.Auth.JWTAccessExpiration
			}
		case "jwt_refresh_expiration":
			if cfg.Auth.JWTRefreshExpiration != "" {
				return cfg.Auth.JWTRefreshExpiration
			}
		case "jwt_issuer":
			if cfg.Auth.JWTIssuer != "" {
				return cfg.Auth.JWTIssuer
			}
		case "jwt_audience":
			if cfg.Auth.JWTAudience != "" {
				return cfg.Auth.JWTAudience
			}
		case "jwt_clock_skew":
			if cfg.Auth.JWTClockSkew != "" {
				return cfg.Auth.JWTClockSkew
			}
		}
	case "storage":
		switch parts[1] {
		case "gcs_bucket":
			if cfg.Storage.GCSBucket != "" {
				return cfg.Storage.GCSBucket
			}
		}
	case "google":
		switch parts[1] {
		case "redirect_uri":
			if cfg.Google.RedirectURI != "" {
				return cfg.Google.RedirectURI
			}
		case "frontend_url":
			if cfg.Google.FrontendURL != "" {
				return cfg.Google.FrontendURL
			}
		}
	case "publishing":
		switch parts[1] {
		case "base_domain":
			if cfg.Publishing.BaseDomain != "" {
				return cfg.Publishing.BaseDomain
			}
		case "artifact_store":
			if cfg.Publishing.ArtifactStore != "" {
				return cfg.Publishing.ArtifactStore
			}
		case "r2_account_id":
			if cfg.Publishing.R2AccountID != "" {
				return cfg.Publishing.R2AccountID
			}
		case "r2_bucket":
			if cfg.Publishing.R2Bucket != "" {
				return cfg.Publishing.R2Bucket
			}
		case "r2_public_base":
			if cfg.Publishing.R2PublicBase != "" {
				return cfg.Publishing.R2PublicBase
			}
		case "snapshot_renderer_script":
			if cfg.Publishing.SnapshotRendererScript != "" {
				return cfg.Publishing.SnapshotRendererScript
			}
		case "snapshot_renderer_node":
			if cfg.Publishing.SnapshotRendererNode != "" {
				return cfg.Publishing.SnapshotRendererNode
			}
		}
	case "public_assets":
		switch parts[1] {
		case "r2_bucket":
			if cfg.PublicAssets.R2Bucket != "" {
				return cfg.PublicAssets.R2Bucket
			}
		case "cdn_base_url":
			if cfg.PublicAssets.CDNBaseURL != "" {
				return cfg.PublicAssets.CDNBaseURL
			}
		}
	case "email":
		switch parts[1] {
		case "vendors":
			if cfg.Email.Vendors != "" {
				return cfg.Email.Vendors
			}
		case "from_address":
			if cfg.Email.FromAddress != "" {
				return cfg.Email.FromAddress
			}
		case "from_name":
			if cfg.Email.FromName != "" {
				return cfg.Email.FromName
			}
		}
	}

	return defaultValue
}

func getYAMLInt(cfg *ConfigFile, path string, defaultValue int) int {
	if cfg == nil {
		return defaultValue
	}

	parts := strings.Split(path, ".")
	switch parts[0] {
	case "publishing":
		if parts[1] == "version_retention_count" && cfg.Publishing.VersionRetentionCount > 0 {
			return cfg.Publishing.VersionRetentionCount
		}
	case "email":
		if parts[1] == "mailjet" {
			if parts[2] == "daily_limit" && cfg.Email.Mailjet.DailyLimit > 0 {
				return cfg.Email.Mailjet.DailyLimit
			}
			if parts[2] == "monthly_limit" && cfg.Email.Mailjet.MonthlyLimit > 0 {
				return cfg.Email.Mailjet.MonthlyLimit
			}
		}
		if parts[1] == "mailgun" {
			if parts[2] == "daily_limit" && cfg.Email.Mailgun.DailyLimit > 0 {
				return cfg.Email.Mailgun.DailyLimit
			}
			if parts[2] == "monthly_limit" && cfg.Email.Mailgun.MonthlyLimit > 0 {
				return cfg.Email.Mailgun.MonthlyLimit
			}
		}
	}

	return defaultValue
}

func getYAMLInt64(cfg *ConfigFile, path string, defaultValue int64) int64 {
	if cfg == nil {
		return defaultValue
	}

	parts := strings.Split(path, ".")
	if parts[0] == "storage" && parts[1] == "max_file_size" && cfg.Storage.MaxFileSize > 0 {
		return cfg.Storage.MaxFileSize
	}

	return defaultValue
}

// loadEmailConfig loads email configuration in multi-vendor format
func loadEmailConfig(yamlConfig *ConfigFile) EmailConfig {
	// Get defaults from YAML or env
	defaultFromAddress := getEnv("EMAIL_FROM_ADDRESS", getYAMLString(yamlConfig, "email.from_address", ""))
	defaultFromName := getEnv("EMAIL_FROM_NAME", getYAMLString(yamlConfig, "email.from_name", "Sacred Vows"))

	cfg := EmailConfig{
		FromAddress: defaultFromAddress,
		FromName:    defaultFromName,
	}

	// Check if multi-vendor JSON config is provided
	vendorsJSON := getEnv("EMAIL_VENDORS_JSON", "")
	if vendorsJSON != "" {
		var vendors []EmailVendorConfig
		if err := json.Unmarshal([]byte(vendorsJSON), &vendors); err == nil {
			// Set default from address/name for vendors that don't have them
			for i := range vendors {
				if vendors[i].FromAddress == "" {
					vendors[i].FromAddress = cfg.FromAddress
				}
				if vendors[i].FromName == "" {
					vendors[i].FromName = cfg.FromName
				}
			}
			cfg.Vendors = vendors
			return cfg
		}
	}

	// Check if vendor list is provided (comma-separated)
	// Get from env first (takes precedence), then YAML
	vendorList := getEnv("EMAIL_VENDORS", getYAMLString(yamlConfig, "email.vendors", ""))
	if vendorList != "" {
		// Parse comma-separated vendor list
		vendors := []EmailVendorConfig{}

		// Check for Mailjet
		if contains(vendorList, "mailjet") {
			mailjetKey := getEnv("MAILJET_API_KEY", "")       // Always from env (sensitive)
			mailjetSecret := getEnv("MAILJET_SECRET_KEY", "") // Always from env (sensitive)
			if mailjetKey != "" && mailjetSecret != "" {
				// Get limits from YAML or env (env takes precedence)
				dailyLimit := getEnvAsInt("MAILJET_DAILY_LIMIT", getYAMLInt(yamlConfig, "email.mailjet.daily_limit", 200))
				monthlyLimit := getEnvAsInt("MAILJET_MONTHLY_LIMIT", getYAMLInt(yamlConfig, "email.mailjet.monthly_limit", 6000))
				vendors = append(vendors, EmailVendorConfig{
					Provider:     "mailjet",
					APIKey:       mailjetKey,
					SecretKey:    mailjetSecret,
					DailyLimit:   dailyLimit,
					MonthlyLimit: monthlyLimit,
					Enabled:      true,
					FromAddress:  cfg.FromAddress,
					FromName:     cfg.FromName,
				})
			}
		}

		// Check for Mailgun
		if contains(vendorList, "mailgun") {
			mailgunKey := getEnv("MAILGUN_API_KEY", "") // Always from env (sensitive)
			// Domain can come from YAML or env (env takes precedence)
			mailgunDomain := getEnv("MAILGUN_DOMAIN", getYAMLString(yamlConfig, "email.mailgun.domain", ""))
			if mailgunKey != "" && mailgunDomain != "" {
				// Get limits from YAML or env (env takes precedence)
				dailyLimit := getEnvAsInt("MAILGUN_DAILY_LIMIT", getYAMLInt(yamlConfig, "email.mailgun.daily_limit", 100))
				monthlyLimit := getEnvAsInt("MAILGUN_MONTHLY_LIMIT", getYAMLInt(yamlConfig, "email.mailgun.monthly_limit", 3000))
				vendors = append(vendors, EmailVendorConfig{
					Provider:     "mailgun",
					APIKey:       mailgunKey,
					Domain:       mailgunDomain,
					DailyLimit:   dailyLimit,
					MonthlyLimit: monthlyLimit,
					Enabled:      true,
					FromAddress:  cfg.FromAddress,
					FromName:     cfg.FromName,
				})
			}
		}

		if len(vendors) > 0 {
			cfg.Vendors = vendors
			return cfg
		}
	}

	// If no vendors configured, return empty config (will be handled by factory)
	return cfg
}

// loadObservabilityConfig loads observability configuration
func loadObservabilityConfig(yamlConfig *ConfigFile) ObservabilityConfig {
	appEnv := getEnv("APP_ENV", "local")

	// Default enabled to true for dev/local, false for prod unless explicitly set
	enabledDefault := appEnv == "local" || appEnv == "dev"
	enabledStr := getEnv("OTEL_ENABLED", "")
	var enabled bool
	if enabledStr == "" {
		enabled = enabledDefault
	} else {
		enabled = enabledStr == "true" || enabledStr == "1"
	}

	// Get service version from env or use "unknown"
	serviceVersion := getEnv("OTEL_SERVICE_VERSION", getEnv("GIT_SHA", "unknown"))

	// Get deployment environment from APP_ENV or OTEL_RESOURCE_ATTRIBUTES
	deploymentEnv := appEnv
	if resourceAttrs := getEnv("OTEL_RESOURCE_ATTRIBUTES", ""); resourceAttrs != "" {
		// Parse deployment.environment from OTEL_RESOURCE_ATTRIBUTES if present
		// Format: "key1=value1,key2=value2"
		parts := strings.Split(resourceAttrs, ",")
		for _, part := range parts {
			kv := strings.SplitN(strings.TrimSpace(part), "=", 2)
			if len(kv) == 2 && kv[0] == "deployment.environment" {
				deploymentEnv = kv[1]
				break
			}
		}
	}

	// Parse sampling rate
	samplingRate := 0.1 // default 10%
	if samplerArg := getEnv("OTEL_TRACES_SAMPLER_ARG", ""); samplerArg != "" {
		if rate, err := strconv.ParseFloat(samplerArg, 64); err == nil {
			samplingRate = rate
		}
	}

	return ObservabilityConfig{
		Enabled:               enabled,
		ExporterEndpoint:      getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317"),
		ExporterProtocol:      getEnv("OTEL_EXPORTER_OTLP_PROTOCOL", "grpc"),
		ServiceName:           getEnv("OTEL_SERVICE_NAME", "sacred-vows-api"),
		ServiceVersion:        serviceVersion,
		DeploymentEnvironment: deploymentEnv,
		SamplingRate:          samplingRate,
	}
}

// contains checks if a comma-separated string contains a value
func contains(list, value string) bool {
	items := strings.Split(list, ",")
	for _, item := range items {
		if strings.TrimSpace(item) == value {
			return true
		}
	}
	return false
}
