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

3. **Use GitHub MCP server for most operations**:
   - **Use GitHub MCP server for all GitHub operations** (PR reading, creating reviews, adding comments, etc.)
   - **Exception**: For replying to existing inline review comments, use `gh api` (see Step 2 for details)
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

6. **Get existing review comments**:
   - Use `mcp_github_pull_request_read` with method `get_review_comments`
   - Repository: Detect from git remote (see Context Understanding section)
   - Extract: all existing review comments, their file paths, line numbers, and resolution status
   - **CRITICAL**: Check each existing comment to see if the issue has been addressed in the current code changes

### Step 2: Check and Resolve Existing Comments

**BEFORE performing the new code review, you MUST:**

1. **Review all existing inline comments**:
   - For each existing review comment, check if the issue has been addressed:
     - Read the file at the comment's location in the current PR diff
     - Compare the current code with what the comment was addressing
     - Verify if the code change addresses the comment's concern:
       - If the comment was about a BUG: Check if the bug is fixed
       - If the comment was about SECURITY: Check if the security issue is resolved
       - If the comment was about ARCHITECTURE: Check if the architectural concern is addressed
       - If the comment was about TESTING: Check if tests have been added/improved
       - If the comment was about CODE QUALITY: Check if the code quality issue is fixed
     - Check if the suggested fix has been implemented (if a suggestion was provided)
     - Verify if the issue type (BUG, SECURITY, etc.) has been resolved

2. **Mark resolved comments**:
   - If a comment's issue has been fully addressed by the code changes:
     - **Reply to the comment** using `gh api` to acknowledge the fix:
       ```bash
       gh api --method POST \
         /repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies \
         -f body="✅ This issue has been resolved. The code now properly handles [the concern]."
       ```
       - Extract `COMMENT_ID` from the review comments data (numeric `id` field)
       - Replace `OWNER`, `REPO`, `PR_NUMBER`, and `COMMENT_ID` with actual values
       - **Important**: The PR number must be included in the path (`/pulls/PR_NUMBER/comments/...`)
     - **Note in your review summary** which comments have been resolved
     - Example: "✅ This issue has been resolved. The code now properly handles [the concern]."
   - If a comment's issue has been partially addressed:
     - Reply to the comment using `gh api` to acknowledge the progress:
       ```bash
       gh api --method POST \
         /repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies \
         -f body="👍 Good progress on this. However, [specific remaining issue] still needs attention."
       ```
     - Note what still needs to be addressed
   - If a comment's issue has not been addressed:
     - Reply to the comment using `gh api` to note it still needs attention:
       ```bash
       gh api --method POST \
         /repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies \
         -f body="⚠️ This issue still needs to be addressed: [specific concern]"
       ```
     - Reference the original comment in your new review

3. **Document resolution status**:
   - In your review summary, include a section listing:
     - Comments that have been resolved (with acknowledgment)
     - Comments that still need attention
     - Comments that have been partially addressed
   - Be specific about which comments were resolved and how

**Note**: To reply to existing inline comments and create proper threaded replies, use `gh api` with the endpoint `/repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies`. The GitHub MCP server doesn't have a direct function to reply to existing inline comments - it can only add new comments to pending reviews. Using `gh api` creates proper threaded replies that are clearly associated with the original comment.

### Step 3: Comprehensive Code Review

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
- ✅ Layout component updates maintain consistency between viewable and editable variants (see Layout Component Consistency section)

#### 8. Layout Component Consistency

**Critical for Layout Components**: When reviewing changes to layout components, verify that corresponding components are updated consistently:

- ✅ **Viewable ↔ Editable Component Pairing**: Layout components typically exist in two variants:
  - **Viewable components**: Display-only versions used in published sites (e.g., `LayoutViewable.tsx`)
  - **Editable components**: Interactive versions used in the builder (e.g., `LayoutEditable.tsx`)

- ✅ **Required Consistency Checks**:
  - If a viewable component is updated, check if the corresponding editable component needs similar updates
  - If an editable component is updated, check if the corresponding viewable component needs similar updates
  - Verify that both components handle the same data structure/props
  - Ensure visual consistency between viewable and editable modes (styling, layout, structure)
  - Check that any new fields/properties are supported in both variants
  - Verify that data transformations are consistent between both components

