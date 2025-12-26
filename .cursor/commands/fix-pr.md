# Fix PR

When the user invokes `/fix-pr`, fetch the GitHub PR, read all PR comments, check CI checks for failures, fix all issues found, and commit the fixes. If no fixes are required, inform the user.

## Context Understanding

1. **Get PR number**: The user may provide a PR number, or you should detect it from:
   - Current branch name (if it matches a PR)
   - User input after the command: `/fix-pr 123`
   - Git remote tracking information

2. **Repository information**:
   - Repository: Detect from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
   - **Use GitHub MCP server for all GitHub operations** (not `gh` CLI)
   - Owner and Repo: Extract from the detected repository string (format: `owner/repo`)

3. **Current branch**: Ensure you're on the PR branch before making fixes

## GitHub MCP Functions to Use

Most GitHub operations should use these MCP functions:

- **Get PR details**: `mcp_github_pull_request_read` with method `get`
- **Get PR comments**: `mcp_github_pull_request_read` with method `get_comments`
- **Get review comments**: `mcp_github_pull_request_read` with method `get_review_comments`
- **Get reviews**: `mcp_github_pull_request_read` with method `get_reviews`
- **Get PR files**: `mcp_github_pull_request_read` with method `get_files`
- **Get CI status**: `mcp_github_pull_request_read` with method `get_status`
- **Get commit details**: `mcp_github_get_commit`
- **Add PR comment**: `mcp_github_add_issue_comment` (use PR number as issue number)
- **Add review comment**: `mcp_github_add_comment_to_pending_review`
- **Create/update review**: `mcp_github_pull_request_review_write`

**Note**: For replying to review comment threads and resolving them, use `gh api` directly since this functionality is not available in MCP:
- **Reply to review comment**: `gh api repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies -X POST`
- **Resolve comment thread**: `gh api repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id} -X PATCH -f resolved=true`

## Fix Process

### Step 1: Fetch PR Information

1. **Get PR number**:
   - If user provided PR number: use it directly
   - Otherwise: try to detect from current branch using git
   - If still not found: ask user for PR number

2. **Get PR details** using GitHub MCP:
   - Use `mcp_github_pull_request_read` with method `get`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract: number, title, body, author, state, baseRefName, headRefName, headRefOid
   - Get files using method `get_files`
   - Get commits from the PR data

