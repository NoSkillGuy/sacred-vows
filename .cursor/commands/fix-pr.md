# Fix PR

When the user invokes `/fix-pr`, fetch the GitHub PR, read all PR comments, check CI checks for failures, fix all issues found, and commit the fixes. If no fixes are required, inform the user.

## Context Understanding

1. **Get PR number**: The user may provide a PR number, or you should detect it from:
   - Current branch name (if it matches a PR)
   - User input after the command: `/fix-pr 123`
   - Git remote tracking information

2. **Repository information**:
   - Repository: `NoSkillGuy/sacred-vows` (from git remote)
   - Use `gh` CLI for all GitHub operations

3. **Current branch**: Ensure you're on the PR branch before making fixes

## Fix Process

### Step 1: Fetch PR Information

1. **Get PR number**:
   ```bash
   # If user provided PR number, use it
   # Otherwise, try to detect from current branch
   PR_NUMBER=$(gh pr view --json number --jq '.number' 2>/dev/null || echo "")

   # If still not found, ask user or use provided number
   ```

2. **Get PR details**:
   ```bash
   gh pr view <PR_NUMBER> --json number,title,body,author,state,baseRefName,headRefName,files,commits,headRefOid
   ```

3. **Checkout PR branch** (if not already on it):
   ```bash
   BRANCH_NAME=$(gh pr view <PR_NUMBER> --json headRefName --jq '.headRefName')
   git checkout $BRANCH_NAME
   git pull origin $BRANCH_NAME
   ```

### Step 2: Fetch PR Comments

1. **Get all PR comments** (general comments):
   ```bash
   gh pr view <PR_NUMBER> --comments --json comments --jq '.comments[] | {body: .body, author: .author.login, createdAt: .createdAt}'
   ```

2. **Get all review comments** (inline comments):
   ```bash
   gh api repos/NoSkillGuy/sacred-vows/pulls/<PR_NUMBER>/comments --jq '.[] | {body: .body, path: .path, line: .line, author: .user.login}'
   ```

3. **Get all review threads**:
   ```bash
   gh api repos/NoSkillGuy/sacred-vows/pulls/<PR_NUMBER>/reviews --jq '.[] | {body: .body, state: .state, author: .user.login, comments: .comments}'
   ```

### Step 3: Check CI Status

1. **Get CI check status**:
   ```bash
   gh pr checks <PR_NUMBER> --json name,conclusion,status,detailsUrl
   ```

2. **Get detailed check runs**:
   ```bash
   gh api repos/NoSkillGuy/sacred-vows/commits/$(gh pr view <PR_NUMBER> --json headRefOid --jq '.headRefOid')/check-runs \
     --jq '.check_runs[] | {name: .name, conclusion: .conclusion, status: .status, output: .output.title, details_url: .html_url}'
   ```

3. **Identify failing checks**:
   - `Lint` - Go and TypeScript linting failures
   - `Format Check` - Go fmt or Prettier formatting issues
   - `Test (go)` - Go unit test failures
   - `Test (builder)` - Builder test failures
   - `Test (edge-worker)` - Edge worker type checking failures
   - `Pre-commit Checks` - Pre-commit validation failures

### Step 4: Analyze Issues

For each failing check or comment, identify:

1. **Lint failures**:
   - Go linting errors (`go vet`, `golangci-lint`)
   - TypeScript/JavaScript linting errors (ESLint)
   - Check error messages and file locations

2. **Format failures**:
   - Go formatting (`gofmt`)
   - Prettier formatting
   - Check which files need formatting

3. **Test failures**:
   - Go test failures (read test output)
   - Builder test failures (read test output)
   - Edge worker type errors (read TypeScript errors)
   - Identify failing tests and error messages

4. **Pre-commit check failures**:
   - File size issues
   - Secret detection
   - Trailing whitespace
   - Missing EOF newlines

5. **Review comments**:
   - Parse comments for actionable feedback
   - Identify code issues mentioned
   - Extract file paths and line numbers
   - Understand requested changes

### Step 5: Fix Issues

Fix issues in this order (most critical first):

#### 1. Format Issues (Easiest, Fix First)

**Go formatting**:
```bash
cd apps/api-go
go fmt ./...
```

**Prettier formatting**:
```bash
npm run format
# Or for specific apps:
npm run format:builder
npm run format:edge-worker
```

#### 2. Lint Issues

**Go linting**:
```bash
cd apps/api-go
go vet ./...
# Fix any issues reported
```

**TypeScript/JavaScript linting**:
```bash
# Builder
cd apps/builder
npm run lint -- --fix

# Edge Worker
cd apps/edge-worker
npm run lint -- --fix
```

#### 3. Pre-commit Check Issues

**Trailing whitespace**:
```bash
# Fix trailing whitespace
find . -type f \( -name "*.go" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.yml" -o -name "*.yaml" \) \
  -exec sed -i '' 's/[[:space:]]*$//' {} \;
```

**Missing EOF newlines**:
```bash
# Ensure files end with newline
find . -type f \( -name "*.go" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" \) \
  -exec sh -c 'if [ -s "$1" ] && [ "$(tail -c 1 "$1")" != "" ]; then echo >> "$1"; fi' _ {} \;
```

#### 4. Test Failures