- ✅ **Common Patterns to Check**:
  - New fields added to one component should be reflected in the other
  - Styling changes should maintain visual parity between modes
  - Data validation/formatting should be consistent
  - Conditional rendering logic should be aligned
  - TypeScript types/interfaces should be shared or compatible

- ✅ **Example Scenarios**:
  - Adding a new text field to an editable layout → ensure viewable layout can display it
  - Changing column layout in viewable component → ensure editable component matches
  - Adding validation to editable component → ensure viewable component handles the data correctly
  - Updating styling/spacing → apply consistently to both variants

#### 9. Breaking Changes

- ✅ Check if changes break existing APIs
- ✅ Check if database schema changes need migrations
- ✅ Check if frontend changes break existing functionality
- ✅ Document breaking changes if any

### Step 4: Generate Review Comments

For each issue found, create a review comment with:

1. **File path and line number** (if applicable)
2. **Issue type**: `BUG`, `SECURITY`, `PERFORMANCE`, `ARCHITECTURE`, `STYLE`, `TESTING`, `DOCUMENTATION`, `SUGGESTION`
3. **Severity**: `BLOCKER`, `CRITICAL`, `MAJOR`, `MINOR`, `INFO`
4. **Description**: Clear explanation of the issue
5. **Suggestion**: Specific recommendation for improvement (with code examples if helpful)

### Step 5: Post Review Comments

Use GitHub MCP server to post review comments. The recommended approach is to create a pending review and add comments to it, then submit the review.

1. **Create a pending review with inline comments** (recommended for code review):
   - Use `mcp_github_pull_request_review_write` with method `create` (without `event` parameter to create a pending review)
   - Repository: Detect from git remote (see Context Understanding section)
   - Get the head commit SHA from PR data (`headRefOid`)
   - For each inline comment, use `mcp_github_add_comment_to_pending_review`:
     - **Note**: The `mcp_github_add_comment_to_pending_review` function adds comments to your pending review. Verify the current capabilities by checking the latest GitHub MCP server documentation.
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
- **MCP Functionality Note**: The `mcp_github_add_comment_to_pending_review` function adds comments to your pending review. Verify current MCP server capabilities by checking the latest GitHub MCP server documentation, as functionality may have been updated.

### Step 6: Create Review Summary

Post a comprehensive review summary that includes:

1. **Overall assessment**:
   - Summary of changes
   - Overall quality assessment
   - Approval status recommendation

2. **Existing comments resolution status**:
   - **Resolved comments**: List comments that have been addressed, acknowledging the fixes
   - **Unresolved comments**: List comments that still need attention, with references to original comments
   - **Partially resolved comments**: List comments with partial fixes, noting what still needs work

3. **Key findings**:
   - Critical issues (must fix)
   - Important issues (should fix)
   - Suggestions (nice to have)

4. **Positive feedback**:
   - What was done well
   - Good patterns followed
   - Acknowledgment of fixes to previous review comments

5. **Next steps**:
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
   - Use `mcp_github_pull_request_read` with method `get_review_comments` to get existing review comments
   - Repository: Detect from git remote (see Context Understanding section)

4. **Check and resolve existing comments**:
   - For each existing review comment:
     - Read the file at the comment's location in the current PR diff
     - Verify if the code change addresses the comment's concern
     - Check if the suggested fix has been implemented
   - If a comment's issue has been fully addressed:
     - Mark the comment thread as resolved (if MCP supports this)
     - Note the resolution in your review summary
   - If a comment's issue has not been addressed:
     - Note in your review that the issue still exists
     - Reference the original comment

5. **Analyze changes**:
   - Read the diff file
   - Identify changed files
   - For each file, check against review criteria
   - Identify issues and create review comments

6. **Post comments using GitHub MCP**:
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

7. **Provide feedback to user**:
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
10. **Layout component inconsistency**: When a layout component (viewable or editable) is updated, verify that its corresponding counterpart component is also updated appropriately:
   - Changes to viewable components may require updates to editable components
   - Changes to editable components may require updates to viewable components
   - Check for missing field support, styling inconsistencies, or data handling differences
   - Verify that both components handle the same data structure and props consistently

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

### Example 5: Layout Component Inconsistency

