#!/bin/bash
# Helper script to set CLOUDFLARE_API_TOKEN from keys.yaml
# Usage: source set-cloudflare-token.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
KEYS_FILE="$PROJECT_ROOT/keys.yaml"

if [ -f "$KEYS_FILE" ]; then
  export CLOUDFLARE_API_TOKEN=$(grep -A 1 "Cloudflare:" "$KEYS_FILE" | grep "API_TOKEN:" | awk '{print $2}')
  if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo "✅ CLOUDFLARE_API_TOKEN exported successfully"
  else
    echo "❌ Failed to extract token from $KEYS_FILE"
    return 1 2>/dev/null || exit 1
  fi
else
  echo "❌ Keys file not found at $KEYS_FILE"
  return 1 2>/dev/null || exit 1
fi

