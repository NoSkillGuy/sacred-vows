package postgres

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestDB creates an in-memory SQLite database for testing
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	// Auto-migrate the schema
	err = db.AutoMigrate(&InvitationModel{})
	require.NoError(t, err)

	return db
}

func TestInvitationRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	repo := NewInvitationRepository(db)
	ctx := context.Background()

	t.Run("creates invitation successfully", func(t *testing.T) {
		invitation, err := domain.NewInvitation("classic-scroll", "user-123", json.RawMessage(`{"bride":"Alice","groom":"Bob"}`))
		require.NoError(t, err)
		invitation.ID = "inv-1"
		invitation.CreatedAt = time.Now()
		invitation.UpdatedAt = time.Now()

		err = repo.Create(ctx, invitation)
		assert.NoError(t, err)

		// Verify it was saved
		var model InvitationModel
		err = db.Where("id = ?", "inv-1").First(&model).Error
		assert.NoError(t, err)
		assert.Equal(t, "inv-1", model.ID)
		assert.Equal(t, "classic-scroll", model.LayoutID)
		assert.Equal(t, "user-123", model.UserID)
		assert.NotZero(t, model.CreatedAt)
		assert.NotZero(t, model.UpdatedAt)
	})

	t.Run("creates invitation with JSONB data", func(t *testing.T) {
		data := json.RawMessage(`{"couple":{"bride":"Jane","groom":"John"},"venue":"Beach"}`)
		invitation, err := domain.NewInvitation("editorial-elegance", "user-456", data)
		require.NoError(t, err)
		invitation.ID = "inv-2"
		invitation.CreatedAt = time.Now()
		invitation.UpdatedAt = time.Now()

		err = repo.Create(ctx, invitation)
		assert.NoError(t, err)

		// Verify data was saved correctly
		var model InvitationModel
		err = db.Where("id = ?", "inv-2").First(&model).Error
		assert.NoError(t, err)

		var savedData map[string]interface{}
		err = json.Unmarshal(model.Data, &savedData)
		assert.NoError(t, err)
		assert.Equal(t, "Jane", savedData["couple"].(map[string]interface{})["bride"])
	})
}

func TestInvitationRepository_FindByID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewInvitationRepository(db)
	ctx := context.Background()

	// Create test invitation
	invitation, err := domain.NewInvitation("classic-scroll", "user-123", json.RawMessage(`{"test":"data"}`))
	require.NoError(t, err)
	invitation.ID = "inv-1"
	invitation.CreatedAt = time.Now()
	invitation.UpdatedAt = time.Now()
	err = repo.Create(ctx, invitation)
	require.NoError(t, err)

	t.Run("finds invitation by ID", func(t *testing.T) {
		found, err := repo.FindByID(ctx, "inv-1")
		assert.NoError(t, err)
		require.NotNil(t, found)
		assert.Equal(t, "inv-1", found.ID)
		assert.Equal(t, "classic-scroll", found.LayoutID)
		assert.Equal(t, "user-123", found.UserID)
		assert.Equal(t, `{"test":"data"}`, string(found.Data))
	})

	t.Run("returns nil for non-existent invitation", func(t *testing.T) {
		found, err := repo.FindByID(ctx, "non-existent")
		assert.NoError(t, err)
		assert.Nil(t, found)
	})
}

func TestInvitationRepository_FindByUserID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewInvitationRepository(db)
	ctx := context.Background()

	// Create test invitations for different users
	inv1, _ := domain.NewInvitation("classic-scroll", "user-123", json.RawMessage(`{"inv":"1"}`))
	inv1.ID = "inv-1"
	inv1.CreatedAt = time.Now()
	inv1.UpdatedAt = time.Now()
	repo.Create(ctx, inv1)

	inv2, _ := domain.NewInvitation("editorial-elegance", "user-123", json.RawMessage(`{"inv":"2"}`))
	inv2.ID = "inv-2"
	inv2.CreatedAt = time.Now()
	inv2.UpdatedAt = time.Now()
	repo.Create(ctx, inv2)

	inv3, _ := domain.NewInvitation("classic-scroll", "user-456", json.RawMessage(`{"inv":"3"}`))
	inv3.ID = "inv-3"
	inv3.CreatedAt = time.Now()
	inv3.UpdatedAt = time.Now()
	repo.Create(ctx, inv3)

	t.Run("finds all invitations for user", func(t *testing.T) {
		invitations, err := repo.FindByUserID(ctx, "user-123")
		assert.NoError(t, err)
		assert.Len(t, invitations, 2)

		ids := make(map[string]bool)
		for _, inv := range invitations {
			ids[inv.ID] = true
			assert.Equal(t, "user-123", inv.UserID)
		}
		assert.True(t, ids["inv-1"])
		assert.True(t, ids["inv-2"])
	})

	t.Run("returns empty slice for user with no invitations", func(t *testing.T) {
		invitations, err := repo.FindByUserID(ctx, "user-999")
		assert.NoError(t, err)
		assert.Empty(t, invitations)
	})
}

