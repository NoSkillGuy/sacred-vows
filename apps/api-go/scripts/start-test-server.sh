#!/bin/bash
# Start backend server in test mode for E2E tests

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_GO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Create an empty test .env file to prevent the real .env from loading
# This ensures our test environment variables are not overridden
TEST_ENV_FILE="$API_GO_DIR/.env.test"
touch "$TEST_ENV_FILE"
export ENV_FILE="$TEST_ENV_FILE"

# Set all environment variables
# These will not be overridden since we're using a test .env file
export APP_ENV=test
export FIRESTORE_DATABASE=test
export PORT=3001
export ENABLE_TEST_ENDPOINTS=true
export GCP_PROJECT_ID=test-project
export FIRESTORE_EMULATOR_HOST=localhost:8080
export JWT_SECRET=test-jwt-secret-key-min-32-chars-long-for-security
export REFRESH_TOKEN_HMAC_KEYS='[{"id":1,"key_b64":"dGVzdC1rZXktZm9yLXRlc3Rpbmctb25seS0zMi1jaGFycy1sb25n"}]'
export REFRESH_TOKEN_HMAC_ACTIVE_KEY_ID=1
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_ASSETS_BUCKET=sacred-vows-assets-test
export S3_REGION=us-east-1
export R2_ENDPOINT=http://localhost:9000
export R2_ACCESS_KEY_ID=minioadmin
export R2_SECRET_ACCESS_KEY=minioadmin
export R2_BUCKET=sacred-vows-published-test
export PUBLIC_ASSETS_R2_BUCKET=sacred-vows-public-assets-test
export PUBLIC_ASSETS_CDN_URL=http://localhost:9000/sacred-vows-public-assets-test

# Change to the api-go directory
cd "$API_GO_DIR" || exit 1

# Run the server
go run cmd/server/main.go

