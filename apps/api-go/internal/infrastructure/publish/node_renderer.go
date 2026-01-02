package publishinfra

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/internal/usecase/publish"
)

type NodeSnapshotGenerator struct {
	invitationRepo repository.InvitationRepository
	nodeBinary     string
	scriptPath     string
}

func NewNodeSnapshotGenerator(invitationRepo repository.InvitationRepository, scriptPath string, nodeBinary string) (*NodeSnapshotGenerator, error) {
	if scriptPath == "" {
		return nil, errors.New("snapshot renderer script path is required (path to apps/renderer/dist-ssr/render.js)")
	}

	// In Docker containers, ensure absolute paths starting with /app are used as-is
	// This prevents resolution against host filesystem when volumes are mounted
	if len(scriptPath) > 0 && scriptPath[0] == '/' {
		// Absolute path - verify it exists
		if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
			return nil, fmt.Errorf("snapshot renderer script not found at: %s", scriptPath)
		}
		if nodeBinary == "" {
			nodeBinary = "node"
		}
		return &NodeSnapshotGenerator{
			invitationRepo: invitationRepo,
			nodeBinary:     nodeBinary,
			scriptPath:     scriptPath,
		}, nil
	}

	// Resolve the script path (handle relative paths for local dev convenience)
	resolvedPath, err := resolveScriptPath(scriptPath)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve script path: %w", err)
	}

	// Verify the file exists
	if _, err := os.Stat(resolvedPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("snapshot renderer script not found at: %s", resolvedPath)
	}

	if nodeBinary == "" {
		nodeBinary = "node"
	}
	return &NodeSnapshotGenerator{
		invitationRepo: invitationRepo,
		nodeBinary:     nodeBinary,
		scriptPath:     resolvedPath,
	}, nil
}

// resolveScriptPath resolves the script path:
// - Absolute paths are used as-is
// - Relative paths are resolved relative to workspace root (for local dev convenience)
func resolveScriptPath(scriptPath string) (string, error) {
	// If it's already an absolute path (starts with /), use it as-is
	// This handles both Unix paths and ensures Docker container paths work correctly
	if filepath.IsAbs(scriptPath) || (len(scriptPath) > 0 && scriptPath[0] == '/') {
		return scriptPath, nil
	}

	// For relative paths, resolve relative to workspace root (local dev only)
	cwd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("failed to get current working directory: %w", err)
	}

	workspaceRoot := findWorkspaceRoot(cwd)
	if workspaceRoot == "" {
		return "", errors.New("relative paths require workspace root (looking for apps/builder directory); use absolute path in Docker")
	}

	resolved := filepath.Join(workspaceRoot, scriptPath)
	absPath, err := filepath.Abs(resolved)
	if err != nil {
		return "", fmt.Errorf("failed to resolve absolute path: %w", err)
	}
	return absPath, nil
}

// findWorkspaceRoot finds the workspace root by looking for the apps/builder directory
func findWorkspaceRoot(startPath string) string {
	current := startPath
	for {
		// Check if apps/builder exists at this level
		builderPath := filepath.Join(current, "apps", "builder")
		if info, err := os.Stat(builderPath); err == nil && info.IsDir() {
			return current
		}

		// Go up one level
		parent := filepath.Dir(current)
		if parent == current {
			// Reached filesystem root
			break
		}
		current = parent
	}
	return ""
}

func (g *NodeSnapshotGenerator) GenerateBundle(ctx context.Context, invitationID string) (*publish.SnapshotBundle, error) {
	inv, err := g.invitationRepo.FindByID(ctx, invitationID)
	if err != nil {
		return nil, err
	}
	if inv == nil {
		return nil, fmt.Errorf("invitation not found")
	}

	// Parse the data JSON to extract layoutConfig if it exists
	var dataMap map[string]any
	if err := json.Unmarshal(inv.Data, &dataMap); err != nil {
		return nil, fmt.Errorf("failed to parse invitation data: %w", err)
	}

	// Extract layoutConfig from data if it exists
	var layoutConfig any
	if lc, ok := dataMap["layoutConfig"]; ok {
		layoutConfig = lc
		// Remove layoutConfig from data to avoid duplication
		delete(dataMap, "layoutConfig")
	}

	// Re-marshal data without layoutConfig
	dataWithoutLayoutConfig, err := json.Marshal(dataMap)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal invitation data: %w", err)
	}

	// Build invitation payload matching InvitationData structure
	invitationPayload := map[string]any{
		"layoutId": inv.LayoutID,
		"data":     json.RawMessage(dataWithoutLayoutConfig),
	}

	// Include layoutConfig at top level if it was found
	if layoutConfig != nil {
		invitationPayload["layoutConfig"] = layoutConfig
	}

	// Keep invitation payload close to what the builder expects.
	payload := map[string]any{
		"invitation":   invitationPayload,
		"translations": map[string]any{},
	}

	stdin, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	cmd := exec.CommandContext(ctx, g.nodeBinary, g.scriptPath, "--mode=bundle")
	cmd.Stdin = bytes.NewReader(stdin)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("snapshot renderer failed: %w: %s", err, stderr.String())
	}

	// stdout is JSON bundle: { html, css, manifest, assets: [] }
	var out struct {
		HTML     string          `json:"html"`
		CSS      string          `json:"css"`
		Manifest json.RawMessage `json:"manifest"`
		Assets   []struct {
			KeySuffix   string `json:"keySuffix"`
			ContentType string `json:"contentType"`
			BodyBase64  string `json:"bodyBase64"`
		} `json:"assets"`
	}
	if err := json.Unmarshal(stdout.Bytes(), &out); err != nil {
		return nil, fmt.Errorf("invalid renderer output: %w", err)
	}

	bundle := &publish.SnapshotBundle{
		IndexHTML: []byte(out.HTML),
		StylesCSS: []byte(out.CSS),
		Manifest:  []byte(out.Manifest),
		Assets:    nil,
	}

	if len(out.Assets) > 0 {
		bundle.Assets = make([]publish.SnapshotAsset, 0, len(out.Assets))
		for _, a := range out.Assets {
			if a.KeySuffix == "" || a.BodyBase64 == "" {
				continue
			}
			b, err := base64.StdEncoding.DecodeString(a.BodyBase64)
			if err != nil {
				continue
			}
			bundle.Assets = append(bundle.Assets, publish.SnapshotAsset{
				KeySuffix:   a.KeySuffix,
				ContentType: a.ContentType,
				Body:        b,
			})
		}
	}
	return bundle, nil
}
