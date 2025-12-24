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
   BASE_BRANCH=$(gh pr view <PR_NUMBER> --json baseRefName --jq '.baseRefName')
   git checkout $BRANCH_NAME
   git pull origin $BRANCH_NAME
   ```

4. **Check for merge conflicts**:
   ```bash
   # Fetch latest from base branch
   git fetch origin $BASE_BRANCH

   # Check if there are conflicts
   git merge-base --is-ancestor origin/$BASE_BRANCH HEAD || {
     echo "Branch is not up to date with base. Attempting merge..."
     git merge origin/$BASE_BRANCH || {
       echo "Merge conflicts detected. Resolving conflicts..."
       # Conflicts will be resolved in Step 4.5
     }
   }
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

### Step 4.5: Resolve Merge Conflicts

If merge conflicts are detected, resolve them systematically:

1. **Identify conflicted files**:
   ```bash
   CONFLICTED_FILES=$(git diff --name-only --diff-filter=U)
   echo "Conflicted files: $CONFLICTED_FILES"
   ```

2. **For each conflicted file**:
   ```bash
   for file in $CONFLICTED_FILES; do
     echo "Resolving conflicts in: $file"

     # Read the file to see conflict markers
     # Look for patterns:
     # <<<<<<< HEAD (our changes - PR branch)
     # =======
     # >>>>>>> origin/main (their changes - base branch)

     # Analyze the conflict:
     # - What changed in our branch?
     # - What changed in base branch?
     # - Are changes compatible?
     # - Which version is correct?
   done
   ```

3. **Resolution strategies**:
   - **Keep our changes**: If PR changes are the new feature and base changes are unrelated
   - **Keep their changes**: If base changes are critical fixes/updates
   - **Merge both**: If changes are in different parts of the file
   - **Intelligent merge**: If changes overlap, combine them correctly
   - **Rewrite**: If neither version is correct, write the correct version

4. **Resolve each conflict**:
   - Open the file
   - Find conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
   - Understand both versions
   - Choose or create the correct resolution
   - Remove all conflict markers
   - Ensure syntax is correct
   - Ensure logic is correct

5. **Example conflict resolution**:
   ```go
   // Before (conflicted):
   <<<<<<< HEAD
   func NewHandler() *Handler {
       return &Handler{logger: logger.New()}
   }
   =======
   func NewHandler(config *Config) *Handler {
       return &Handler{config: config}
   }
   >>>>>>> origin/main

   // After (resolved - keeping both changes):
   func NewHandler(config *Config) *Handler {
       return &Handler{
           logger: logger.New(),
           config: config,
       }
   }
   ```

6. **Mark conflicts as resolved**:
   ```bash
   for file in $CONFLICTED_FILES; do
     # After manually resolving conflicts in the file
     git add "$file"
   done
   ```

7. **Complete the merge**:
   ```bash
   git commit -m "chore: resolve merge conflicts with $BASE_BRANCH

   Resolved conflicts in:
   - $(echo $CONFLICTED_FILES | tr '\n' '\n' - | head -5)

   Merged latest changes from $BASE_BRANCH while preserving PR changes."
   ```

8. **Verify merge**:
   ```bash
   # Check merge was successful
   git status

   # Verify no remaining conflicts
   if [ -n "$(git diff --check)" ]; then
     echo "Warning: Conflict markers may still be present"
     git diff --check
   fi

   # Verify commit history
   git log --oneline --graph -10
   ```

9. **Test after merge**:
   - Run linting to ensure no syntax errors
   - Run tests to ensure functionality is correct
   - Fix any issues introduced by merge

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

For each actionable review comment, track what needs to be fixed:

1. **Parse the comment**:
   - Extract file path and line number (if inline comment)
   - Understand the requested change
   - Identify the issue type (bug, style, architecture, etc.)
   - Store comment ID and details for later response

2. **Apply the fix**:
   - Read the relevant file
   - Make the necessary changes
   - Ensure the fix addresses the comment
   - Document how the fix addresses the comment (for response)

3. **Verify the fix**:
   - Run relevant tests
   - Check linting
   - Ensure formatting is correct

4. **Track fixes for comments**:
   - Maintain a list of comments addressed
   - Record the fix applied for each comment
   - Prepare response messages explaining the fixes

### Step 6: Run Thorough Test Suite

**CRITICAL**: Before committing, run a comprehensive test suite to ensure all fixes work correctly:

1. **Format and lint checks**:
   ```bash
   # Go formatting
   cd apps/api-go
   go fmt ./...
   go vet ./...

   # TypeScript/JavaScript linting
   cd apps/builder
   npm run lint

   cd apps/edge-worker
   npm run lint

   # Format check
   cd ../..
   npm run format:check
   ```

2. **Pre-commit checks**:
   ```bash
   ./scripts/pre-commit-checks.sh
   ```

3. **Run ALL test suites** (not just the ones that failed):
   ```bash
   # Go tests
   cd apps/api-go
   make test

   # Builder tests
   cd ../builder
   npm test -- --run

   # Edge Worker type check
   cd ../edge-worker
   npm run typecheck
   ```

4. **Verify no regressions**:
   - All tests should pass
   - No new linting errors
   - No formatting issues
   - All pre-commit checks pass

