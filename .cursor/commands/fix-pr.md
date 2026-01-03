# Fix PR

When the user invokes `/fix-pr`, fetch the GitHub PR, read **ALL** PR comments (including every single inline comment), check CI checks for failures, fix all issues found, and commit the fixes. **CRITICAL**: You MUST reply to EVERY single inline comment individually, explaining what specific changes were made to address each comment. If no fixes are required, inform the user.

## Critical Validation Rules

**BEFORE making any changes, you MUST:**

1. **Get and validate branch name FIRST**:
   - Always get current branch: `git branch --show-current`
   - **NEVER make changes if branch name cannot be determined** - prompt user to select branch
   - **NEVER make changes on `main`, `master`, or any default/protected branch** - stop and inform user

2. **Verify PR exists for branch**:
   - Use `mcp_github_list_pull_requests` with `head` filter to find PR for the branch
   - **If no PR found**: Do NOT make any changes - prompt user: "No pull request found for branch '<branch-name>'. Please create a PR first or specify a different branch."

3. **Use GitHub MCP server for most operations**:
   - **Use GitHub MCP server for all GitHub operations** (PR reading, creating reviews, adding comments, etc.)
   - **Exception**: For replying to existing inline review comments, use `gh api` (see Step 7.2 for details)
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

**Note**: For replying to review comment threads:
- **Reply to existing inline comments**: Use `gh api` with the endpoint `/repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies` (see Step 7.2 for details)
- **Add new review comments**: Use `mcp_github_add_comment_to_pending_review` - Add a comment to your pending review
- **Create or submit review**: `mcp_github_pull_request_review_write` with method `create` or `submit_pending` - Create a review with comments or submit a pending review
- **Add general PR comment**: `mcp_github_add_issue_comment` - Add a comment to the PR (PRs are issues in GitHub)

**Note**: The GitHub MCP server doesn't have a direct function to reply to existing inline comments. Use `gh api` for threaded replies to existing comments, as it creates proper reply threads in GitHub.

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

**CRITICAL**: You MUST read and process EVERY single inline comment. No comment should be skipped.

Use GitHub MCP server to fetch all comments:

1. **Get all PR comments** (general comments):
   - Use `mcp_github_pull_request_read` with method `get_comments`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract: body, author, createdAt, id for each comment
   - **Track each comment** for later response

2. **Get all review comments** (inline comments and review threads):
   - Use `mcp_github_pull_request_read` with method `get_review_comments`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract for EACH comment:
     - `id` - Comment ID (needed for replies)
     - `body` - Comment text (read carefully to understand the issue)
     - `path` - File path where comment was made
     - `line` - Line number (or startLine/endLine for multi-line)
     - `author` - Who made the comment
     - `thread_id` or `in_reply_to_id` - Thread information
     - `is_resolved` - Whether already resolved
     - `createdAt` - When comment was created
   - **CRITICAL**: Process EVERY comment - do not skip any
   - **Group comments by thread** to understand context

3. **Get all reviews**:
   - Use `mcp_github_pull_request_read` with method `get_reviews`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract: body, state, author, comments for each review
   - Review bodies may contain additional feedback

4. **Create a tracking list**:
   - For each comment (both inline and general), create an entry tracking:
     - Comment ID
     - Comment text
     - File path and line number (if inline)
     - Author
     - Whether it's actionable (requires code changes)
     - Whether it's been fixed
     - What changes were made to address it
     - Whether a reply has been sent
   - **This list ensures NO comment is missed**

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

5. **Review comments** (CRITICAL - Process EVERY comment):
   - **Read and understand EVERY single comment**:
     - Parse each comment for actionable feedback
     - Identify code issues mentioned in each comment
     - Extract file paths and line numbers for each inline comment
     - Understand the specific requested changes for each comment
     - Categorize each comment (BUG, SECURITY, ARCHITECTURE, STYLE, TESTING, DOCUMENTATION, SUGGESTION)
   - **Create a comprehensive list** of all comments that need to be addressed
   - **No comment should be skipped** - even if it seems minor or already addressed

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

