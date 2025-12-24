package auth

import (
	"bytes"
	"encoding/base64"
	"testing"
)

func TestDecodeRefreshToken_URLEncoding(t *testing.T) {
	raw := []byte("this-is-a-test-token-bytes-32........")
	token := base64.URLEncoding.EncodeToString(raw)

	got, err := DecodeRefreshToken(token)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if !bytes.Equal(got, raw) {
		t.Fatalf("decoded mismatch")
	}
}

func TestComputeRefreshTokenFingerprint_Deterministic(t *testing.T) {
	key := bytes.Repeat([]byte{0x42}, 32)
	token := []byte("abc")
	fp1 := ComputeRefreshTokenFingerprint(key, token)
	fp2 := ComputeRefreshTokenFingerprint(key, token)
	if !bytes.Equal(fp1, fp2) {
		t.Fatalf("expected deterministic fingerprint")
	}
	if len(fp1) != 32 {
		t.Fatalf("expected sha256 length 32, got %d", len(fp1))
	}
}
