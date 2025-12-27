package auth

import (
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestOAuthStateStore_GenerateState(t *testing.T) {
	store := newOAuthStateStore(10 * time.Minute)

	// Generate multiple states and verify they're unique
	states := make(map[string]bool)
	for i := 0; i < 100; i++ {
		state, err := store.generateState()
		require.NoError(t, err)
		require.NotEmpty(t, state, "State should not be empty")
		require.False(t, states[state], "State should be unique")
		states[state] = true
	}
}

func TestOAuthStateStore_GenerateState_Format(t *testing.T) {
	store := newOAuthStateStore(10 * time.Minute)

	state, err := store.generateState()
	require.NoError(t, err)
	require.NotEmpty(t, state)

	// State should be base64 URL-safe encoded
	// Base64 URL encoding of 32 bytes = 43 or 44 characters (may have padding)
	// Must be at least 43 characters (32 bytes * 4/3 = 42.67, rounded up)
	assert.GreaterOrEqual(t, len(state), 43, "State should be at least 43 characters (base64 of 32 bytes)")
	assert.LessOrEqual(t, len(state), 44, "State should be at most 44 characters (base64 of 32 bytes with optional padding)")
	assert.NotContains(t, state, "+", "State should not contain +")
	assert.NotContains(t, state, "/", "State should not contain /")
	// Padding (=) is allowed in base64 URL encoding, but typically not present for 32 bytes
}

func TestOAuthStateStore_VerifyState_Valid(t *testing.T) {
	store := newOAuthStateStore(10 * time.Minute)

	state, err := store.generateState()
	require.NoError(t, err)

	// First verification should succeed
	assert.True(t, store.verifyState(state), "Valid state should verify successfully")
}

func TestOAuthStateStore_VerifyState_OneTimeUse(t *testing.T) {
	store := newOAuthStateStore(10 * time.Minute)

	state, err := store.generateState()
	require.NoError(t, err)

	// First verification should succeed
	assert.True(t, store.verifyState(state), "First verification should succeed")

	// Second verification should fail (one-time use)
	assert.False(t, store.verifyState(state), "Second verification should fail (one-time use)")
}

func TestOAuthStateStore_VerifyState_Expired(t *testing.T) {
	store := newOAuthStateStore(100 * time.Millisecond)

	state, err := store.generateState()
	require.NoError(t, err)

	// Wait for expiration
	time.Sleep(150 * time.Millisecond)

	// Verify expired state is rejected
	assert.False(t, store.verifyState(state), "Expired state should be rejected")
}

func TestOAuthStateStore_VerifyState_InvalidState(t *testing.T) {
	store := newOAuthStateStore(10 * time.Minute)

	// Verify non-existent state is rejected
	assert.False(t, store.verifyState("non-existent-state"), "Non-existent state should be rejected")
	assert.False(t, store.verifyState(""), "Empty state should be rejected")
}

func TestOAuthStateStore_VerifyState_EdgeCases(t *testing.T) {
	store := newOAuthStateStore(10 * time.Minute)

	// Test various invalid state formats
	invalidStates := []string{
		"",
		"invalid-state",
		"../",
		"../../",
		"state with spaces",
		"state\nwith\nnewlines",
		"state\twith\ttabs",
	}

	for _, invalidState := range invalidStates {
		assert.False(t, store.verifyState(invalidState), "Invalid state '%s' should be rejected", invalidState)
	}
}

func TestOAuthStateStore_ConcurrentAccess(t *testing.T) {
	store := newOAuthStateStore(10 * time.Minute)

	// Generate states concurrently
	const numGoroutines = 50
	const statesPerGoroutine = 10

	var wg sync.WaitGroup
	allStates := make(chan string, numGoroutines*statesPerGoroutine)

	// Generate states concurrently
	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < statesPerGoroutine; j++ {
				state, err := store.generateState()
				require.NoError(t, err)
				allStates <- state
			}
		}()
	}

	wg.Wait()
	close(allStates)

	// Verify all states are unique
	stateMap := make(map[string]bool)
	for state := range allStates {
		assert.False(t, stateMap[state], "State should be unique")
		stateMap[state] = true
	}

	// Verify all states can be verified
	for state := range stateMap {
		assert.True(t, store.verifyState(state), "State should verify successfully")
		// Verify one-time use
		assert.False(t, store.verifyState(state), "State should not verify twice")
	}
}

func TestOAuthStateStore_Cleanup(t *testing.T) {
	// Use a short timeout and cleanup interval for testing
	store := newOAuthStateStore(100 * time.Millisecond)

	// Generate a state
	state, err := store.generateState()
	require.NoError(t, err)

	// Verify it exists
	assert.True(t, store.verifyState(state), "State should exist before expiration")

	// Generate another state
	state2, err := store.generateState()
	require.NoError(t, err)

	// Wait for expiration (state should be cleaned up)
	time.Sleep(200 * time.Millisecond)

	// Verify expired state is rejected
	assert.False(t, store.verifyState(state2), "Expired state should be rejected after cleanup")

	// Generate a new state after cleanup
	state3, err := store.generateState()
	require.NoError(t, err)
	assert.True(t, store.verifyState(state3), "New state should verify successfully")
}

func TestOAuthStateStore_ConcurrentVerify(t *testing.T) {
	store := newOAuthStateStore(10 * time.Minute)

	state, err := store.generateState()
	require.NoError(t, err)

	// Try to verify the same state concurrently (should only succeed once)
	const numGoroutines = 10
	results := make(chan bool, numGoroutines)
	var wg sync.WaitGroup

	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results <- store.verifyState(state)
		}()
	}

	wg.Wait()
	close(results)

	// Only one verification should succeed (one-time use)
	successCount := 0
	for result := range results {
		if result {
			successCount++
		}
	}

	assert.Equal(t, 1, successCount, "Only one concurrent verification should succeed")
}