```markdown
**Issue Type**: ARCHITECTURE
**Severity**: MAJOR

**Issue**: The editable layout component was updated to support a new `subtitle` field, but the corresponding viewable layout component was not updated. This will cause the subtitle to not appear in published sites.

**Location**: `apps/builder/src/components/layouts/HeroLayoutEditable.tsx:67`

**Suggestion**: Update the corresponding viewable component to support the new field. Layout components must maintain consistency between their viewable and editable variants.

**Required changes**:

1. **Update the viewable component** (`HeroLayoutViewable.tsx`):
   - Add subtitle field to the component props/data structure
   - Add rendering logic for the subtitle
   - Apply consistent styling to match the editable version

2. **Verify data structure consistency**:
   - Ensure both components expect the same data shape
   - Update TypeScript interfaces if needed
   - Check that data transformations are aligned

3. **Test both variants**:
   - Verify subtitle appears correctly in builder (editable mode)
   - Verify subtitle appears correctly in published site (viewable mode)
   - Ensure styling and layout are consistent between both modes

**Example**:
\`\`\`tsx
// HeroLayoutViewable.tsx - Add subtitle support
interface HeroLayoutProps {
  title: string;
  subtitle?: string; // Add this field
  backgroundImage?: string;
}

export const HeroLayoutViewable: React.FC<HeroLayoutProps> = ({
  title,
  subtitle, // Add this prop
  backgroundImage
}) => {
  return (
    <div className="hero-layout">
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>} {/* Add this rendering */}
      {backgroundImage && <img src={backgroundImage} alt="" />}
    </div>
  );
};
\`\`\`

**Files to check**:
- `apps/builder/src/components/layouts/HeroLayoutViewable.tsx` (needs update)
- `apps/shared/src/types/layouts.ts` (verify type definitions)
\`\`\`
```

## GitHub MCP Functions to Use

Most GitHub operations should use these MCP functions:

- **Get PR details**: `mcp_github_pull_request_read` with method `get`
- **Get PR diff**: `mcp_github_pull_request_read` with method `get_diff`
- **Get PR files**: `mcp_github_pull_request_read` with method `get_files`
- **Get review comments**: `mcp_github_pull_request_read` with method `get_review_comments` (to check existing comments and their resolution status)
- **Get commit details**: `mcp_github_get_commit`
- **List PRs**: `mcp_github_list_pull_requests` (to find PR by branch)
- **Create pending review**: `mcp_github_pull_request_review_write` with method `create` (without `event`)
- **Add comment to pending review**: `mcp_github_add_comment_to_pending_review` (for adding new review comments)
- **Submit review**: `mcp_github_pull_request_review_write` with method `submit_pending`
- **Add general PR comment**: `mcp_github_add_issue_comment` (use PR number as issue number)

**For replying to existing inline review comments**:
- **Use `gh api`** (exception to MCP-only rule):
  ```bash
  gh api --method POST \
    /repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_ID/replies \
    -f body="Your reply text"
  ```
  - Extract `COMMENT_ID` from review comments data (numeric `id` field)
  - The PR number must be included in the path
  - This creates proper threaded replies to existing comments

**Note**: The GitHub MCP server doesn't have a direct function to reply to existing inline comments. Use `gh api` for threaded replies to existing comments, as it creates proper reply threads in GitHub.

## Notes

- Always be constructive and helpful in comments
- Provide specific, actionable feedback
- Reference repository patterns and examples
- Acknowledge good work when appropriate
- Focus on important issues first (blockers, critical, major)
- **Use GitHub MCP server for most GitHub operations** (reading PRs, creating reviews, adding new comments)
- **Exception**: Use `gh api` for replying to existing inline review comments (creates proper threaded replies)
- Repository: Always detect dynamically from git remote using: `git remote get-url origin | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1\/\2/'`
- Group related comments when possible to avoid spam
- Post a summary comment at the end with overall assessment
- **Test quality is critical**: Reject tests that exist only for coverage metrics. Every test must validate meaningful business logic, user flows, or edge cases. Ensure proper test pyramid: unit tests for isolated logic, integration tests for component interactions, and e2e tests for critical user journeys.
- **CRITICAL**: Always validate branch name first - never review PRs on default branch (main/master)
- **CRITICAL**: Never proceed if no PR exists for the branch - prompt user to create PR first
- **CRITICAL**: Always check existing review comments and mark them as resolved if the issues have been addressed by code changes