**CRITICAL**: You MUST address and reply to EVERY single inline comment individually. Each comment must receive a specific reply explaining what changes were made.

For EACH actionable review comment (process them one by one, do not skip any):

1. **Parse EACH comment individually**:
   - Extract file path and line number (if inline comment)
   - Read the comment text carefully to fully understand the issue
   - Understand the specific requested change
   - Identify the issue type (BUG, SECURITY, ARCHITECTURE, STYLE, TESTING, DOCUMENTATION, SUGGESTION)
   - Store comment ID, author, and all details for later response
   - **Mark in tracking list**: comment needs to be addressed

2. **Apply the fix for THIS specific comment**:
   - Read the relevant file at the comment's location
   - Understand the current code and what the comment is asking for
   - Make the necessary changes to address THIS specific comment
   - Ensure the fix directly addresses what the comment requested
   - **Document exactly how the fix addresses this comment** (for the individual reply)

3. **Verify the fix for THIS comment**:
   - Verify the change addresses the comment's concern
   - Run relevant tests to ensure the fix doesn't break anything
   - Check linting and formatting
   - **Update tracking list**: mark comment as fixed, record what was changed

4. **Prepare individual reply for THIS comment**:
   - Write a specific reply explaining:
     - What the original comment was about
     - What specific changes were made to address it
     - How the changes fix the issue
     - Reference the file path and line number
   - Example reply format:
     ```
     ✅ Fixed! Addressing your feedback on line 123:

     **Original concern**: [Brief summary of what the comment said]

     **Changes made**:
     - [Specific change 1 that was made]
     - [Specific change 2 that was made]

     **How it addresses the feedback**: [Explanation of how the changes resolve the issue]

     The code now [describes the improved state].
     ```

5. **Track fixes for ALL comments**:
   - Maintain a comprehensive list of ALL comments (both addressed and not yet addressed)
   - For each comment, record:
     - Comment ID
     - Comment text
     - File path and line number
     - Author
     - Whether it's been fixed
     - What specific changes were made
     - The prepared reply text
     - Whether reply has been sent
   - **Ensure NO comment is left without a reply** - even if the comment was already addressed in a previous commit, you must acknowledge it

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

**CRITICAL**: After all fixes are complete and tests pass, you MUST reply to EVERY single inline comment individually. Each comment must receive a specific, detailed reply explaining what changes were made to address that particular comment.

**Requirements**:
- **Read EVERY comment** - no comment should be skipped
- **Reply to EVERY comment individually** - each comment gets its own reply
- **Be specific in each reply** - explain exactly what changes were made for that comment
- **Reference the comment** - acknowledge what the original concern was
- **Reply directly to review comment threads** to show that feedback has been addressed

#### 7.1: Get Review Comment Threads

**CRITICAL**: You must process EVERY single comment. Create a complete inventory before proceeding.

1. **Get ALL review comments with thread information**:
   - Use `mcp_github_pull_request_read` with method `get_review_comments`
   - Repository: Detect from git remote (see Step 1.2)
   - Extract for EACH comment (do not skip any):
     - `id` - Comment ID (needed for replies)
     - `body` - Comment text (read carefully)
     - `path` - File path
     - `line` - Line number (or startLine/endLine for multi-line)
     - `thread_id` or `in_reply_to_id` - Thread information
     - `is_resolved` - Whether thread is already resolved
     - `author` - Who made the comment
     - `createdAt` - When comment was created
   - **Count the total number of comments** to ensure you process all of them

2. **Group comments by thread**:
   - Comments with the same `thread_id` or `in_reply_to_id` belong to the same thread
   - The root comment of a thread has no `in_reply_to_id` (or `in_reply_to_id` is null)
   - Track which comments have been fixed and need replies
   - **Important**: When replying, reply to the **root comment** of the thread (the original review comment), not to replies within the thread

3. **Create a complete comment inventory**:
   - List ALL comments (both resolved and unresolved)
   - For each comment, mark:
     - Whether it requires code changes
     - Whether changes have been made
     - Whether a reply has been prepared
     - Whether a reply has been sent
   - **This ensures NO comment is missed**

