package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Auth     AuthConfig
	Storage  StorageConfig
	Google   GoogleConfig
}

type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type DatabaseConfig struct {
	URL             string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type AuthConfig struct {
	JWTSecret              string
	JWTAccessExpiration    time.Duration // Short-lived access token (default: 15 minutes)
	JWTRefreshExpiration   time.Duration // Long-lived refresh token (default: 30 days)
	JWTIssuer              string        // JWT issuer claim (default: "sacred-vows-api")
	JWTAudience            string        // JWT audience claim (default: "sacred-vows-client")
	ClockSkewTolerance     time.Duration // Clock skew tolerance (default: 60 seconds)
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

func Load() (*Config, error) {
	// Load .env file if it exists (don't fail if it doesn't)
	_ = godotenv.Load()

	config := &Config{
		Server: ServerConfig{
			Port:         getEnv("PORT", "3000"),
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
		},
		Database: DatabaseConfig{
			URL:             getEnv("DATABASE_URL", ""),
			MaxOpenConns:   25,
			MaxIdleConns:   5,
			ConnMaxLifetime: 5 * time.Minute,
		},
		Auth: AuthConfig{
			JWTSecret:            getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			JWTAccessExpiration:  parseDuration(getEnv("JWT_ACCESS_EXPIRATION", "15m"), 15*time.Minute),
			JWTRefreshExpiration: parseDuration(getEnv("JWT_REFRESH_EXPIRATION", "30d"), 30*24*time.Hour),
			JWTIssuer:            getEnv("JWT_ISSUER", "sacred-vows-api"),
			JWTAudience:          getEnv("JWT_AUDIENCE", "sacred-vows-client"),
			ClockSkewTolerance:   parseDuration(getEnv("JWT_CLOCK_SKEW", "60s"), 60*time.Second),
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
	}

	if err := config.validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return config, nil
}

func (c *Config) validate() error {
	if c.Database.URL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if c.Auth.JWTSecret == "" || c.Auth.JWTSecret == "your-secret-key-change-in-production" {
		return fmt.Errorf("JWT_SECRET must be set to a secure value")
	}
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
