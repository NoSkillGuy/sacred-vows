package publishinfra

import (
	"strings"
	"testing"
)

func TestValidateSubdomain(t *testing.T) {
	tests := []struct {
		name      string
		subdomain string
		ok        bool
	}{
		// Valid subdomains
		{"valid_simple", "example", true},
		{"valid_with_hyphen", "example-site", true},
		{"valid_with_numbers", "example123", true},
		{"valid_mixed", "example-site-123", true},
		{"valid_single_char", "a", true},
		{"valid_max_length", "a" + strings.Repeat("b", 62), true}, // 63 chars total
		{"valid_dns_style", "my-wedding-site", true},

		// Invalid: empty
		{"reject_empty", "", false},

		// Invalid: path traversal
		{"reject_dot_dot", "..", false},
		{"reject_dot_dot_slash", "../", false},
		{"reject_contains_dot_dot", "example..site", false},
		{"reject_starts_dot_dot", "../example", false},
		{"reject_ends_dot_dot", "example..", false},

		// Invalid: path separators
		{"reject_slash", "example/site", false},
		{"reject_backslash", "example\\site", false},
		{"reject_starts_slash", "/example", false},
		{"reject_ends_slash", "example/", false},

		// Invalid: dots (not allowed in subdomain for our use case)
		{"reject_dot", "example.site", false},
		{"reject_starts_dot", ".example", false},
		{"reject_ends_dot", "example.", false},
		{"reject_multiple_dots", "example..site", false},

		// Invalid: starts/ends with hyphen
		{"reject_starts_hyphen", "-example", false},
		{"reject_ends_hyphen", "example-", false},
		{"reject_starts_ends_hyphen", "-example-", false},

		// Invalid: invalid characters
		{"reject_underscore", "example_site", false},
		{"reject_space", "example site", false},
		{"valid_uppercase", "EXAMPLE", true}, // Uppercase is valid (converted to lowercase)
		{"valid_mixed_case", "Example-Site", true}, // Mixed case is valid (converted to lowercase)
		{"reject_special_chars", "example@site", false},
		{"reject_unicode", "example-ñ-site", false},

		// Invalid: length
		{"reject_too_long", strings.Repeat("a", 64), false}, // 64 chars (over limit)
		{"reject_very_long", strings.Repeat("a", 100), false},

		// Edge cases
		{"reject_only_hyphen", "-", false},
		{"reject_only_dot", ".", false},
		{"reject_only_slash", "/", false},
		{"reject_only_backslash", "\\", false},
		{"reject_mixed_separators", "example/../site", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateSubdomain(tt.subdomain)
			if tt.ok && err != nil {
				t.Fatalf("expected ok, got err=%v", err)
			}
			if !tt.ok && err == nil {
				t.Fatalf("expected err, got nil")
			}
		})
	}
}

