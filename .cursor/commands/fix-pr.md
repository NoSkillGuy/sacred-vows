# Fix PR

When the user invokes `/fix-pr`, fetch the GitHub PR, read all PR comments, check CI checks for failures, fix all issues found, and commit the fixes. If no fixes are required, inform the user.

## Critical Validation Rules

**BEFORE making any changes, you MUST:**

1. **Get and validate branch name FIRST**:
   - Always get current branch: `git branch --show-current`
   - **NEVER make changes if branch name cannot be determined** - prompt user to select branch
   - **NEVER make changes on `main`, `master`, or any default/protected branch** - stop and inform user

2. **Verify PR exists for branch**:
   - Use `mcp_github_list_pull_requests` with `head` filter to find PR for the branch
   - **If no PR found**: Do NOT make any changes - prompt user: "No pull request found for branch '<branch-name>'. Please create a PR first or specify a different branch."

3. **Use GitHub MCP server ONLY**:
   - **NEVER use `gh` CLI or `gh api` commands**
   - All GitHub operations must use MCP functions
   - Repository detection: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`

## Context Understanding

1. **Get branch name FIRST** (CRITICAL):
   - **Always detect the current branch name first** using: `git branch --show-current` or `git rev-parse --abbrev-ref HEAD`
   - **NEVER make changes if you don't know the branch name**
   - **NEVER make changes on the main branch** (or master, or any protected default branch)
   - If branch name cannot be determined, **prompt the user to select the branch first**
   - If the current branch is `main`, `master`, or the default branch, **stop and inform the user that changes cannot be made on the default branch**

2. **Get PR number**: The user may provide a PR number, or you should detect it from:
   - **Branch name** (primary method): Use `mcp_github_list_pull_requests` filtered by `head` parameter to find PRs for the current branch
   - User input after the command: `/fix-pr 123`
   - **If no PR exists for the branch**: **Do not make any changes** and prompt the user: "No pull request found for branch '<branch-name>'. Please create a PR first or specify a different branch."

3. **Repository information**:
   - Repository: Detect from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
   - **Use GitHub MCP server for ALL GitHub operations** (never use `gh` CLI)
   - Owner and Repo: Extract from the detected repository string (format: `owner/repo`)

4. **Current branch validation**:
   - Ensure you're on the PR branch before making fixes
   - Verify branch is not a protected/default branch
   - Verify a PR exists for the branch before proceeding

## GitHub MCP Functions to Use

Most GitHub operations should use these MCP functions:

- **List PRs**: `mcp_github_list_pull_requests` (to find PR by branch name)
- **Get PR details**: `mcp_github_pull_request_read` with method `get`
- **Get PR diff**: `mcp_github_pull_request_read` with method `get_diff`
- **Get PR comments**: `mcp_github_pull_request_read` with method `get_comments`
- **Get review comments**: `mcp_github_pull_request_read` with method `get_review_comments`
- **Get reviews**: `mcp_github_pull_request_read` with method `get_reviews`
- **Get PR files**: `mcp_github_pull_request_read` with method `get_files`
- **Get CI status**: `mcp_github_pull_request_read` with method `get_status`
- **Get commit details**: `mcp_github_get_commit`
- **Add PR comment**: `mcp_github_add_issue_comment` (use PR number as issue number)
- **Add review comment**: `mcp_github_add_comment_to_pending_review`
- **Create/update review**: `mcp_github_pull_request_review_write`

**Note**: For replying to review comment threads, use GitHub MCP server functions:
- **Add review comment to pending review**: `mcp_github_add_comment_to_pending_review` - Add a comment to your pending review
- **Create or submit review**: `mcp_github_pull_request_review_write` with method `create` or `submit_pending` - Create a review with comments or submit a pending review
- **Add general PR comment**: `mcp_github_add_issue_comment` - Add a comment to the PR (PRs are issues in GitHub)

**Note**: Verify the current capabilities of the GitHub MCP server by checking the latest documentation, as functionality may have been updated.

## Fix Process

### Step 1: Fetch PR Information

1. **Get and validate branch name** (CRITICAL - DO THIS FIRST):
   ```bash
   CURRENT_BRANCH=$(git branch --show-current)
   # Or: CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
   ```
   - **If branch name cannot be determined**: Prompt user: "Unable to determine current branch. Please select a branch first."
   - **If branch is `main`, `master`, or default branch**: Stop and inform user: "Cannot make changes on the default branch. Please checkout a feature branch first."
   - **Store branch name for later use**

2. **Get PR number**:
   - If user provided PR number: use it directly, but still validate the branch
   - Otherwise: **Use branch name to find PR**:
     - Get repository info: `REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')`
     - Extract owner and repo name
     - Use `mcp_github_list_pull_requests` with `head` parameter set to `owner:branch-name` or just `branch-name` to find PRs for this branch
     - If no PR found: **Stop and inform user**: "No pull request found for branch '<branch-name>'. Please create a PR first or specify a different branch."
     - If multiple PRs found: Use the most recent open PR, or ask user to specify
   - If still not found: ask user for PR number

3. **Get PR details** using GitHub MCP:
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