func TestInvitationRepository_Update(t *testing.T) {
	db := setupTestDB(t)
	repo := NewInvitationRepository(db)
	ctx := context.Background()

	// Create test invitation
	originalTime := time.Now().Add(-1 * time.Hour)
	invitation, err := domain.NewInvitation("classic-scroll", "user-123", json.RawMessage(`{"original":"data"}`))
	require.NoError(t, err)
	invitation.ID = "inv-1"
	invitation.CreatedAt = originalTime
	invitation.UpdatedAt = originalTime
	err = repo.Create(ctx, invitation)
	require.NoError(t, err)

	t.Run("updates invitation data", func(t *testing.T) {
		// Fetch the invitation
		inv, err := repo.FindByID(ctx, "inv-1")
		require.NoError(t, err)
		require.NotNil(t, inv)

		// Update it
		inv.LayoutID = "editorial-elegance"
		inv.Data = json.RawMessage(`{"updated":"data"}`)
		inv.UpdatedAt = time.Now()

		err = repo.Update(ctx, inv)
		assert.NoError(t, err)

		// Verify update
		updated, err := repo.FindByID(ctx, "inv-1")
		assert.NoError(t, err)
		require.NotNil(t, updated)
		assert.Equal(t, "editorial-elegance", updated.LayoutID)
		assert.Equal(t, `{"updated":"data"}`, string(updated.Data))
	})

	t.Run("preserves CreatedAt on update", func(t *testing.T) {
		inv, err := repo.FindByID(ctx, "inv-1")
		require.NoError(t, err)
		require.NotNil(t, inv)

		originalCreatedAt := inv.CreatedAt
		inv.Data = json.RawMessage(`{"preserve":"createdAt"}`)
		inv.UpdatedAt = time.Now()

		err = repo.Update(ctx, inv)
		assert.NoError(t, err)

		// Verify CreatedAt is preserved
		updated, err := repo.FindByID(ctx, "inv-1")
		assert.NoError(t, err)
		require.NotNil(t, updated)
		assert.Equal(t, originalCreatedAt.Unix(), updated.CreatedAt.Unix())
		assert.True(t, updated.UpdatedAt.After(originalTime))
	})
}

func TestInvitationRepository_Delete(t *testing.T) {
	db := setupTestDB(t)
	repo := NewInvitationRepository(db)
	ctx := context.Background()

	// Create test invitation
	invitation, err := domain.NewInvitation("classic-scroll", "user-123", json.RawMessage(`{"test":"data"}`))
	require.NoError(t, err)
	invitation.ID = "inv-1"
	invitation.CreatedAt = time.Now()
	invitation.UpdatedAt = time.Now()
	err = repo.Create(ctx, invitation)
	require.NoError(t, err)

	t.Run("deletes invitation", func(t *testing.T) {
		err := repo.Delete(ctx, "inv-1")
		assert.NoError(t, err)

		// Verify it's deleted
		found, err := repo.FindByID(ctx, "inv-1")
		assert.NoError(t, err)
		assert.Nil(t, found)
	})

	t.Run("delete non-existent invitation succeeds", func(t *testing.T) {
		err := repo.Delete(ctx, "non-existent")
		assert.NoError(t, err)
	})
}

func TestInvitationRepository_DataSerialization(t *testing.T) {
	db := setupTestDB(t)
	repo := NewInvitationRepository(db)
	ctx := context.Background()

	t.Run("handles complex JSON data", func(t *testing.T) {
		complexData := json.RawMessage(`{
			"_meta": {"title": "My Wedding", "status": "draft"},
			"couple": {"bride": "Alice", "groom": "Bob"},
			"venue": {"name": "Beach Resort", "address": "123 Main St"},
			"dates": {"ceremony": "2024-06-15", "reception": "2024-06-15"}
		}`)

		invitation, err := domain.NewInvitation("classic-scroll", "user-123", complexData)
		require.NoError(t, err)
		invitation.ID = "inv-complex"
		invitation.CreatedAt = time.Now()
		invitation.UpdatedAt = time.Now()

		err = repo.Create(ctx, invitation)
		assert.NoError(t, err)

		// Retrieve and verify
		found, err := repo.FindByID(ctx, "inv-complex")
		assert.NoError(t, err)
		require.NotNil(t, found)

		var data map[string]interface{}
		err = json.Unmarshal(found.Data, &data)
		assert.NoError(t, err)
		assert.Equal(t, "My Wedding", data["_meta"].(map[string]interface{})["title"])
		assert.Equal(t, "Alice", data["couple"].(map[string]interface{})["bride"])
	})
}
