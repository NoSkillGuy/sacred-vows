package publishinfra

import "testing"

func TestValidateArtifactKey(t *testing.T) {
	tests := []struct {
		name string
		key  string
		ok   bool
	}{
		{"ok_simple", "sites/foo/v1/index.html", true},
		{"ok_assets", "sites/foo/v2/assets/photos/1.jpeg", true},
		{"reject_empty", "", false},
		{"reject_abs", "/sites/foo/v1/index.html", false},
		{"reject_dot", ".", false},
		{"reject_parent", "..", false},
		{"reject_escape", "../x", false},
		{"reject_normalize", "sites/foo/v1/../v2/index.html", false},
		{"reject_normalize2", "sites/foo/v1/assets/../index.html", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateArtifactKey(tt.key)
			if tt.ok && err != nil {
				t.Fatalf("expected ok, got err=%v", err)
			}
			if !tt.ok && err == nil {
				t.Fatalf("expected err, got nil")
			}
		})
	}
}