#### 7.2: Reply to Review Comment Threads

**CRITICAL**: You MUST reply to EVERY single review comment individually. Each comment must receive its own specific reply explaining what changes were made.

**Process**: Go through your comment tracking list and reply to EACH comment one by one. Do not skip any comments.

For EACH review comment (process them individually):

1. **Get the comment ID**:
   - From the review comments data retrieved in Step 7.1, extract the `id` field for each comment
   - The comment ID is a numeric value (e.g., `2659114434`)
   - Store the comment ID along with the comment details in your tracking list

2. **For inline review comments** (comments on specific lines in code):
   - **Read the original comment** to understand what was requested
   - **Check what changes were made** to address this specific comment
   - **Write a specific reply** for THIS comment explaining:
     - What the original concern was (brief summary)
     - What specific changes were made to address it
     - How the changes resolve the issue
     - Reference the file path and line number

   - **Example reply format**:
     ```
     ✅ Fixed! Addressing your feedback on `file/path.go:123`:

     **Original concern**: [Brief summary of the comment]

     **Changes made**:
     - [Specific change 1]
     - [Specific change 2]

     **How it addresses the feedback**: [Explanation]

     The code now [describes improved state].
     ```

   - **Use `gh api` to reply to the inline comment** (creates proper threaded reply):
     ```bash
     gh api --method POST \
       /repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies \
       -f body="Your reply text here"
     ```
     - Replace `OWNER` with repository owner
     - Replace `REPO` with repository name
     - Replace `PR_NUMBER` with the PR number
     - Replace `COMMENT_ID` with the numeric comment ID from step 1
     - Replace `"Your reply text here"` with the specific reply you prepared
     - **Important**: The PR number must be included in the path (`/pulls/PR_NUMBER/comments/...`)

   - **Example command**:
     ```bash
     gh api --method POST \
       /repos/NoSkillGuy/sacred-vows/pulls/87/comments/2659114434/replies \
       -f body="✅ Fixed! I've updated the error handling as requested. The code now properly wraps errors with context."
     ```

   - **Mark in tracking list**: This comment has been replied to

3. **For comments that were already addressed** (in previous commits):
   - **Still reply to them** to acknowledge the fix
   - Reply format:
     ```
     ✅ This was addressed in a previous commit. The code now [describes current state].

     **What was changed**: [Brief description of the fix that was made]
     ```
   - Use the same `gh api` command to reply to the comment

4. **Thread resolution**:
   - Review comment threads are automatically threaded when you reply using `gh api`
   - The reply will appear as a threaded response to the original comment
   - Include "✅ Fixed" or "✅ Resolved" in your reply to indicate the issue has been addressed
   - **Mark thread as resolved** (optional, after replying):
     - Use GraphQL API to resolve the review thread:
       ```bash
       # Step 1: Get review threads to find the thread ID
       gh api graphql -f query='
       query ReviewThreads($owner: String!, $repo: String!, $prNumber: Int!) {
         repository(owner: $owner, name: $repo) {
           pullRequest(number: $prNumber) {
             reviewThreads(first: 50) {
               nodes {
                 id
                 isResolved
                 comments(first: 10) {
                   nodes {
                     id
                     body
                   }
                 }
               }
             }
           }
         }
       }
       ' -F owner="OWNER" -F repo="REPO" -F prNumber=PR_NUMBER

       # Step 2: Find the thread containing your comment ID, then resolve it
       gh api graphql -f query='
       mutation ResolveThread($threadId: ID!) {
         resolveReviewThread(input: {threadId: $threadId}) {
           thread {
             id
             isResolved
           }
         }
       }
       ' -F threadId="THREAD_ID"
       ```
     - The comment ID from MCP/REST matches the comment node IDs in GraphQL threads
     - Find the thread containing your comment, then use its GraphQL ID to resolve it
     - **Unresolve a thread** (if needed):
       ```bash
       gh api graphql -f query='
       mutation UnresolveThread($threadId: ID!) {
         unresolveReviewThread(input: {threadId: $threadId}) {
           thread {
             id
             isResolved
           }
         }
       }
       ' -F threadId="THREAD_ID"
       ```
       - Use this to toggle a resolved thread back to unresolved state
   - **Verify**: Check your tracking list to ensure EVERY comment has been replied to
   - **Verify on GitHub**: Check the PR to confirm all replies are properly threaded and threads are resolved

