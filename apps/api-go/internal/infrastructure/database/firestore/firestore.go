package firestore

import (
	"context"
	"fmt"
	"os"

	"cloud.google.com/go/firestore"
)

// Client wraps Firestore client
type Client struct {
	client     *firestore.Client
	projectID  string
	databaseID string
}

// Collection returns a reference to a collection
func (c *Client) Collection(path string) *firestore.CollectionRef {
	return c.client.Collection(path)
}

// Batch returns a new WriteBatch
func (c *Client) Batch() *firestore.WriteBatch {
	return c.client.Batch()
}

// Config holds Firestore configuration
type Config struct {
	ProjectID  string
	DatabaseID string
}

// New creates a new Firestore client
func New(ctx context.Context, cfg *Config) (*Client, error) {
	if cfg.ProjectID == "" {
		return nil, fmt.Errorf("project ID is required")
	}

	if cfg.DatabaseID == "" {
		cfg.DatabaseID = "(default)"
	}

	// Use default credentials (works with Cloud Run service account)
	client, err := firestore.NewClientWithDatabase(ctx, cfg.ProjectID, cfg.DatabaseID)
	if err != nil {
		return nil, fmt.Errorf("failed to create Firestore client: %w", err)
	}

	return &Client{
		client:     client,
		projectID:  cfg.ProjectID,
		databaseID: cfg.DatabaseID,
	}, nil
}

// NewFromEnv creates a Firestore client from environment variables
func NewFromEnv(ctx context.Context) (*Client, error) {
	projectID := os.Getenv("GCP_PROJECT_ID")
	if projectID == "" {
		return nil, fmt.Errorf("GCP_PROJECT_ID environment variable is required")
	}

	databaseID := os.Getenv("FIRESTORE_DATABASE")
	if databaseID == "" {
		databaseID = "(default)"
	}

	cfg := &Config{
		ProjectID:  projectID,
		DatabaseID: databaseID,
	}

	return New(ctx, cfg)
}

// Close closes the Firestore client
func (c *Client) Close() error {
	return c.client.Close()
}