3. **Checkout PR branch** (if not already on it):
   - Extract `headRefName` from PR data (this is the branch name)
   - Extract `baseRefName` from PR data (this is the base branch)
   - Use git commands:
     ```bash
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

Use GitHub MCP server to fetch all comments:

1. **Get all PR comments** (general comments):
   - Use `mcp_github_pull_request_read` with method `get_comments`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract: body, author, createdAt for each comment

2. **Get all review comments** (inline comments and review threads):
   - Use `mcp_github_pull_request_read` with method `get_review_comments`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract: body, path, line, author, thread information

3. **Get all reviews**:
   - Use `mcp_github_pull_request_read` with method `get_reviews`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract: body, state, author, comments for each review

### Step 3: Check CI Status

Use GitHub MCP server to check CI status:

1. **Get CI check status**:
   - Use `mcp_github_pull_request_read` with method `get_status`
   - Repository: Detect from git remote (see Step 1.2)
   - This returns the status of the head commit in the PR
   - Extract: check run names, conclusions, status, details URLs

2. **Get detailed check runs** (if needed):
   - Get the head commit SHA from PR data (`headRefOid`)
   - Use `mcp_github_get_commit` with `include_diff: false`
   - Repository: Detect from git remote (see Step 1.2)
   - The commit data includes check run information

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
   # Format conflicted files list with bullet points
   CONFLICT_LIST=$(echo "$CONFLICTED_FILES" | head -5 | sed 's/^/  - /')

   git commit -m "chore: resolve merge conflicts with $BASE_BRANCH

   Resolved conflicts in:
   $CONFLICT_LIST

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

After all fixes are complete and tests pass, respond to review comments explaining how issues were fixed. **Reply directly to review comment threads and resolve them** to show that feedback has been addressed.

#### 7.1: Get Review Comment Threads

1. **Get all review comments with thread information**:
   - Use `mcp_github_pull_request_read` with method `get_review_comments`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract for each comment:
     - `id` - Comment ID (needed for replies)
     - `body` - Comment text
     - `path` - File path
     - `line` - Line number
     - `thread_id` or `in_reply_to_id` - Thread information
     - `is_resolved` - Whether thread is already resolved
     - `author` - Who made the comment

2. **Group comments by thread**:
   - Comments with the same `thread_id` or `in_reply_to_id` belong to the same thread
   - The root comment of a thread has no `in_reply_to_id` (or `in_reply_to_id` is null)
   - Track which comments have been fixed and need replies
   - **Important**: When replying, reply to the **root comment** of the thread (the original review comment), not to replies within the thread

#### 7.2: Reply to Review Comment Threads

For each review comment that has been fixed, reply to the comment thread using the GitHub API:

1. **For inline review comments** (comments on specific lines in code):
   ```bash
   # Get repository info
   REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
   OWNER=$(echo $REPO | cut -d'/' -f1)
   REPO_NAME=$(echo $REPO | cut -d'/' -f2)

   # Reply to a review comment thread
   # ROOT_COMMENT_ID is the ID of the root comment in the thread (the original review comment)
   # Find the root comment by looking for comments with no in_reply_to_id
   # or by following the thread_id to find the first comment
   gh api repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments/$ROOT_COMMENT_ID/replies \
     -X POST \
     -f body="✅ Fixed! I've [description of fix]. The changes address your feedback by [explanation].

   The fix:
   - [Specific change made]
   - [How it addresses the concern]
   - [Any additional context]"
   ```

2. **Resolve the comment thread** (after replying):
   ```bash
   # Resolve the thread by updating the root comment
   # ROOT_COMMENT_ID is the ID of the root comment in the thread
   gh api repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments/$ROOT_COMMENT_ID \
     -X PATCH \
     -f body="[Original comment text]" \
     -f resolved=true
   ```

   **Note**: If the GitHub API doesn't support `resolved` in the PATCH body, you may need to use a different approach. Check the actual API response structure from `get_review_comments` to see how resolution is handled.

3. **Alternative: Use GitHub web interface markers**:
   - If direct API resolution isn't available, include "✅ Resolved" or "Fixed" in your reply
   - The reviewer can manually resolve the thread, or it may auto-resolve

#### 7.3: Reply to General PR Comments

For general PR comments (not inline code comments):

1. **Use MCP to add a reply**:
   - Use `mcp_github_add_issue_comment` (PRs are issues in GitHub)
   - Repository: Detect from git remote (see Step 1.2)
   - Issue number: PR number
   - Body: "✅ Fixed! [Description of how the comment was addressed]"

2. **Or reference the original comment**:
   - If the comment has an ID, you can reference it: "✅ Fixed! @[original-comment-author] [Description]"

#### 7.4: Create Summary Comment

If multiple review comments were addressed, create a summary comment:

1. **Use MCP to add summary**:
   - Use `mcp_github_add_issue_comment`
   - Repository: Detect from git remote (see Step 1.2)
   - Issue number: PR number
   - Body:
     ```
     ## ✅ Review Comments Addressed

     I've addressed all review comments and replied to each thread:

     - **[@reviewer] Comment on `file/path.tsx:123`**: ✅ Fixed - [How it was fixed]
     - **[@reviewer] Comment on `file/path.go:45`**: ✅ Fixed - [How it was fixed]
     - **[@reviewer] General comment**: ✅ Fixed - [How it was fixed]

     All comment threads have been replied to and resolved. All CI checks are now passing and the test suite runs successfully.
     ```

#### 7.5: Example Workflow for Replying to Review Comments

```bash
# 1. Get repository info
REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
OWNER=$(echo $REPO | cut -d'/' -f1)
REPO_NAME=$(echo $REPO | cut -d'/' -f2)

