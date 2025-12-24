# Review PR

When the user invokes `/review-pr`, fetch the GitHub PR, perform a thorough code review, and post review comments on GitHub using the `gh` CLI.

## Context Understanding

1. **Get PR number**: The user may provide a PR number, or you should detect it from:
   - Current branch name (if it matches a PR)
   - User input after the command
   - Git remote tracking information

2. **Repository information**:
   - Repository: Detect from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
   - Owner and Repo: Extract from the detected repository string (format: `owner/repo`)
   - Use `gh` CLI for all GitHub operations

## Review Process

### Step 1: Fetch PR Information

1. **Get PR details**:
   ```bash
   gh pr view <PR_NUMBER> --json number,title,body,author,state,baseRefName,headRefName,files,commits
   ```

2. **Get PR diff**:
   ```bash
   gh pr diff <PR_NUMBER>
   ```

3. **Get PR files**:
   ```bash
   gh pr view <PR_NUMBER> --json files --jq '.files[] | {path: .path, additions: .additions, deletions: .deletions, status: .status}'
   ```

### Step 2: Comprehensive Code Review

Perform a thorough review covering:

#### 1. Architecture Compliance

**Backend (Go - Clean Architecture):**
- ✅ Domain layer has no dependencies (check imports)
- ✅ Dependencies point inward (domain ← usecase ← interfaces ← infrastructure)
- ✅ Business logic in use case layer, not handlers
- ✅ Repository interfaces in `internal/interfaces/repository/`
- ✅ Repository implementations in `internal/infrastructure/database/`
- ✅ Handlers are thin, delegate to use cases
- ✅ No business logic in HTTP handlers

**Frontend (React/Vite):**
- ✅ Feature-based component organization
- ✅ Services layer for API calls (not direct fetch in components)
- ✅ Proper state management (Zustand for global, React Query for server state)
- ✅ No business logic in components (extract to hooks/services)

#### 2. Code Quality

**General:**
- ✅ Meaningful variable and function names
- ✅ Functions are small and focused (single responsibility)
- ✅ Avoid deep nesting (max 3-4 levels)
- ✅ Error handling is explicit and comprehensive
- ✅ No commented-out code
- ✅ No hardcoded values (use config/constants)
- ✅ Proper separation of concerns

**Go-specific:**
- ✅ Follows `gofmt` formatting
- ✅ Exported functions/types have comments
- ✅ Error handling uses proper error types
- ✅ No panics in production code
- ✅ Context propagation for cancellation/timeouts
- ✅ Proper use of interfaces

**TypeScript/React-specific:**
- ✅ TypeScript types are properly defined (no `any` unless necessary)
- ✅ Components are properly typed
- ✅ Proper use of React hooks (no violations)
- ✅ Proper cleanup in useEffect
- ✅ No memory leaks (event listeners, subscriptions)
- ✅ Accessibility considerations (ARIA labels, keyboard navigation)

#### 3. Testing

- ✅ New features have corresponding tests
- ✅ Bug fixes include regression tests
- ✅ Tests follow repository patterns:
  - **Go**: Table-driven tests, mock interfaces (not concrete structs)
  - **Frontend**: React Testing Library, MSW for API mocking
- ✅ Test coverage is adequate for critical paths
- ✅ Tests are isolated and don't depend on external state
- ✅ Tests follow "one test at a time" workflow

#### 4. Documentation

- ✅ Swagger annotations for new/changed API endpoints (use `/add-swagger-annotations` pattern)
- ✅ JSDoc comments for public functions
- ✅ Complex logic has explanatory comments
- ✅ README/docs updated if behavior changes
- ✅ Commit message follows Conventional Commits

#### 5. Security

- ✅ No secrets or credentials in code
- ✅ Input validation on all user inputs
- ✅ Authentication/authorization checks where needed
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (proper escaping in frontend)
- ✅ CSRF protection where applicable
- ✅ Rate limiting on sensitive endpoints

#### 6. Performance

- ✅ No N+1 queries (check database access patterns)
- ✅ Proper indexing considerations
- ✅ Efficient algorithms and data structures
- ✅ Frontend: Proper memoization (useMemo, useCallback)
- ✅ Frontend: Code splitting for large components
- ✅ No unnecessary re-renders

#### 7. Repository-Specific Patterns

**Backend:**
- ✅ Follows existing handler patterns
- ✅ Uses existing error types from `pkg/errors`
- ✅ Uses logger from `pkg/logger`
- ✅ Uses validator from `pkg/validator`
- ✅ Follows existing repository patterns

