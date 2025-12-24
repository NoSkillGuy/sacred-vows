#!/bin/bash
# Script to set up GitHub branch protection rules via GitHub API
# Uses GitHub CLI (gh) to automatically detect repository information

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh >/dev/null 2>&1; then
  echo -e "${RED}❌ Error: GitHub CLI (gh) is not installed${NC}"
  echo ""
  echo "Install it with:"
  echo "  brew install gh          # macOS"
  echo "  apt install gh           # Debian/Ubuntu"
  echo "  yum install gh           # RHEL/CentOS"
  echo ""
  echo "Or visit: https://cli.github.com/"
  echo ""
  exit 1
fi

# Check if gh is authenticated
if ! gh auth status >/dev/null 2>&1; then
  echo -e "${RED}❌ Error: GitHub CLI is not authenticated${NC}"
  echo ""
  echo "Authenticate with:"
  echo "  gh auth login"
  echo ""
  exit 1
fi

# Detect repository information using gh CLI
echo -e "${GREEN}🔍 Detecting repository information...${NC}"

REPO_OWNER=$(gh repo view --json owner --jq '.owner.login' 2>/dev/null)
REPO_NAME=$(gh repo view --json name --jq '.name' 2>/dev/null)
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name' 2>/dev/null)

# Use default branch or allow override via environment variable
BRANCH="${GITHUB_BRANCH:-${DEFAULT_BRANCH}}"

# Validate detected values
if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ] || [ -z "$BRANCH" ]; then
  echo -e "${RED}❌ Error: Could not detect repository information${NC}"
  echo "Make sure you're in a git repository and have access to it."
  echo ""
  echo "Detected values:"
  echo "  Owner: ${REPO_OWNER:-<not found>}"
  echo "  Name: ${REPO_NAME:-<not found>}"
  echo "  Branch: ${BRANCH:-<not found>}"
  exit 1
fi

echo -e "${GREEN}✓ Repository: ${REPO_OWNER}/${REPO_NAME}${NC}"
echo -e "${GREEN}✓ Branch: ${BRANCH}${NC}"
echo ""



# Branch protection configuration
# This requires:
# - Require status checks to pass before merging
# - Require branches to be up to date before merging
# - Require conversation resolution before merging
# - Do not allow force pushes
# - Do not allow deletions

PROTECTION_CONFIG=$(cat <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Lint",
      "Format Check",
      "Test (go)",
      "Test (builder)",
      "Test (edge-worker)",
      "Pre-commit Checks"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_linear_history": false,
  "allow_squash_merge": true,
  "allow_merge_commit": true,
  "allow_rebase_merge": true,
  "allow_auto_merge": false,
  "delete_branch_on_merge": false,
  "lock_branch": false
}
EOF
)

# Make API call using gh CLI
echo "📡 Configuring branch protection rules..."

ERROR_OUTPUT=$(gh api \
  --method PUT \
  "repos/${REPO_OWNER}/${REPO_NAME}/branches/${BRANCH}/protection" \
  --input - <<< "${PROTECTION_CONFIG}" 2>&1)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Branch protection rules successfully configured!${NC}"
  echo ""
  echo "The following rules are now active:"
  echo "  ✓ Status checks must pass before merging"
  echo "  ✓ Branches must be up to date before merging"
  echo "  ✓ Pull request reviews required (1 approval)"
  echo "  ✓ Force pushes are blocked"
  echo "  ✓ Branch deletions are blocked"
  echo "  ✓ Admin enforcement enabled"
  echo ""
  echo "Required status checks:"
  echo "  - Lint"
  echo "  - Format Check"
  echo "  - Test (go)"
  echo "  - Test (builder)"
  echo "  - Test (edge-worker)"
  echo "  - Pre-commit Checks"
  echo ""
  echo "You can view and modify these settings at:"
  echo "  https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches"
else
  echo -e "${RED}❌ Error: Failed to set up branch protection rules${NC}"
  echo ""
  if [ -n "$ERROR_OUTPUT" ]; then
    echo "Error details:"
    echo "$ERROR_OUTPUT" | sed 's/^/  /'
    echo ""
  fi
  echo "Possible reasons:"
  echo "  - Repository or branch not found"
  echo "  - Insufficient permissions (need admin access)"
  echo "  - Branch protection already configured with conflicting settings"
  exit 1
fi