# 2. Get all review comments to identify threads
# Use mcp_github_pull_request_read with method get_review_comments
# For each comment, check:
#   - in_reply_to_id: null or missing = root comment
#   - thread_id: same ID = same thread
#   - is_resolved: false = needs resolution

# 3. For each review comment that was fixed:
#    - ROOT_COMMENT_ID: The ID of the root comment in the thread
#      (find by checking in_reply_to_id is null for that thread)
#    - REPLY_BODY: Your reply explaining the fix

# 4. Reply to the root comment of the thread
gh api repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments/$ROOT_COMMENT_ID/replies \
  -X POST \
  -f body="$REPLY_BODY"

# 5. (Optional) Resolve the thread if the API supports it
# Try to mark the thread as resolved
gh api repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments/$ROOT_COMMENT_ID \
  -X PATCH \
  -f resolved=true
# Note: If this fails, the reply itself indicates the fix is complete
```

#### 7.6: Track Comment Replies

Maintain a list of comments that have been:
- ✅ Fixed in code
- ✅ Replied to in the thread
- ✅ Thread resolved (if applicable)

This helps ensure all feedback is properly addressed and acknowledged.

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
   - If user provided PR number: use it directly
   - Otherwise: try to detect from current git branch
   - If still not found: ask user for PR number
   - Repository: Detect from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`

2. **Check for merge conflicts**:
   - Fetch base branch
   - Attempt merge
   - Identify conflicts if any

3. **Fetch all information using GitHub MCP**:
   - PR details: `mcp_github_pull_request_read` with method `get`
   - PR comments: `mcp_github_pull_request_read` with method `get_comments`
   - Review comments: `mcp_github_pull_request_read` with method `get_review_comments`
   - Reviews: `mcp_github_pull_request_read` with method `get_reviews`
   - CI check status: `mcp_github_pull_request_read` with method `get_status`
   - PR files: `mcp_github_pull_request_read` with method `get_files`

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
   - Get all review comment threads using `mcp_github_pull_request_read` with method `get_review_comments`
   - For each fixed comment, reply to the thread using `gh api`:
     - POST to `/repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies`
     - Explain how the fix addresses the feedback
   - Resolve comment threads (if API supports it) or mark as resolved in reply
   - For general comments: Use `mcp_github_add_issue_comment` (PR number as issue number)
   - Create summary comment if multiple comments were addressed

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
- **Reply to the comment thread** using GitHub API:
  ```bash
  gh api repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies \
    -X POST \
    -f body="✅ Fixed! [Explanation of fix]"
  ```
- **Resolve the thread** (if API supports it):
  ```bash
  gh api repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments/$ROOT_COMMENT_ID \
    -X PATCH \
    -f resolved=true
  ```
- Track which comments have been fixed, replied to, and resolved

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
- Address review comments by replying to comment threads and resolving them
- Use descriptive commit messages
- Reference PR number in commit message
- If no issues found, clearly state "No fixes required"
- Be thorough but efficient - fix all issues in one go
- After pushing, CI will automatically re-run
- Monitor CI status after pushing fixes
- **Reply to review comment threads** to show that feedback was addressed:
  - Use `gh api` to POST replies to review comment threads
  - Resolve threads after replying (if API supports it)
  - Track which comments have been fixed, replied to, and resolved
- **Use GitHub MCP server for most GitHub operations** (PR reading, adding comments)
- **Use `gh api` for replying to and resolving review comment threads** (not available in MCP)
- Repository: Always detect dynamically from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
- Most GitHub API calls should use MCP functions, but review comment thread replies use `gh api`