**Frontend:**
- ✅ Follows existing component patterns
- ✅ Uses existing service patterns
- ✅ Follows existing state management patterns
- ✅ Uses existing hooks patterns

#### 8. Breaking Changes

- ✅ Check if changes break existing APIs
- ✅ Check if database schema changes need migrations
- ✅ Check if frontend changes break existing functionality
- ✅ Document breaking changes if any

### Step 3: Generate Review Comments

For each issue found, create a review comment with:

1. **File path and line number** (if applicable)
2. **Issue type**: `BUG`, `SECURITY`, `PERFORMANCE`, `ARCHITECTURE`, `STYLE`, `TESTING`, `DOCUMENTATION`, `SUGGESTION`
3. **Severity**: `BLOCKER`, `CRITICAL`, `MAJOR`, `MINOR`, `INFO`
4. **Description**: Clear explanation of the issue
5. **Suggestion**: Specific recommendation for improvement (with code examples if helpful)

### Step 4: Post Review Comments

Use `gh` CLI to post review comments. For inline comments on specific lines, use `gh api`:

1. **For inline comments on specific lines** (recommended for code review):
   ```bash
   # First, get the head commit SHA for the PR (the latest commit in the PR branch)
   COMMIT_SHA=$(gh pr view <PR_NUMBER> --json headRefOid --jq '.headRefOid')

   # Post inline comment on a specific line
   REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
   gh api repos/$REPO/pulls/<PR_NUMBER>/comments \
     -X POST \
     -f body="Comment text" \
     -f commit_id="$COMMIT_SHA" \
     -f path="<file_path>" \
     -f line=<line_number> \
     -f side="RIGHT"
   ```

2. **For general PR comments** (not tied to specific lines):
   ```bash
   REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
   gh pr comment <PR_NUMBER> --body "Comment text" --repo $REPO
   ```

3. **For review summary** (overall review comment):
   ```bash
   REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
   gh pr review <PR_NUMBER> --comment --body "Review summary" --repo $REPO
   ```

4. **For review with approval/rejection**:
   ```bash
   REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
   gh pr review <PR_NUMBER> --approve --body "Review summary" --repo $REPO
   gh pr review <PR_NUMBER> --request-changes --body "Review summary" --repo $REPO
   ```

**Note**:
- For inline comments, use `gh api` with the commit SHA, file path, and line number
- The `side` parameter should be `"RIGHT"` for comments on the new code (the PR branch)
- Get the commit SHA from `gh pr view --json commits`
- Multiple inline comments can be posted in a single review by creating a review with multiple comments

### Step 5: Create Review Summary

Post a comprehensive review summary that includes:

1. **Overall assessment**:
   - Summary of changes
   - Overall quality assessment
   - Approval status recommendation

2. **Key findings**:
   - Critical issues (must fix)
   - Important issues (should fix)
   - Suggestions (nice to have)

3. **Positive feedback**:
   - What was done well
   - Good patterns followed

4. **Next steps**:
   - What needs to be addressed before merge
   - Optional improvements

## Implementation Steps

1. **Parse PR number**:
   - Check if user provided PR number: `/review-pr 123`
   - If not, try to detect from current branch: `gh pr view --json number`
   - If still not found, ask user for PR number

2. **Fetch PR data**:
   ```bash
   PR_NUMBER=<number>
   gh pr view $PR_NUMBER --json number,title,body,author,state,baseRefName,headRefName,files,commits > /tmp/pr_info.json
   gh pr diff $PR_NUMBER > /tmp/pr_diff.patch
   ```

3. **Analyze changes**:
   - Read the diff file
   - Identify changed files
   - For each file, check against review criteria
   - Identify issues and create review comments

4. **Post comments**:
   - Collect all inline comments first
   - Create a review with all inline comments at once (more efficient)
   - Post summary review comment
   - Use this approach for creating a review with inline comments:
     ```bash
     # Get the head commit SHA
     COMMIT_SHA=$(gh pr view <PR_NUMBER> --json headRefOid --jq '.headRefOid')

     # Create a review with inline comments
     # First, create a JSON file with the review data
     cat > /tmp/review.json <<EOF
     {
       "body": "Review summary with overall assessment",
       "event": "COMMENT",
       "commit_id": "$COMMIT_SHA",
       "comments": [
         {
           "path": "file/path.go",
           "line": 123,
           "body": "Comment text",
           "side": "RIGHT"
         },
         {
           "path": "file/path.go",
           "line": 145,
           "body": "Another comment",
           "side": "RIGHT"
         }
       ]
     }
     EOF

     # Post the review using --input to preserve JSON array structure
     REPO=$(git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/')
     gh api repos/$REPO/pulls/<PR_NUMBER>/reviews \
       -X POST \
       --input /tmp/review.json
     ```

