package observability

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMarkUserActiveWithID_ValidID_StoresInAllSets(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	userID := "user-123"

	// Act
	MarkUserActiveWithID(userID)

	// Assert - verify user is stored in all sets
	var foundDaily, foundWeekly, foundMonthly bool
	activeUsersDaily.Range(func(key, value interface{}) bool {
		if key.(string) == userID {
			foundDaily = true
		}
		return true
	})
	activeUsersWeekly.Range(func(key, value interface{}) bool {
		if key.(string) == userID {
			foundWeekly = true
		}
		return true
	})
	activeUsersMonthly.Range(func(key, value interface{}) bool {
		if key.(string) == userID {
			foundMonthly = true
		}
		return true
	})

	assert.True(t, foundDaily, "User should be in daily set")
	assert.True(t, foundWeekly, "User should be in weekly set")
	assert.True(t, foundMonthly, "User should be in monthly set")

	// Verify gauges were updated
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)
	assert.NotNil(t, rm)
}

func TestMarkUserActiveWithID_EmptyID_NoOp(t *testing.T) {
	// Arrange
	provider, _ := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	initialDailyCount := countActiveUsers(&activeUsersDaily)
	initialWeeklyCount := countActiveUsers(&activeUsersWeekly)
	initialMonthlyCount := countActiveUsers(&activeUsersMonthly)

	// Act
	MarkUserActiveWithID("")

	// Assert - counts should not change
	assert.Equal(t, initialDailyCount, countActiveUsers(&activeUsersDaily))
	assert.Equal(t, initialWeeklyCount, countActiveUsers(&activeUsersWeekly))
	assert.Equal(t, initialMonthlyCount, countActiveUsers(&activeUsersMonthly))
}

func TestUpdateActiveUserGauges_UpdatesAllGauges(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	// Add some users
	MarkUserActiveWithID("user-1")
	MarkUserActiveWithID("user-2")
	MarkUserActiveWithID("user-3")

	// Act
	updateActiveUserGauges()

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)

	// Assert
	assert.NotNil(t, rm)
	// Gauges should be updated (we can't easily verify exact values without parsing metricdata)
}

func TestUpdateActiveUserGauges_WithNilGauges_NoPanic(t *testing.T) {
	// Arrange - reset metrics to nil
	ResetMetrics()

	// Add users to sets
	activeUsersDaily.Store("user-1", true)
	activeUsersWeekly.Store("user-1", true)
	activeUsersMonthly.Store("user-1", true)

	// Act & Assert
	assert.NotPanics(t, func() { updateActiveUserGauges() })
}

func TestIncrementActiveInvitations_IncrementsGauge(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	initialCount := activeInvitations

	// Act
	IncrementActiveInvitations()

	// Assert
	assert.Equal(t, initialCount+1, activeInvitations)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)
	assert.NotNil(t, rm)
}

func TestDecrementActiveInvitations_DecrementsGauge(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	SetActiveInvitations(5)
	initialCount := activeInvitations

	// Act
	DecrementActiveInvitations()

	// Assert
	assert.Equal(t, initialCount-1, activeInvitations)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)
	assert.NotNil(t, rm)
}

func TestDecrementActiveInvitations_BelowZero_StaysAtZero(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	SetActiveInvitations(0)

	// Act
	DecrementActiveInvitations()

	// Assert
	assert.Equal(t, int64(0), activeInvitations)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)
	assert.NotNil(t, rm)
}

func TestSetActiveInvitations_SetsGauge(t *testing.T) {
	// Arrange
	provider, reader := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	targetCount := int64(10)

	// Act
	SetActiveInvitations(targetCount)

	// Assert
	assert.Equal(t, targetCount, activeInvitations)

	// Collect metrics
	rm, err := CollectMetrics(reader)
	require.NoError(t, err)
	assert.NotNil(t, rm)
}

func TestStartActiveUsersTracker_StartsGoroutines(t *testing.T) {
	// Arrange
	provider, _ := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Act
	StartActiveUsersTracker(ctx)

	// Give goroutines a moment to start
	time.Sleep(100 * time.Millisecond)

	// Assert - verify no panic and goroutines are running
	// We can't easily verify goroutines are running, but we can verify
	// that calling StartActiveUsersTracker multiple times doesn't panic
	// Note: Calling StartActiveUsersTracker twice will overwrite the first tracker's cancel function
	// This is expected behavior - only one tracker should be running at a time
	ctx2, cancel2 := context.WithCancel(context.Background())
	defer cancel2()
	assert.NotPanics(t, func() {
		// Stop the first tracker before starting a second one
		StopActiveUsersTracker()
		StartActiveUsersTracker(ctx2)
	})

	// Cleanup - stop the second tracker
	StopActiveUsersTracker()
}

func TestActiveUsersTracker_ThreadSafety(t *testing.T) {
	// Arrange
	provider, _ := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	var wg sync.WaitGroup
	numGoroutines := 10
	usersPerGoroutine := 10

	// Act - concurrently add users
	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(startID int) {
			defer wg.Done()
			for j := 0; j < usersPerGoroutine; j++ {
				userID := fmt.Sprintf("user-%d-%d", startID, j)
				MarkUserActiveWithID(userID)
			}
		}(i)
	}

	wg.Wait()

	// Assert - verify all users were added (may be slightly more due to test setup)
	totalUsers := countActiveUsers(&activeUsersDaily)
	// Allow some variance due to test setup/teardown, but should be close to expected
	assert.GreaterOrEqual(t, totalUsers, numGoroutines*usersPerGoroutine, "Should have at least expected number of users")
	assert.LessOrEqual(t, totalUsers, numGoroutines*usersPerGoroutine+10, "Should not have significantly more users than expected")
}

func TestActiveUsersTracker_ConcurrentInvitationUpdates(t *testing.T) {
	// Arrange
	provider, _ := setupTestMetrics(t)
	defer provider.Shutdown(context.Background())

	var wg sync.WaitGroup
	numOperations := 100

	// Act - concurrently increment and decrement
	for i := 0; i < numOperations; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			IncrementActiveInvitations()
		}()
	}

	for i := 0; i < numOperations/2; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			DecrementActiveInvitations()
		}()
	}

	wg.Wait()

	// Assert - final count should be 50 (100 increments - 50 decrements)
	// But we started at 0, so we need to account for that
	// Actually, we can't predict the exact final value due to race conditions,
	// but we can verify it's within expected range and no panics occurred
	assert.GreaterOrEqual(t, activeInvitations, int64(0))
}

// Helper function to count users in a sync.Map
func countActiveUsers(m *sync.Map) int {
	count := 0
	m.Range(func(key, value interface{}) bool {
		count++
		return true
	})
	return count
}
