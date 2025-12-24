#!/bin/bash
# Pre-commit checks for file size, type, and secrets

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

ERRORS=0

# Check for blocked file patterns
check_blocked_files() {
  echo "🔍 Checking for blocked file patterns..."

  # Files that should never be committed
  BLOCKED_PATTERNS=(
    "*.env"
    "*.key"
    "*.pem"
    "*.p12"
    "*.pfx"
    "node_modules/"
    ".env.local"
    ".env.production"
    "keys.yaml"
  )

  for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if git diff --cached --name-only --diff-filter=ACM | grep -q "$pattern"; then
      echo -e "${RED}❌ Blocked file pattern detected: $pattern${NC}"
      echo -e "${YELLOW}   Please remove these files from staging or add them to .gitignore${NC}"
      ERRORS=$((ERRORS + 1))
    fi
  done
}

# Check file sizes (warn if > 1MB, block if > 10MB)
check_file_sizes() {
  echo "📏 Checking file sizes..."

  MAX_WARN_SIZE=1048576  # 1MB
  MAX_BLOCK_SIZE=10485760  # 10MB

  while IFS= read -r file; do
    if [ -f "$file" ]; then
      size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)

      # Format file size (handle both GNU and BSD/macOS)
      if command -v numfmt >/dev/null 2>&1; then
        size_display=$(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size} bytes")
      else
        # Fallback for macOS/BSD
        if [ "$size" -gt 1073741824 ]; then
          size_display=$(awk "BEGIN {printf \"%.2fGB\", $size/1073741824}")
        elif [ "$size" -gt 1048576 ]; then
          size_display=$(awk "BEGIN {printf \"%.2fMB\", $size/1048576}")
        elif [ "$size" -gt 1024 ]; then
          size_display=$(awk "BEGIN {printf \"%.2fKB\", $size/1024}")
        else
          size_display="${size} bytes"
        fi
      fi

      if [ "$size" -gt "$MAX_BLOCK_SIZE" ]; then
        echo -e "${RED}❌ File too large: $file ($size_display)${NC}"
        echo -e "${YELLOW}   Files larger than 10MB should not be committed. Use Git LFS or external storage.${NC}"
        ERRORS=$((ERRORS + 1))
      elif [ "$size" -gt "$MAX_WARN_SIZE" ]; then
        echo -e "${YELLOW}⚠️  Large file detected: $file ($size_display)${NC}"
        echo -e "${YELLOW}   Consider using Git LFS for large files.${NC}"
      fi
    fi
  done < <(git diff --cached --name-only --diff-filter=ACM)
}

# Check for secrets (basic patterns)
check_secrets() {
  echo "🔐 Checking for potential secrets..."

  # Basic secret patterns (gitleaks would be better, but this is a fallback)
  SECRET_PATTERNS=(
    "AKIA[0-9A-Z]{16}"  # AWS Access Key
    "sk_live_[0-9a-zA-Z]{32,}"  # Stripe live key
    "sk_test_[0-9a-zA-Z]{32,}"  # Stripe test key
    "AIza[0-9A-Za-z\\-_]{35}"  # Google API key
    "ya29\\.[0-9A-Za-z\\-_]+"  # Google OAuth token
    "xox[baprs]-[0-9a-zA-Z\\-]{10,48}"  # Slack token
    "ghp_[0-9a-zA-Z]{36}"  # GitHub personal access token
    "gho_[0-9a-zA-Z]{36}"  # GitHub OAuth token
    "ghu_[0-9a-zA-Z]{36}"  # GitHub user-to-server token
    "ghs_[0-9a-zA-Z]{36}"  # GitHub server-to-server token
    "ghr_[0-9a-zA-Z]{76}"  # GitHub refresh token
    "-----BEGIN.*PRIVATE KEY-----"  # Private keys
    "-----BEGIN RSA PRIVATE KEY-----"  # RSA private keys
  )

  while IFS= read -r file; do
    if [ -f "$file" ]; then
      # Skip files in .gitignore
      if git check-ignore -q "$file" 2>/dev/null; then
        continue
      fi

      # Skip binary files
      if file "$file" 2>/dev/null | grep -qE "(text|ASCII|UTF-8)"; then
        for pattern in "${SECRET_PATTERNS[@]}"; do
          if grep -qE "$pattern" "$file" 2>/dev/null; then
            echo -e "${RED}❌ Potential secret detected in: $file${NC}"
            echo -e "${YELLOW}   Pattern matched: $pattern${NC}"
            echo -e "${YELLOW}   Please remove secrets and use environment variables or secrets management.${NC}"
            ERRORS=$((ERRORS + 1))
          fi
        done
      fi
    fi
  done < <(git diff --cached --name-only --diff-filter=ACM)
}

# Check for trailing whitespace and missing EOF newlines
check_whitespace() {
  echo "🧹 Checking for trailing whitespace and EOF issues..."

  while IFS= read -r file; do
    if [ -f "$file" ] && file "$file" | grep -q "text"; then
      # Check for trailing whitespace
      if grep -l "[[:space:]]$" "$file" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Trailing whitespace found in: $file${NC}"
        # Auto-fix trailing whitespace
        sed -i '' 's/[[:space:]]*$//' "$file" 2>/dev/null || sed -i 's/[[:space:]]*$//' "$file" 2>/dev/null
        git add "$file"
      fi

      # Check for missing newline at EOF
      if [ -s "$file" ] && [ "$(tail -c 1 "$file" | wc -l)" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Missing newline at EOF in: $file${NC}"
        echo "" >> "$file"
        git add "$file"
      fi
    fi
  done < <(git diff --cached --name-only --diff-filter=ACM)
}

# Run all checks
main() {
  echo "🚀 Running pre-commit checks..."
  echo ""

  check_blocked_files
  check_file_sizes
  check_whitespace
  check_secrets

  echo ""
  if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Pre-commit checks failed with $ERRORS error(s)${NC}"
    exit 1
  else
    echo -e "${GREEN}✅ All pre-commit checks passed${NC}"
    exit 0
  fi
}

main

