package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
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


