#!/bin/bash
# Initialize local MinIO buckets and upload default assets
# This script sets up the local R2 environment for development

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://localhost:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"
PUBLISHED_BUCKET="${PUBLISHED_BUCKET:-sacred-vows-published-local}"
PUBLIC_ASSETS_BUCKET="${PUBLIC_ASSETS_BUCKET:-sacred-vows-public-assets-local}"
ASSETS_BUCKET="${ASSETS_BUCKET:-sacred-vows-assets-local}"

echo -e "${GREEN}🚀 Initializing local R2 (MinIO) environment${NC}"
echo "   Endpoint: $MINIO_ENDPOINT"
echo "   Published bucket: $PUBLISHED_BUCKET"
echo "   Public assets bucket: $PUBLIC_ASSETS_BUCKET"
echo "   Assets bucket: $ASSETS_BUCKET"
echo ""

# Check if MinIO is accessible
echo -e "${YELLOW}Checking MinIO availability...${NC}"
if ! curl -sf "$MINIO_ENDPOINT/minio/health/live" > /dev/null 2>&1; then
  echo -e "${RED}❌ MinIO is not accessible at $MINIO_ENDPOINT${NC}"
  echo "   Make sure MinIO is running: docker-compose up -d minio"
  exit 1
fi
echo -e "${GREEN}✓ MinIO is accessible${NC}"

# Install mc (MinIO Client) if not available
if ! command -v mc &> /dev/null; then
  echo -e "${YELLOW}Installing MinIO Client (mc)...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v brew &> /dev/null; then
      brew install minio/stable/mc
    else
      echo -e "${RED}❌ Please install mc manually: brew install minio/stable/mc${NC}"
      exit 1
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /tmp/mc
    chmod +x /tmp/mc
    sudo mv /tmp/mc /usr/local/bin/mc
  else
    echo -e "${RED}❌ Please install mc manually from https://min.io/docs/minio/linux/reference/minio-mc.html${NC}"
    exit 1
  fi
fi

# Configure mc alias
ALIAS_NAME="local-r2"
echo -e "${YELLOW}Configuring MinIO client...${NC}"
mc alias set "$ALIAS_NAME" "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api s3v4 > /dev/null 2>&1 || true
echo -e "${GREEN}✓ MinIO client configured${NC}"

# Create buckets
echo -e "${YELLOW}Creating buckets...${NC}"
mc mb "$ALIAS_NAME/$PUBLISHED_BUCKET" --ignore-existing 2>/dev/null || true
mc mb "$ALIAS_NAME/$PUBLIC_ASSETS_BUCKET" --ignore-existing 2>/dev/null || true
mc mb "$ALIAS_NAME/$ASSETS_BUCKET" --ignore-existing 2>/dev/null || true
echo -e "${GREEN}✓ Buckets created${NC}"

# Set public access policy for public assets bucket
echo -e "${YELLOW}Setting public access policy for public assets bucket...${NC}"
# Create a public read policy JSON
cat > /tmp/public-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::$PUBLIC_ASSETS_BUCKET/*"]
    }
  ]
}
EOF

mc anonymous set-json /tmp/public-policy.json "$ALIAS_NAME/$PUBLIC_ASSETS_BUCKET" 2>/dev/null || {
  # Alternative: use mc anonymous set download
  mc anonymous set download "$ALIAS_NAME/$PUBLIC_ASSETS_BUCKET" 2>/dev/null || true
}
rm -f /tmp/public-policy.json
echo -e "${GREEN}✓ Public access policy set${NC}"

# Upload default assets if assets directory exists (relative to this script's location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$SCRIPT_DIR/assets" ]; then
  echo -e "${YELLOW}Uploading default assets...${NC}"
  echo "   This may take a while..."
  
  # Upload photos
  if [ -d "$SCRIPT_DIR/assets/photos" ]; then
    echo "   Uploading photos..."
    mc cp --recursive "$SCRIPT_DIR/assets/photos/" "$ALIAS_NAME/$PUBLIC_ASSETS_BUCKET/defaults/" --exclude "*.DS_Store" 2>/dev/null || true
  fi
  
  # Upload layouts
  if [ -d "$SCRIPT_DIR/layouts" ]; then
    echo "   Uploading layouts..."
    mc cp --recursive "$SCRIPT_DIR/layouts/" "$ALIAS_NAME/$PUBLIC_ASSETS_BUCKET/defaults/layouts/" --exclude "*.DS_Store" 2>/dev/null || true
  fi
  
  # Upload music
  if [ -d "$SCRIPT_DIR/assets/music" ]; then
    echo "   Uploading music..."
    mc cp --recursive "$SCRIPT_DIR/assets/music/" "$ALIAS_NAME/$PUBLIC_ASSETS_BUCKET/defaults/music/" --exclude "*.DS_Store" 2>/dev/null || true
  fi
  
  echo -e "${GREEN}✓ Default assets uploaded${NC}"
else
  echo -e "${YELLOW}⚠ Assets directory not found, skipping asset upload${NC}"
  echo "   You can upload assets later using: npm run migrate-assets"
fi

echo ""
echo -e "${GREEN}✅ Local R2 initialization complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Make sure your .env files are configured:"
echo "   - apps/api-go/.env: R2_ENDPOINT=$MINIO_ENDPOINT"
echo "   - apps/builder/.env: VITE_PUBLIC_ASSETS_CDN_URL=$MINIO_ENDPOINT/$PUBLIC_ASSETS_BUCKET"
echo "2. Start your services: docker-compose up"
echo "3. Access MinIO console at: http://localhost:9001"
echo "   Login: $MINIO_ACCESS_KEY / $MINIO_SECRET_KEY"