**Go test failures**:
- Read test output to identify failing tests
- Fix the code causing test failures
- Ensure tests pass: `cd apps/api-go && make test`

**Builder test failures**:
- Read test output to identify failing tests
- Fix the code causing test failures
- Ensure tests pass: `cd apps/builder && npm test -- --run`

**Edge worker type errors**:
- Read TypeScript errors
- Fix type issues
- Ensure type check passes: `cd apps/edge-worker && npm run typecheck`

#### 5. Review Comment Issues

For each actionable review comment:

1. **Parse the comment**:
   - Extract file path and line number (if inline comment)
   - Understand the requested change
   - Identify the issue type (bug, style, architecture, etc.)

2. **Apply the fix**:
   - Read the relevant file
   - Make the necessary changes
   - Ensure the fix addresses the comment

3. **Verify the fix**:
   - Run relevant tests
   - Check linting
   - Ensure formatting is correct

### Step 6: Verify Fixes

After making fixes, verify they work:

1. **Run linting locally**:
   ```bash
   # Go
   cd apps/api-go
   go fmt ./...
   go vet ./...

   # Builder
   cd apps/builder
   npm run lint

   # Edge Worker
   cd apps/edge-worker
   npm run lint
   ```

2. **Run formatting check**:
   ```bash
   npm run format:check
   ```

3. **Run tests locally** (if test failures were fixed):
   ```bash
   # Go
   cd apps/api-go
   make test

   # Builder
   cd apps/builder
   npm test -- --run

   # Edge Worker
   cd apps/edge-worker
   npm run typecheck
   ```

4. **Run pre-commit checks**:
   ```bash
   ./scripts/pre-commit-checks.sh
   ```

### Step 7: Commit Fixes

1. **Stage all fixes**:
   ```bash
   git add -A
   ```

2. **Check what will be committed**:
   ```bash
   git status
   git diff --cached
   ```

3. **Create commit message**:
   - Use Conventional Commits format
   - Reference the PR number
   - List the fixes made
   - Example:
     ```bash
     git commit -m "fix(ci): address PR feedback and CI failures

     - Fix Go formatting issues
     - Fix TypeScript linting errors
     - Fix failing unit tests
     - Address review comments

     Fixes PR #<PR_NUMBER>"
     ```

4. **Push changes**:
   ```bash
   git push origin <BRANCH_NAME>
   ```

### Step 8: Report Results

1. **If fixes were made**:
   - Summarize what was fixed
   - List the issues addressed
   - Confirm commits were pushed
   - Note that CI will re-run

2. **If no fixes were required**:
   - Inform user: "No fixes required. All CI checks are passing and there are no actionable review comments to address."

## Implementation Steps

1. **Parse PR number**:
   ```bash
   if [ -n "$1" ]; then
     PR_NUMBER=$1
   else
     PR_NUMBER=$(gh pr view --json number --jq '.number' 2>/dev/null)
     if [ -z "$PR_NUMBER" ]; then
       echo "Error: Could not detect PR number. Please provide: /fix-pr <PR_NUMBER>"
       exit 1
     fi
   fi
   ```

2. **Fetch all information**:
   - PR details
   - PR comments
   - Review comments
   - CI check status

3. **Analyze and categorize issues**:
   - CI failures (format, lint, test, pre-commit)
   - Review comments (actionable feedback)

4. **Fix issues systematically**:
   - Start with easiest (formatting)
   - Move to linting
   - Fix test failures
   - Address review comments

5. **Verify fixes**:
   - Run checks locally
   - Ensure all fixes are correct

6. **Commit and push**:
   - Stage changes
   - Create descriptive commit
   - Push to PR branch

7. **Report to user**:
   - Summary of fixes
   - Or "no fixes required" message

## Common Fix Patterns

### Go Formatting
```bash
cd apps/api-go
go fmt ./...
```

### TypeScript Formatting
```bash
npm run format
```

### Go Linting
- Fix `go vet` errors
- Fix unused imports
- Fix variable shadowing
- Fix error handling

### TypeScript Linting
- Fix ESLint errors (usually auto-fixable with `--fix`)
- Fix TypeScript type errors
- Fix unused variables
- Fix missing return types

### Test Failures
- Read test output carefully
- Identify the failing test
- Understand why it's failing
- Fix the code or test as appropriate
- Re-run tests to verify

### Review Comments
- Read comment carefully
- Understand the requested change
- Apply the fix
- Verify it addresses the comment

## Error Handling

1. **If PR number cannot be determined**:
   - Ask user to provide PR number
   - Exit with clear error message

2. **If not on PR branch**:
   - Checkout the PR branch
   - Pull latest changes

3. **If fixes fail**:
   - Report which fixes failed
   - Provide error messages
   - Suggest manual intervention

4. **If commit fails**:
   - Check git status
   - Ensure changes are staged
   - Retry commit

5. **If push fails**:
   - Check branch protection
   - Ensure you have permissions
   - Retry push

## Notes

- Always work on the PR branch, not main
- Fix issues in order: format → lint → test → comments
- Verify fixes locally before committing
- Use descriptive commit messages
- Reference PR number in commit message
- If no issues found, clearly state "No fixes required"
- Be thorough but efficient - fix all issues in one go
- After pushing, CI will automatically re-run
- Monitor CI status after pushing fixes