5. **Provide feedback to user**:
   - Show summary of review
   - List issues found
   - Confirm comments were posted

## Review Comment Format

Use this format for review comments:

```markdown
**Issue Type**: [BUG|SECURITY|PERFORMANCE|ARCHITECTURE|STYLE|TESTING|DOCUMENTATION|SUGGESTION]
**Severity**: [BLOCKER|CRITICAL|MAJOR|MINOR|INFO]

**Issue**: [Clear description of the issue]

**Location**: `file/path.go:123`

**Suggestion**:
[Specific recommendation with code example if helpful]

**Example fix**:
\`\`\`go
// Before
if err != nil {
    return err
}

// After
if err != nil {
    return fmt.Errorf("failed to process: %w", err)
}
\`\`\`
```

## Common Issues to Check

### Backend (Go)

1. **Missing error handling**: Check all function calls that return errors
2. **Business logic in handlers**: Should be in use case layer
3. **Missing Swagger annotations**: New endpoints need annotations
4. **Missing tests**: New features need tests
5. **Hardcoded values**: Should use config
6. **Missing context propagation**: Long-running operations need context
7. **Improper error wrapping**: Use `fmt.Errorf` with `%w`
8. **Missing validation**: User inputs should be validated

### Frontend (React/TypeScript)

1. **Missing types**: Avoid `any`, use proper TypeScript types
2. **Missing error handling**: API calls should handle errors
3. **Memory leaks**: Check useEffect cleanup
4. **Missing accessibility**: Check ARIA labels, keyboard navigation
5. **Performance issues**: Check unnecessary re-renders, missing memoization
6. **Missing tests**: New components need tests
7. **Business logic in components**: Should be in hooks/services
8. **Missing loading states**: Async operations need loading indicators

## Examples

### Example 1: Architecture Issue

```markdown
**Issue Type**: ARCHITECTURE
**Severity**: MAJOR

**Issue**: Business logic is in the HTTP handler instead of the use case layer. This violates Clean Architecture principles.

**Location**: `apps/api-go/internal/interfaces/http/handlers/invitation_handler.go:45`

**Suggestion**: Move the invitation validation and creation logic to a use case in `internal/usecase/invitation/`. The handler should only:
1. Parse the request
2. Call the use case
3. Format the response

**Example**:
\`\`\`go
// Handler should be thin
func (h *InvitationHandler) Create(c *gin.Context) {
    var req CreateInvitationRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    invitation, err := h.invitationUseCase.Create(c.Request.Context(), req)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(201, invitation)
}
\`\`\`
```

### Example 2: Missing Test

```markdown
**Issue Type**: TESTING
**Severity**: MAJOR

**Issue**: New use case method `CreateInvitation` doesn't have tests. All business logic should be covered by tests.

**Location**: `apps/api-go/internal/usecase/invitation/create.go`

**Suggestion**: Add table-driven tests following the repository pattern. See `apps/api-go/internal/usecase/invitation/create_test.go` for examples.

**Test cases to cover**:
- Valid invitation creation
- Invalid input validation
- Database errors
- Duplicate invitation handling
```

### Example 3: Security Issue

```markdown
**Issue Type**: SECURITY
**Severity**: CRITICAL

**Issue**: User input is not validated before database query. This could lead to injection attacks.

**Location**: `apps/api-go/internal/interfaces/http/handlers/invitation_handler.go:78`

**Suggestion**: Validate all user inputs using the validator package. Check existing patterns in `pkg/validator/`.

**Example**:
\`\`\`go
if err := validator.Validate(req); err != nil {
    c.JSON(400, gin.H{"error": err.Error()})
    return
}
\`\`\`
```

## Notes

- Always be constructive and helpful in comments
- Provide specific, actionable feedback
- Reference repository patterns and examples
- Acknowledge good work when appropriate
- Focus on important issues first (blockers, critical, major)
- Use `gh` CLI for all GitHub operations
- If `gh` is not authenticated, prompt user to run `gh auth login`
- For inline comments, you may need to use `gh api` for more control
- Group related comments when possible to avoid spam
- Post a summary comment at the end with overall assessment

