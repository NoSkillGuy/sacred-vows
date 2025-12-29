# Review PR

When the user invokes `/review-pr`, fetch the GitHub PR, perform a thorough code review, and post review comments on GitHub using the GitHub MCP server.

## Critical Validation Rules

**BEFORE starting the review, you MUST:**

1. **Get and validate branch name FIRST**:
   - Always get current branch: `git branch --show-current`
   - **NEVER proceed if branch name cannot be determined** - prompt user to select branch
   - **NEVER review PRs on `main`, `master`, or any default/protected branch** - stop and inform user

2. **Verify PR exists for branch**:
   - Use `mcp_github_list_pull_requests` with `head` filter to find PR for the branch
   - **If no PR found**: Do NOT proceed - prompt user: "No pull request found for branch '<branch-name>'. Please create a PR first or specify a different branch."

3. **Use GitHub MCP server ONLY**:
   - **NEVER use `gh` CLI or `gh api` commands**
   - All GitHub operations must use MCP functions
   - Repository detection: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`

## Context Understanding

1. **Get and validate branch name FIRST** (CRITICAL):
   - **Always detect the current branch name first** using: `git branch --show-current` or `git rev-parse --abbrev-ref HEAD`
   - **NEVER proceed if you don't know the branch name**
   - **NEVER review PRs on the main branch** (or master, or any protected default branch)
   - If branch name cannot be determined, **prompt the user to select the branch first**
   - If the current branch is `main`, `master`, or the default branch, **stop and inform the user**

2. **Get PR number**: The user may provide a PR number, or you should detect it from:
   - **Branch name** (primary method): Use `mcp_github_list_pull_requests` filtered by `head` parameter to find PRs for the current branch
   - User input after the command: `/review-pr 123`
   - **If no PR exists for the branch**: **Do not proceed** and prompt the user: "No pull request found for branch '<branch-name>'. Please create a PR first or specify a different branch."

3. **Repository information**:
   - Repository: Detect from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
   - Owner and Repo: Extract from the detected repository string (format: `owner/repo`)
   - **Use GitHub MCP server for ALL GitHub operations** (never use `gh` CLI)

## Review Process

### Step 1: Fetch PR Information

1. **Get and validate branch name** (CRITICAL - DO THIS FIRST):
   ```bash
   CURRENT_BRANCH=$(git branch --show-current)
   # Or: CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
   ```
   - **If branch name cannot be determined**: Prompt user: "Unable to determine current branch. Please select a branch first."
   - **If branch is `main`, `master`, or default branch**: Stop and inform user: "Cannot review PRs on the default branch. Please checkout a feature branch first."
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

3. **Get PR details** using GitHub MCP server:
   - Use `mcp_github_pull_request_read` with method `get`
   - Repository: Detect from git remote (see Context Understanding section)
   - Extract: number, title, body, author, state, baseRefName, headRefName, headRefOid, files, commits

4. **Get PR diff**:
   - Use `mcp_github_pull_request_read` with method `get_diff`
   - Repository: Detect from git remote (see Context Understanding section)
   - This returns the full diff of the PR

5. **Get PR files**:
   - Use `mcp_github_pull_request_read` with method `get_files`
   - Repository: Detect from git remote (see Context Understanding section)
   - Extract: path, additions, deletions, status for each file

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

**Testing Philosophy**: We strive for 100% test coverage with tests that have real logical meaning and real flows. Tests should validate actual business logic, user flows, and edge cases—not just exist for the sake of coverage. Every test should answer "What behavior am I verifying?" and "Why does this test matter?"

**Test Coverage Requirements:**
- ✅ **100% test coverage goal**: All new code must have comprehensive test coverage
- ✅ **Meaningful tests**: Tests must validate real business logic, user flows, and edge cases
- ✅ **No trivial tests**: Avoid tests that don't verify meaningful behavior (e.g., testing getters/setters without logic)
- ✅ **Proper test pyramid**: Tests should be organized across three levels:
  - **Unit tests**: Test individual functions/methods in isolation with mocked dependencies
  - **Integration tests**: Test interactions between components (e.g., use case + repository, service + API)
  - **End-to-end tests**: Test complete user flows from frontend to backend
- ✅ New features have corresponding tests at appropriate levels (unit, integration, e2e)
- ✅ Bug fixes include regression tests that prevent the bug from reoccurring
- ✅ Tests follow repository patterns:
  - **Go**: Table-driven tests, mock interfaces (not concrete structs)
  - **Frontend**: React Testing Library, MSW for API mocking
- ✅ Tests are isolated and don't depend on external state
- ✅ Tests follow "one test at a time" workflow
- ✅ Test names clearly describe what behavior is being verified
- ✅ Tests cover both happy paths and error cases
- ✅ Tests validate actual business outcomes, not just implementation details

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
- ✅ Layout changes include corresponding export functionality updates (CSV, PDF, Excel, etc.)

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

Use GitHub MCP server to post review comments. The recommended approach is to create a pending review and add comments to it, then submit the review.

1. **Create a pending review with inline comments** (recommended for code review):
   - Use `mcp_github_pull_request_review_write` with method `create` (without `event` parameter to create a pending review)
   - Repository: Detect from git remote (see Context Understanding section)
   - Get the head commit SHA from PR data (`headRefOid`)
   - For each inline comment, use `mcp_github_add_comment_to_pending_review`:
     - `path`: File path
     - `line`: Line number (for single-line comments)
     - `startLine`: Start line (for multi-line comments)
     - `side`: `"RIGHT"` (for comments on the new code in the PR)
     - `body`: Comment text
   - After adding all comments, submit the review using `mcp_github_pull_request_review_write` with method `submit_pending`:
     - `event`: `"COMMENT"` (for review with comments only), `"APPROVE"` (to approve), or `"REQUEST_CHANGES"` (to request changes)
     - `body`: Overall review summary

2. **For general PR comments** (not tied to specific lines):
   - Use `mcp_github_add_issue_comment` (PRs are issues in GitHub)
   - Repository: Detect from git remote (see Context Understanding section)
   - Issue number: PR number
   - Body: Comment text

**Note**:
- **Preferred approach**: Use MCP `pull_request_review_write` with `create` (pending), then `add_comment_to_pending_review` for each comment, then `submit_pending` to submit
- For inline comments, the `side` parameter should be `"RIGHT"` for comments on the new code (the PR branch)
- Get the commit SHA from PR data (`headRefOid` from `pull_request_read`)
- Multiple inline comments can be added to a single pending review before submitting

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

1. **Get and validate branch name** (CRITICAL - MUST DO FIRST):
   - Get current branch: `git branch --show-current` or `git rev-parse --abbrev-ref HEAD`
   - **If branch cannot be determined**: Prompt user to select a branch first
   - **If branch is `main`, `master`, or default branch**: Stop and inform user - no reviews on default branch
   - **Store branch name for validation**

2. **Parse PR number**:
   - Check if user provided PR number: `/review-pr 123`
   - If provided: use it directly, but validate it matches the current branch
   - Otherwise: **Use branch name to find PR**:
     - Repository: Detect from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
     - Extract owner and repo name
     - Use `mcp_github_list_pull_requests` with `head` parameter to find PRs for the current branch
     - **If no PR found**: Stop and inform user: "No pull request found for branch '<branch-name>'. Please create a PR first or specify a different branch."
     - If multiple PRs found: Use the most recent open PR
   - If still not found: ask user for PR number

3. **Fetch PR data using GitHub MCP**:
   - Use `mcp_github_pull_request_read` with method `get` to get PR details
   - Use `mcp_github_pull_request_read` with method `get_diff` to get PR diff
   - Use `mcp_github_pull_request_read` with method `get_files` to get changed files
   - Repository: Detect from git remote (see Context Understanding section)

4. **Analyze changes**:
   - Read the diff file
   - Identify changed files
   - For each file, check against review criteria
   - Identify issues and create review comments

5. **Post comments using GitHub MCP**:
   - Collect all inline comments first
   - Create a pending review using `mcp_github_pull_request_review_write` with method `create` (without `event` parameter)
   - For each inline comment, use `mcp_github_add_comment_to_pending_review`:
     - Repository: Detect from git remote (see Context Understanding section)
     - Pull number: PR number
     - Path: File path
     - Line: Line number (or startLine/endLine for multi-line)
     - Side: `"RIGHT"` (for PR branch code)
     - Body: Comment text
   - After adding all comments, submit the review using `mcp_github_pull_request_review_write` with method `submit_pending`:
     - Event: `"COMMENT"` (for review with comments), `"APPROVE"`, or `"REQUEST_CHANGES"`
     - Body: Overall review summary
   - For general comments (not inline), use `mcp_github_add_issue_comment` (PR number as issue number)

6. **Provide feedback to user**:
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
4. **Missing or inadequate tests**:
   - New features need comprehensive tests (unit, integration, e2e as appropriate)
   - Tests must have real logical meaning and validate actual business flows
   - Missing tests for error cases and edge conditions
   - Trivial tests that don't verify meaningful behavior
   - Missing integration tests for component interactions
   - Missing e2e tests for critical user flows
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
6. **Missing or inadequate tests**:
   - New components need comprehensive tests (unit, integration, e2e as appropriate)
   - Tests must validate real user interactions and business flows
   - Missing tests for error states, loading states, and edge cases
   - Trivial tests that don't verify meaningful behavior
   - Missing integration tests for component interactions with services
   - Missing e2e tests for critical user flows (use Playwright)
7. **Business logic in components**: Should be in hooks/services
8. **Missing loading states**: Async operations need loading indicators
9. **Layout and export consistency**: When layout changes are made (e.g., table columns, form fields, display order), ensure corresponding changes are made to export functionality (CSV, PDF, Excel, etc.) to maintain consistency between what users see and what they can export

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

### Example 2: Missing or Inadequate Tests

```markdown
**Issue Type**: TESTING
**Severity**: MAJOR