For each review comment that has been fixed, reply to the comment thread using GitHub MCP server:

1. **For inline review comments** (comments on specific lines in code):
   - Use `mcp_github_add_comment_to_pending_review` to add a reply comment to your pending review
   - Parameters:
     - `owner`: Repository owner
     - `repo`: Repository name
     - `pullNumber`: PR number
     - `path`: File path from the original comment
     - `body`: Reply text explaining the fix (e.g., "✅ Fixed! I've [description of fix]. The changes address your feedback by [explanation].")
     - `line`: Line number from the original comment (if applicable)
     - `side`: "RIGHT" (the new state) or "LEFT" (the previous state)
   - **Note**: This adds a comment to your pending review. You may need to create or submit a review first.
   - **Best practices for replying to review comments**:
     - Include a reference to the original comment in your reply body (e.g., "✅ Fixed! Addressing @reviewer's feedback on line X...")
     - Use general PR comments (see Step 7.3) to acknowledge fixes when needed
     - Verify the current capabilities of the GitHub MCP server by checking the latest documentation

2. **Create or submit a review with comments**:
   - Use `mcp_github_pull_request_review_write` with method `create` to create a review with comments
   - Or use method `submit_pending` to submit an existing pending review
   - Parameters:
     - `owner`: Repository owner
     - `repo`: Repository name
     - `pullNumber`: PR number
     - `body`: Review body text (can include summary of fixes)
     - `event`: "COMMENT" (for comments only) or "APPROVE" (if all issues are resolved)
   - This will include all comments added via `add_comment_to_pending_review`

3. **Thread resolution**:
   - Review comment threads are typically resolved when:
     - A new commit addresses the comment
     - The reviewer manually resolves the thread
     - The comment author replies indicating the issue is fixed
   - Include "✅ Fixed" or "✅ Resolved" in your reply to indicate the issue has been addressed

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

1. **Get repository info**:
   ```bash
   REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
   OWNER=$(echo $REPO | cut -d'/' -f1)
   REPO_NAME=$(echo $REPO | cut -d'/' -f2)
   ```

2. **Get all review comments to identify threads**:
   - Use `mcp_github_pull_request_read` with method `get_review_comments`
   - For each comment, check:
     - `in_reply_to_id`: null or missing = root comment
     - `thread_id`: same ID = same thread
     - `is_resolved`: false = needs resolution

3. **For each review comment that was fixed**:
   - Extract: `path`, `line`, `body` from the original comment
   - Prepare reply body explaining the fix

4. **Add reply comments to pending review**:
   - Use `mcp_github_add_comment_to_pending_review` for each fixed comment
   - Parameters:
     - `owner`: $OWNER
     - `repo`: $REPO_NAME
     - `pullNumber`: $PR_NUMBER
     - `path`: File path from original comment
     - `body`: Reply text with fix explanation
     - `line`: Line number (if applicable)
     - `side`: "RIGHT" (new state)

5. **Submit the review**:
   - Use `mcp_github_pull_request_review_write` with method `submit_pending`
   - Or use method `create` with `event: "COMMENT"` to create a new review with all comments
   - This will include all the reply comments added in step 4

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

1. **Get and validate branch name** (CRITICAL - MUST DO FIRST):
   - Get current branch: `git branch --show-current` or `git rev-parse --abbrev-ref HEAD`
   - **If branch cannot be determined**: Prompt user to select a branch first
   - **If branch is `main`, `master`, or default branch**: Stop and inform user - no changes on default branch
   - **Store branch name for validation**

2. **Parse PR number**:
   - If user provided PR number: use it directly, but validate it matches the current branch
   - Otherwise: **Use branch name to find PR**:
     - Repository: Detect from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
     - Extract owner and repo name
     - Use `mcp_github_list_pull_requests` with `head` parameter to find PRs for the current branch
     - **If no PR found**: Stop and inform user: "No pull request found for branch '<branch-name>'. Please create a PR first or specify a different branch."
     - If multiple PRs found: Use the most recent open PR
   - If still not found: ask user for PR number

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
   - For each fixed comment, reply using GitHub MCP server:
     - Use `mcp_github_add_comment_to_pending_review` to add reply comments to your pending review
     - Include file path, line number, and explanation of the fix
     - Submit the review using `mcp_github_pull_request_review_write` with method `submit_pending` or `create`
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
- **Reply to the comment thread** using GitHub MCP server:
  - Use `mcp_github_add_comment_to_pending_review` to add a reply comment
  - Include the file path, line number, and explanation of the fix
  - Submit the review using `mcp_github_pull_request_review_write` with method `submit_pending` or `create`
  - For general PR comments, use `mcp_github_add_issue_comment`
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
  - Use `mcp_github_add_comment_to_pending_review` to add reply comments
  - Use `mcp_github_pull_request_review_write` to submit the review with comments
  - Track which comments have been fixed, replied to, and resolved
- **Use GitHub MCP server for ALL GitHub operations** (never use `gh` CLI)
- Repository: Always detect dynamically from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
- **CRITICAL**: Always validate branch name first - never make changes on default branch (main/master)
- **CRITICAL**: Never make changes if no PR exists for the branch - prompt user to create PR first

