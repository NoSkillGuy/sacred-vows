package publishinfra

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// MockInvitationRepository is a mock implementation of InvitationRepository
type MockInvitationRepository struct {
	mock.Mock
}

func (m *MockInvitationRepository) FindByID(ctx context.Context, id string) (*domain.Invitation, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Invitation), args.Error(1)
}

func (m *MockInvitationRepository) Create(ctx context.Context, inv *domain.Invitation) error {
	args := m.Called(ctx, inv)
	return args.Error(0)
}

func (m *MockInvitationRepository) Update(ctx context.Context, inv *domain.Invitation) error {
	args := m.Called(ctx, inv)
	return args.Error(0)
}

func (m *MockInvitationRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockInvitationRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Invitation, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Invitation), args.Error(1)
}

func (m *MockInvitationRepository) MigrateUserInvitations(ctx context.Context, fromUserID, toUserID string) (int, error) {
	args := m.Called(ctx, fromUserID, toUserID)
	return args.Get(0).(int), args.Error(1)
}

func TestNewNodeSnapshotGenerator(t *testing.T) {
	tests := []struct {
		name        string
		scriptPath  string
		nodeBinary  string
		wantErr     bool
		errContains string
		setup       func() string // Returns temp script path
		cleanup     func(string)
	}{
		{
			name:       "valid absolute path",
			scriptPath: "/tmp/test-render.js",
			nodeBinary: "node",
			wantErr:    false,
			setup: func() string {
				// Create a temporary script file
				tmpFile := "/tmp/test-render.js"
				_ = os.WriteFile(tmpFile, []byte("#!/usr/bin/env node\n"), 0644)
				return tmpFile
			},
			cleanup: func(path string) {
				_ = os.Remove(path)
			},
		},
		{
			name:        "empty script path",
			scriptPath:  "",
			nodeBinary:  "node",
			wantErr:     true,
			errContains: "snapshot renderer script path is required",
		},
		{
			name:        "non-existent absolute path",
			scriptPath:  "/nonexistent/path/render.js",
			nodeBinary:  "node",
			wantErr:     true,
			errContains: "snapshot renderer script not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockInvitationRepository)
			var cleanupPath string

			if tt.setup != nil {
				cleanupPath = tt.setup()
				if tt.scriptPath == "/tmp/test-render.js" {
					tt.scriptPath = cleanupPath
				}
			}
			if tt.cleanup != nil && cleanupPath != "" {
				defer tt.cleanup(cleanupPath)
			}

			generator, err := NewNodeSnapshotGenerator(mockRepo, tt.scriptPath, tt.nodeBinary)

			if tt.wantErr {
				require.Error(t, err)
				if tt.errContains != "" {
					assert.Contains(t, err.Error(), tt.errContains)
				}
				assert.Nil(t, generator)
			} else {
				require.NoError(t, err)
				assert.NotNil(t, generator)
				assert.Equal(t, tt.nodeBinary, generator.nodeBinary)
				assert.Equal(t, tt.scriptPath, generator.scriptPath)
			}
		})
	}
}

func TestNodeSnapshotGenerator_GenerateBundle_InvalidInvitation(t *testing.T) {
	mockRepo := new(MockInvitationRepository)
	ctx := context.Background()

	// Test with non-existent invitation
	mockRepo.On("FindByID", ctx, "non-existent-id").Return(nil, fmt.Errorf("invitation not found"))

	// Create a temporary script file for the generator
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "render.js")
	_ = os.WriteFile(scriptPath, []byte("#!/usr/bin/env node\n"), 0644)

	generator, err := NewNodeSnapshotGenerator(mockRepo, scriptPath, "node")
	require.NoError(t, err)

	bundle, err := generator.GenerateBundle(ctx, "non-existent-id")

	assert.Error(t, err)
	assert.Nil(t, bundle)
	mockRepo.AssertExpectations(t)
}

func TestNodeSnapshotGenerator_GenerateBundle_InvalidJSON(t *testing.T) {
	mockRepo := new(MockInvitationRepository)
	ctx := context.Background()

	// Create invitation with invalid JSON data
	inv := &domain.Invitation{
		ID:       "test-id",
		LayoutID: "classic-scroll",
		Data:     []byte("invalid json {"), // Invalid JSON
	}

	mockRepo.On("FindByID", ctx, "test-id").Return(inv, nil)

	// Create a temporary script file
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "render.js")
	_ = os.WriteFile(scriptPath, []byte("#!/usr/bin/env node\n"), 0644)

	generator, err := NewNodeSnapshotGenerator(mockRepo, scriptPath, "node")
	require.NoError(t, err)

	bundle, err := generator.GenerateBundle(ctx, "test-id")

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "failed to parse invitation data")
	assert.Nil(t, bundle)
	mockRepo.AssertExpectations(t)
}

func TestNodeSnapshotGenerator_GenerateBundle_ValidInvitation(t *testing.T) {
	mockRepo := new(MockInvitationRepository)
	ctx := context.Background()

	// Create valid invitation data
	invitationData := map[string]interface{}{
		"couple": map[string]interface{}{
			"bride": map[string]interface{}{"name": "Jane"},
			"groom": map[string]interface{}{"name": "John"},
		},
	}
	dataJSON, _ := json.Marshal(invitationData)

	inv := &domain.Invitation{
		ID:       "test-id",
		LayoutID: "classic-scroll",
		Data:     dataJSON,
	}

	mockRepo.On("FindByID", ctx, "test-id").Return(inv, nil)

	// Create a mock renderer script that outputs valid JSON
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "render.js")
	// Note: In a real test, this would be the actual renderer script
	// For now, we'll test the error case when script doesn't exist or fails
	_ = os.WriteFile(scriptPath, []byte("#!/usr/bin/env node\n"), 0644)

	generator, err := NewNodeSnapshotGenerator(mockRepo, scriptPath, "node")
	require.NoError(t, err)

	// This will fail because the script doesn't actually render
	// but we're testing the Go integration logic
	_, err = generator.GenerateBundle(ctx, "test-id")

	// The script will fail, but we verify the Go code handles it correctly
	require.Error(t, err)
	// The error could be either "snapshot renderer failed" or "invalid renderer output"
	assert.True(t,
		strings.Contains(err.Error(), "snapshot renderer failed") ||
		strings.Contains(err.Error(), "invalid renderer output"),
		"Error should indicate renderer failure: %s", err.Error())
	// In a real scenario with a working renderer, bundle would be non-nil
	mockRepo.AssertExpectations(t)
}
