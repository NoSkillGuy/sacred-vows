package auth

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"sync"
	"time"
)

// oauthStateStore manages OAuth state values with expiration
type oauthStateStore struct {
	mu      sync.RWMutex
	states  map[string]time.Time
	timeout time.Duration
}

// newOAuthStateStore creates a new OAuth state store with the given timeout
func newOAuthStateStore(timeout time.Duration) *oauthStateStore {
	store := &oauthStateStore{
		states:  make(map[string]time.Time),
		timeout: timeout,
	}
	// Start cleanup goroutine
	go store.cleanup()
	return store
}

// generateState creates a cryptographically secure random state value
func (s *oauthStateStore) generateState() (string, error) {
	// Generate 32 random bytes (256 bits)
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate random state: %w", err)
	}
	// Encode as base64 URL-safe string
	state := base64.URLEncoding.EncodeToString(b)

	// Store with expiration
	s.mu.Lock()
	s.states[state] = time.Now().Add(s.timeout)
	s.mu.Unlock()

	return state, nil
}

// verifyState checks if a state value exists and is not expired, then removes it
func (s *oauthStateStore) verifyState(state string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	expires, exists := s.states[state]
	if !exists {
		return false
	}

	// Check if expired
	if time.Now().After(expires) {
		delete(s.states, state)
		return false
	}

	// State is valid, remove it (one-time use)
	delete(s.states, state)
	return true
}

// cleanup periodically removes expired states
func (s *oauthStateStore) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		for state, expires := range s.states {
			if now.After(expires) {
				delete(s.states, state)
			}
		}
		s.mu.Unlock()
	}
}