**Issue**: New use case method `CreateInvitation` doesn't have comprehensive tests. We strive for 100% test coverage with tests that validate real business logic and flows.

**Location**: `apps/api-go/internal/usecase/invitation/create.go`

**Suggestion**: Add meaningful tests at appropriate levels following the repository pattern. Tests should validate actual business outcomes, not just implementation details.

**Required test coverage**:

1. **Unit tests** (in `create_test.go`):
   - Valid invitation creation with proper business logic validation
   - Invalid input validation (all validation rules)
   - Database errors (connection failures, constraint violations)
   - Duplicate invitation handling (business rule enforcement)
   - Edge cases (boundary conditions, nil values)

2. **Integration tests** (if applicable):
   - Use case + repository interaction
   - Transaction handling
   - Error propagation

3. **End-to-end tests** (Playwright):
   - Complete user flow: create invitation → receive email → accept invitation
   - Error scenarios in the full flow

**Test quality requirements**:
- Each test should clearly describe what business behavior it's verifying
- Tests should use table-driven approach for Go (see existing patterns)
- Mock interfaces, not concrete structs
- Tests should be isolated and not depend on external state
- Avoid trivial tests that don't verify meaningful behavior
```

### Example 3: Trivial or Meaningless Tests

```markdown
**Issue Type**: TESTING
**Severity**: MAJOR

