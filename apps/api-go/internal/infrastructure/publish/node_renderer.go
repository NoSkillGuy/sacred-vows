package publishinfra

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"

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
		return nil, errors.New("snapshot renderer script path is required (path to renderPublishedHTML.js)")
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

func (g *NodeSnapshotGenerator) GenerateBundle(ctx context.Context, invitationID string) (*publish.SnapshotBundle, error) {
	inv, err := g.invitationRepo.FindByID(ctx, invitationID)
	if err != nil {
		return nil, err
	}
	if inv == nil {
		return nil, fmt.Errorf("invitation not found")
	}

	// Keep invitation payload close to what the builder expects.
	payload := map[string]any{
		"invitation": map[string]any{
			"layoutId": inv.LayoutID,
			"data":     json.RawMessage(inv.Data),
		},
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