5. **If any test fails**:
   - Fix the issue immediately
   - Re-run the failing test suite
   - Continue until all tests pass
   - Do NOT commit until all tests pass

### Step 7: Address Review Comments

After all fixes are complete and tests pass, respond to review comments explaining how issues were fixed:

1. **For each review comment that was addressed**:
   ```bash
   # Get comment details
   COMMENT_ID=<comment_id>
   COMMENT_BODY="Fixed! I've [description of fix]. The changes address your feedback by [explanation]."

   # For inline comments, reply to the comment thread
   gh api repos/NoSkillGuy/sacred-vows/pulls/<PR_NUMBER>/comments/$COMMENT_ID/replies \
     -X POST \
     -f body="$COMMENT_BODY"
   ```

2. **For general review comments**:
   ```bash
   # Reply to the review comment
   gh pr comment <PR_NUMBER> --body "✅ Fixed! $COMMENT_BODY"
   ```

3. **For review threads**:
   ```bash
   # Get review ID and reply
   REVIEW_ID=$(gh api repos/NoSkillGuy/sacred-vows/pulls/<PR_NUMBER>/reviews --jq '.[] | select(.state == "CHANGES_REQUESTED" or .state == "COMMENTED") | .id' | head -1)

   # Reply to the review
   gh api repos/NoSkillGuy/sacred-vows/pulls/<PR_NUMBER>/reviews/$REVIEW_ID/events \
     -X POST \
     -f body="✅ All requested changes have been addressed:

   $COMMENT_BODY_LIST"
   ```

4. **Create summary comment** (if multiple comments addressed):
   ```bash
   gh pr comment <PR_NUMBER> --body "## ✅ Review Comments Addressed

   I've addressed all review comments:

   - **Comment 1**: [How it was fixed]
   - **Comment 2**: [How it was fixed]
   - **Comment 3**: [How it was fixed]

   All CI checks are now passing and the test suite runs successfully."
   ```

### Step 8: Commit Fixes

**ONLY commit after all tests pass and review comments are addressed.**

1. **Stage all fixes**:
   ```bash
   git add -A
   ```

2. **Check what will be committed**:
   ```bash
   git status
   git diff --cached
   ```

3. **Create comprehensive commit message**:
   - Use Conventional Commits format
   - Reference the PR number
   - List all fixes made
   - Include conflict resolution if applicable
   - Example:
     ```bash
     git commit -m "fix(ci): address PR feedback, CI failures, and merge conflicts

     - Resolve merge conflicts with main branch
     - Fix Go formatting issues (go fmt)
     - Fix TypeScript linting errors (ESLint)
     - Fix failing unit tests (Go, Builder, Edge Worker)
     - Address all review comments
     - Run full test suite - all tests passing

     Fixes PR #<PR_NUMBER>"
     ```

4. **Push changes**:
   ```bash
   git push origin <BRANCH_NAME>
   ```

### Step 9: Report Results

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

2. **Check for merge conflicts**:
   - Fetch base branch
   - Attempt merge
   - Identify conflicts if any

3. **Fetch all information**:
   - PR details
   - PR comments
   - Review comments
   - CI check status

4. **Resolve merge conflicts** (if any):
   - Identify conflicted files
   - Resolve each conflict intelligently
   - Complete the merge

5. **Analyze and categorize issues**:
   - CI failures (format, lint, test, pre-commit)
   - Review comments (actionable feedback)

6. **Fix issues systematically**:
   - Start with easiest (formatting)
   - Move to linting
   - Fix test failures
   - Address review comments
   - Track fixes for comment responses

7. **Run thorough test suite**:
   - Format and lint checks
   - Pre-commit checks
   - ALL test suites (Go, Builder, Edge Worker)
   - Verify no regressions
   - Do NOT commit until all tests pass

8. **Address review comments**:
   - Reply to each addressed comment
   - Explain how the fix addresses the feedback
   - Create summary if multiple comments

9. **Commit and push**:
   - Stage changes
   - Create descriptive commit
   - Push to PR branch

10. **Report to user**:
    - Summary of fixes
    - Conflicts resolved (if any)
    - Tests run and passing
    - Review comments addressed
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
- Reply to comment explaining how it was fixed

### Merge Conflicts
- Identify conflicted files with `git status`
- Read both versions (ours and theirs)
- Understand the context of both changes
- Choose the correct resolution:
  - Keep PR branch changes if they're the new feature
  - Keep base branch changes if they're critical updates
  - Merge both if they're compatible
  - Rewrite if neither is correct
- Remove all conflict markers
- Verify resolved code is correct
- Test after resolving conflicts

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
- Resolve merge conflicts FIRST before other fixes
- Fix issues in order: conflicts → format → lint → test → comments
- **CRITICAL**: Run full test suite before committing - ALL tests must pass
- Do NOT commit if any test fails - fix it first
- Address review comments by explaining how fixes address the feedback
- Use descriptive commit messages
- Reference PR number in commit message
- If no issues found, clearly state "No fixes required"
- Be thorough but efficient - fix all issues in one go
- After pushing, CI will automatically re-run
- Monitor CI status after pushing fixes
- Reply to review comments to show that feedback was addressed

