package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type RefreshTokenHMACKey struct {
	ID  int16
	Key []byte
}

// DecodeRefreshToken decodes a refresh token string into raw bytes for fingerprinting.
// Tokens in this project are base64-encoded strings (often with padding).
func DecodeRefreshToken(token string) ([]byte, error) {
	// Try URL-safe (padded), then standard (padded), then URL-safe raw.
	if b, err := base64.URLEncoding.DecodeString(token); err == nil {
		return b, nil
	}
	if b, err := base64.StdEncoding.DecodeString(token); err == nil {
		return b, nil
	}
	if b, err := base64.RawURLEncoding.DecodeString(token); err == nil {
		return b, nil
	}
	return nil, fmt.Errorf("invalid refresh token encoding")
}

func ComputeRefreshTokenFingerprint(key []byte, tokenBytes []byte) []byte {
	mac := hmac.New(sha256.New, key)
	_, _ = mac.Write(tokenBytes)
	return mac.Sum(nil)
}

// HashToken hashes a refresh token using bcrypt for secure storage
func HashToken(token string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(token), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash token: %w", err)
	}
	return string(hash), nil
}

// CompareTokenHash compares a plain token with a hashed token
func CompareTokenHash(token, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(token))
	return err == nil
}

// HashTokenForStorage creates a deterministic SHA-256 hash of the token for storage and lookup
// This is different from password hashing (bcrypt) because we need to be able to look up tokens
// Used for password reset tokens where we need deterministic hashing for database lookups
func HashTokenForStorage(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