**Issue**: Tests exist but don't validate meaningful behavior. These tests add maintenance burden without providing real value.

**Location**: `apps/api-go/internal/usecase/invitation/create_test.go:45`

**Suggestion**: Replace trivial tests with tests that validate actual business logic and real flows.

**Examples of trivial tests to avoid**:
- Testing simple getters/setters without business logic
- Testing that a function returns what you passed in (no transformation)
- Testing implementation details rather than behavior
- Tests that only verify no errors occurred without checking outcomes

**What to test instead**:
- Business rules and validation logic
- Error handling and edge cases
- Data transformations and calculations
- Integration between components
- Complete user flows (e2e)

**Example**:
\`\`\`go
// ❌ Trivial test - doesn't verify meaningful behavior
func TestCreateInvitation_ReturnsInvitation(t *testing.T) {
    inv := &Invitation{Email: "test@example.com"}
    result := createInvitation(inv)
    assert.NotNil(t, result) // This doesn't verify any business logic
}

// ✅ Meaningful test - validates business logic
func TestCreateInvitation_ValidatesEmailFormat(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {"valid email", "user@example.com", false},
        {"invalid email", "not-an-email", true},
        {"empty email", "", true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            _, err := createInvitation(&Invitation{Email: tt.email})
            if (err != nil) != tt.wantErr {
                t.Errorf("CreateInvitation() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
\`\`\`
```

### Example 4: Security Issue

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

## GitHub MCP Functions to Use

Most GitHub operations should use these MCP functions:

- **Get PR details**: `mcp_github_pull_request_read` with method `get`
- **Get PR diff**: `mcp_github_pull_request_read` with method `get_diff`
- **Get PR files**: `mcp_github_pull_request_read` with method `get_files`
- **Get commit details**: `mcp_github_get_commit`
- **List PRs**: `mcp_github_list_pull_requests` (to find PR by branch)
- **Create pending review**: `mcp_github_pull_request_review_write` with method `create` (without `event`)
- **Add comment to pending review**: `mcp_github_add_comment_to_pending_review`
- **Submit review**: `mcp_github_pull_request_review_write` with method `submit_pending`
- **Add general PR comment**: `mcp_github_add_issue_comment` (use PR number as issue number)

## Notes

- Always be constructive and helpful in comments
- Provide specific, actionable feedback
- Reference repository patterns and examples
- Acknowledge good work when appropriate
- Focus on important issues first (blockers, critical, major)
- **Use GitHub MCP server for ALL GitHub operations** (never use `gh` CLI)
- Repository: Always detect dynamically from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
- Group related comments when possible to avoid spam
- Post a summary comment at the end with overall assessment
- **Test quality is critical**: Reject tests that exist only for coverage metrics. Every test must validate meaningful business logic, user flows, or edge cases. Ensure proper test pyramid: unit tests for isolated logic, integration tests for component interactions, and e2e tests for critical user journeys.
- **CRITICAL**: Always validate branch name first - never review PRs on default branch (main/master)
- **CRITICAL**: Never proceed if no PR exists for the branch - prompt user to create PR first