#### 7.3: Reply to General PR Comments

**CRITICAL**: Reply to EVERY general PR comment individually with specific details about what was changed.

For EACH general PR comment (not inline code comments) - process them one by one:

1. **Read the comment carefully**:
   - Understand what the comment is asking for
   - Check what changes were made to address it
   - Prepare a specific reply for THIS comment

2. **Use MCP to add a reply**:
   - Use `mcp_github_add_issue_comment` (PRs are issues in GitHub)
   - Repository: Detect from git remote (see Step 1.2)
   - Issue number: PR number
   - Body: Write a specific reply for THIS comment:
     ```
     ✅ Fixed! @[original-comment-author]

     **Original concern**: [Brief summary of the comment]

     **Changes made**:
     - [Specific change 1]
     - [Specific change 2]

     **How it addresses the feedback**: [Explanation]
     ```

3. **Reference the original comment**:
   - If the comment has an ID or author, reference them: "✅ Fixed! @[original-comment-author]"
   - Make it clear which comment you're responding to

4. **Track replies**:
   - Mark in your tracking list that this comment has been replied to
   - Ensure NO general comment is left without a reply

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

**CRITICAL**: This workflow ensures EVERY comment gets an individual reply.

1. **Get repository info**:
   ```bash
   REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
   OWNER=$(echo $REPO | cut -d'/' -f1)
   REPO_NAME=$(echo $REPO | cut -d'/' -f2)
   ```

2. **Get ALL review comments to identify threads**:
   - Use `mcp_github_pull_request_read` with method `get_review_comments`
   - **Count total comments**: Ensure you know how many comments exist
   - For each comment, check:
     - `in_reply_to_id`: null or missing = root comment
     - `thread_id`: same ID = same thread
     - `is_resolved`: false = needs resolution
   - **Create tracking list** with ALL comments

3. **For EACH review comment** (process them one by one, do not skip any):
   - **Read the original comment**: Understand what it's asking for
   - **Check what changes were made**: Review the code changes to see if this comment was addressed
   - **Extract details**: `path`, `line`, `body`, `author`, `id` from the original comment
   - **Prepare specific reply body** for THIS comment:
     - Explain what the original concern was
     - List the specific changes made
     - Explain how the changes address the feedback
     - Be specific and detailed

4. **Reply to EACH comment using `gh api`** (one by one):
   - **For EACH comment** (even if already addressed), use `gh api` to create a threaded reply:
     ```bash
     gh api --method POST \
       /repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies \
       -f body="Your specific reply text for THIS comment"
     ```
   - Extract `COMMENT_ID` from the review comments data (numeric ID field)
   - Replace `$OWNER`, `$REPO_NAME`, `$PR_NUMBER`, and `$COMMENT_ID` with actual values
   - Use the specific reply text you prepared for THIS comment
   - **Important**: The PR number must be included in the path
   - **Mark in tracking list**: This comment has been replied to
   - **Continue until ALL comments have replies**

5. **Verify completeness**:
   - Check your tracking list: Every comment should have a reply
   - Count: Number of replies should match number of comments
   - If any comment is missing a reply, add it now
   - **Verify on GitHub**: Check the PR to confirm all replies are properly threaded

6. **No need to submit a review**:
   - When using `gh api` to reply directly to comments, the replies are automatically posted
   - No pending review submission is needed
   - Replies appear immediately as threaded responses to the original comments

#### 7.6: Track Comment Replies

**CRITICAL**: Maintain a comprehensive tracking list to ensure NO comment is missed.

For EACH comment (both inline and general), track:

1. **Comment identification**:
   - ✅ Comment ID
   - ✅ Comment text (full text)
   - ✅ Author
   - ✅ File path and line number (if inline)
   - ✅ Thread ID (if part of a thread)
   - ✅ Created date

