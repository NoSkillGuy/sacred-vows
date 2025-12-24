#!/bin/bash
# Helper script to select the correct .env file based on environment
# Usage: ./scripts/select-env.sh [local|docker]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_GO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_TYPE="${1:-local}"

case "$ENV_TYPE" in
  local)
    ENV_FILE="$API_GO_DIR/.env.local"
    TARGET="$API_GO_DIR/.env"
    echo "Selecting .env.local for local development..."
    ;;
  docker)
    ENV_FILE="$API_GO_DIR/.env.docker"
    TARGET="$API_GO_DIR/.env"
    echo "Selecting .env.docker for Docker development..."
    ;;
  *)
    echo "Usage: $0 [local|docker]"
    echo "  local  - Use .env.local (for running directly on host)"
    echo "  docker - Use .env.docker (for running in Docker)"
    exit 1
    ;;
esac

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE does not exist"
  echo "Please create it based on env.example"
  exit 1
fi

# Create symlink or copy
if [ -L "$TARGET" ] || [ -f "$TARGET" ]; then
  echo "Removing existing .env file..."
  rm -f "$TARGET"
fi

ln -sf "$(basename "$ENV_FILE")" "$TARGET"
echo "✓ Created symlink: .env -> $(basename "$ENV_FILE")"
echo ""
echo "Current .env points to: $(readlink "$TARGET" 2>/dev/null || echo "not a symlink")"

