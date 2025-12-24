package publish

import (
	"strings"
	"unicode"

	"github.com/sacred-vows/api-go/internal/domain"
)

// NormalizeSubdomain lowercases and trims. It rejects invalid characters.
func NormalizeSubdomain(raw string) (string, error) {
	s := strings.ToLower(strings.TrimSpace(raw))
	if s == "" {
		return "", domain.ErrInvalidSubdomain
	}
	// Convert spaces/underscores to hyphen for convenience.
	s = strings.ReplaceAll(s, " ", "-")
	s = strings.ReplaceAll(s, "_", "-")

	if len(s) < 3 || len(s) > 63 {
		return "", domain.ErrInvalidSubdomain
	}
	if strings.HasPrefix(s, "-") || strings.HasSuffix(s, "-") {
		return "", domain.ErrInvalidSubdomain
	}
	if strings.Contains(s, "--") {
		return "", domain.ErrInvalidSubdomain
	}
	for _, r := range s {
		if r == '-' {
			continue
		}
		if unicode.IsDigit(r) || (r >= 'a' && r <= 'z') {
			continue
		}
		return "", domain.ErrInvalidSubdomain
	}
	return s, nil
}

func IsReservedSubdomain(subdomain string) bool {
	switch subdomain {
	case "www", "api", "admin", "support", "mail", "assets":
		return true
	default:
		return false
	}
}