2. **Status tracking**:
   - ✅ Has been read and understood
   - ✅ Requires code changes (yes/no)
   - ✅ Has been fixed in code (yes/no)
   - ✅ What specific changes were made
   - ✅ Reply has been prepared (yes/no)
   - ✅ Reply text (the actual reply content)
   - ✅ Reply has been sent (yes/no)
   - ✅ Thread resolved (if applicable)

3. **Verification checklist**:
   - ✅ Total number of comments: [count]
   - ✅ Number of comments replied to: [count]
   - ✅ Number of comments still needing replies: [count]
   - **CRITICAL**: These numbers must match - if not, find the missing comments

4. **Before completing Step 7, verify**:
   - Every comment in your list has a reply
   - Every reply is specific to that comment
   - Every reply explains what changes were made
   - No comment was skipped

This comprehensive tracking ensures all feedback is properly addressed and acknowledged.

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

8. **Address review comments** (CRITICAL - Reply to EVERY comment individually):
   - Get ALL review comment threads using `mcp_github_pull_request_read` with method `get_review_comments`
   - **Create a complete inventory** of ALL comments (count them)
   - **For EACH inline comment** (process them one by one, do not skip any):
     - Read and understand the comment
     - Extract the comment ID (numeric `id` field from the review comments data)
     - Check what changes were made to address it
     - Prepare a specific reply explaining what changes were made for THIS comment
     - Use `gh api` to reply to the comment:
       ```bash
       gh api --method POST \
         /repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies \
         -f body="Your specific reply text"
       ```
     - Include in the reply:
       - What the original concern was
       - What specific changes were made
       - How the changes address the feedback
       - File path and line number (if inline)
     - Mark in tracking list that this comment has been replied to
   - **For general comments**: Use `mcp_github_add_issue_comment` (PR number as issue number)
     - Reply to EACH general comment individually with specific details
   - **Verify completeness**: Check that every comment has a reply
   - **Verify on GitHub**: Check the PR to confirm all replies are properly threaded
   - Create summary comment if multiple comments were addressed (in addition to individual replies)

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
**CRITICAL**: Process EVERY comment individually. No comment should be skipped.

- **Read EVERY comment carefully** - create a complete inventory
- **For EACH comment**:
  - Understand the requested change
  - Apply the fix (if needed)
  - Verify it addresses the comment
  - **Prepare a specific reply** explaining what changes were made for THIS comment
- **Reply to EVERY comment thread individually**:
  - **For inline comments**: Use `gh api` to create threaded replies:
    ```bash
    gh api --method POST \
      /repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies \
      -f body="Your specific reply text"
    ```
    - Extract comment ID from review comments data (numeric `id` field)
    - Include in EACH reply:
      - What the original concern was
      - What specific changes were made
      - How the changes address the feedback
      - File path and line number (if inline)
  - **For general PR comments**: Use `mcp_github_add_issue_comment` (PR number as issue number)
- **Track which comments have been fixed, replied to, and resolved**
- **Verify**: Every comment should have an individual reply
- **Verify on GitHub**: Check the PR to confirm all replies are properly threaded

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
- **CRITICAL**: Reply to EVERY single inline comment individually with specific details:
  - Read and process EVERY comment - no comment should be skipped
  - For EACH comment, write a specific reply explaining what changes were made
  - Use `gh api` to reply to existing inline comments (creates proper threaded replies):
    ```bash
    gh api --method POST \
      /repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies \
      -f body="Your reply text"
    ```
  - Extract comment IDs from review comments data (numeric `id` field)
  - Track which comments have been fixed, replied to, and resolved
  - Verify: Every comment should have an individual reply before completing the fix
  - Verify on GitHub: Check the PR to confirm all replies are properly threaded
- **Use GitHub MCP server for most GitHub operations** (reading PRs, creating reviews, etc.)
- **Exception**: Use `gh api` for replying to existing inline review comments (see Step 7.2)
- Repository: Always detect dynamically from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
- **CRITICAL**: Always validate branch name first - never make changes on default branch (main/master)
- **CRITICAL**: Never make changes if no PR exists for the branch - prompt user to create PR first

