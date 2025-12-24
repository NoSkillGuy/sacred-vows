# Branch Protection Rules

This repository uses GitHub branch protection rules to ensure code quality and prevent merging of pull requests with failing checks.

## Overview

Branch protection rules enforce that:
- ✅ All CI checks must pass before merging
- ✅ Pull requests must be reviewed and approved
- ✅ Branches must be up to date before merging
- ✅ Force pushes and branch deletions are blocked
- ✅ Even administrators must follow these rules

## Required Status Checks

The following CI checks must pass before a PR can be merged:

1. **Lint** - Runs linting for Go, TypeScript/JavaScript code
2. **Format Check** - Verifies code formatting (Go fmt, Prettier)
3. **Test (go)** - Runs Go unit tests
4. **Test (builder)** - Runs Builder application tests
5. **Test (edge-worker)** - Runs Edge Worker type checking
6. **Pre-commit Checks** - Runs pre-commit validation checks

## Setting Up Branch Protection

### Option 1: Automated Setup (Recommended)

Use the provided script to automatically configure branch protection rules. The script uses GitHub CLI (`gh`) to automatically detect repository information.

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- Repository admin permissions

**Setup:**

```bash
# 1. Install GitHub CLI (if not already installed)
#    macOS: brew install gh
#    Linux: See https://cli.github.com/

# 2. Authenticate with GitHub
gh auth login

# 3. (Optional) Override default branch if needed
export GITHUB_BRANCH=main  # Default is auto-detected

# 4. Run the setup script
./scripts/setup-branch-protection.sh
```

The script will:
- Automatically detect repository owner and name using `gh repo view`
- Detect the default branch (or use `GITHUB_BRANCH` if set)
- Use your `gh` authentication token
- Configure branch protection for the detected branch
- Set up required status checks
- Enable pull request review requirements
- Block force pushes and deletions

**Note:** The script uses `gh` CLI exclusively - no fallbacks or manual configuration needed. Just make sure `gh` is installed and authenticated.

### Option 2: Manual Setup via GitHub UI

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** or edit the existing rule for `main`
4. Configure the following settings:

   **Protect matching branches:**
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings (enforce for administrators)
   - ✅ Do not allow force pushes
   - ✅ Do not allow deletions

   **Status checks that are required:**
   - `Lint`
   - `Format Check`
   - `Test (go)`
   - `Test (builder)`
   - `Test (edge-worker)`
   - `Pre-commit Checks`

5. Click **Create** or **Save changes**

## How It Works

### CI Workflow

The CI workflow (`.github/workflows/ci.yml`) runs automatically on:
- Pull requests targeting `main`
- Pushes to `main` branch

The workflow includes:
- **Linting**: Checks code style and potential issues
- **Format Checking**: Ensures code is properly formatted
- **Testing**: Runs all test suites
- **Pre-commit Checks**: Validates files, sizes, and secrets

### Branch Protection Enforcement

Once branch protection is enabled:
1. When a PR is created, all CI checks run automatically
2. The PR cannot be merged until all checks pass (green checkmarks)
3. At least one approval is required
4. The branch must be up to date with `main`
5. All conversations must be resolved

### Bypassing Protection (Not Recommended)

Even with branch protection enabled, administrators can bypass these rules in emergencies. However, the default configuration enforces rules for administrators too. To allow bypasses (not recommended), uncheck "Do not allow bypassing the above settings" in the GitHub UI.

## Troubleshooting

### Checks Not Appearing

If status checks don't appear in the branch protection settings:
1. Make sure the CI workflow has run at least once
2. Push a commit or create a PR to trigger the workflow
3. Wait for the workflow to complete
4. The checks should then appear in the branch protection settings

**Important**: After the first CI run, verify the exact check names in GitHub:
1. Go to any PR or commit that ran the CI workflow
2. Check the status check names (they appear as job names)
3. Update the branch protection script or GitHub UI settings to match the exact names
4. Status check names are case-sensitive and must match exactly

### Check Names Don't Match

The check names in branch protection must exactly match the job names in `.github/workflows/ci.yml`. If you rename jobs, update the branch protection settings accordingly.

### Script Fails with 403 Error

This means your GitHub account doesn't have sufficient permissions:
- Make sure you're authenticated with `gh auth login`
- Ensure your account has admin permissions on the repository
- For organization repositories, you may need organization admin permissions

### Script Fails with 404 Error

This could mean:
- The repository doesn't exist or you don't have access
- The branch name is incorrect (check with `gh repo view --json defaultBranchRef`)
- You're not in a git repository or the repository isn't connected to GitHub

### gh CLI Not Found

If you see "GitHub CLI (gh) is not installed":
- Install it: `brew install gh` (macOS) or see https://cli.github.com/
- Then authenticate: `gh auth login`

### gh CLI Not Authenticated

If you see "GitHub CLI is not authenticated":
- Run `gh auth login` to authenticate
- Or set `GITHUB_TOKEN` environment variable as a fallback

## Updating Protection Rules

To update branch protection rules:
1. Use the script again with updated configuration
2. Or manually update via GitHub UI: Settings → Branches → Edit rule

## Related Documentation

- [CI/CD Workflows](../infrastructure/deployment/overview.md)
- [Pre-commit Hooks](./pre-commit-hooks.md)
- [Testing Strategy](./testing-strategy.md)

