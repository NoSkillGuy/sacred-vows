# Commit

When the user invokes `/commit`, analyze the staged changes and create a comprehensive Git commit message following Conventional Commits style and this repository's patterns and commit the changes.

## Context Understanding

1. **Check staged changes**: Use `git diff --cached` to see what's staged
2. **Analyze file changes**: Determine:
   - Which apps/modules are affected (api-go, builder, edge-worker, infra, docs, etc.)
   - Type of changes (feature, fix, docs, refactor, test, etc.)
   - Scope of changes (single file, multiple files, cross-cutting)
   - Breaking changes (if any)

## Commit Message Format

Follow Conventional Commits specification with this structure:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)

Choose the most appropriate type:

- `feat`: A new feature (user-facing functionality)
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.) that don't affect code meaning
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Changes to build system, dependencies, or tooling
- `ci`: Changes to CI/CD configuration
- `chore`: Other changes that don't modify src or test files (e.g., updating .gitignore)
- `revert`: Reverts a previous commit

### Scope (Optional but Recommended)

Use lowercase, hyphenated scope based on the affected area:

**API (apps/api-go):**
- `auth`: Authentication, authorization, JWT
- `invitations`: Invitation CRUD operations
- `assets`: Asset management, file uploads
- `layouts`: Layout management
- `rsvp`: RSVP functionality
- `analytics`: Analytics and tracking
- `publish`: Publishing and site deployment
- `handlers`: HTTP handlers
- `usecase`: Use case layer
- `repository`: Data access layer
- `config`: Configuration
- `middleware`: HTTP middleware
- `database`: Database-related changes

**Builder (apps/builder):**
- `components`: React components
- `layouts`: Layout system
- `services`: API services
- `hooks`: React hooks
- `store`: State management
- `styles`: CSS/styling
- `assets`: Asset management UI
- `auth`: Authentication UI
- `dashboard`: Dashboard components
- `preview`: Preview functionality
- `export`: Export functionality

**Edge Worker (apps/edge-worker):**
- `resolve`: Site resolution logic
- `routing`: Request routing

**Infrastructure:**
- `terraform`: Terraform configurations
- `docker`: Docker configurations
- `deploy`: Deployment scripts

**Cross-cutting:**
- `deps`: Dependencies
- `config`: Configuration files
- `docs`: Documentation
- `ci`: CI/CD

### Subject (Required)

- Use imperative, present tense: "add feature" not "added feature" or "adds feature"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 72 characters
- Be specific and descriptive
- Focus on what changed, not why (why goes in body)

**Good examples:**
- `feat(auth): add Google OAuth support`
- `fix(invitations): handle missing user ID in preview`
- `docs(api): add Swagger annotations to publish handlers`
- `refactor(assets): extract upload logic to service`

**Bad examples:**
- `fix: bug fix` (too vague)
- `update stuff` (no type, too vague)
- `Added new feature for invitations` (past tense, no type)
- `fix(invitations): Fixed the bug where invitations weren't loading properly when the user wasn't authenticated and the invitation was public` (too long)

### Body (Optional but Recommended)

- Separate from subject with blank line
- Use imperative, present tense
- Explain the **what** and **why** of the change, not the **how**
- Wrap at 72 characters
- Can include multiple paragraphs
- Use bullet points for multiple changes

**Good body examples:**
```
feat(auth): add refresh token rotation

Implement refresh token rotation for improved security.
Tokens are now rotated on each refresh, invalidating
the previous refresh token.

- Generate new refresh token on each refresh
- Store refresh token in HttpOnly cookie
- Add token rotation validation
```

```
fix(invitations): handle optional auth in preview endpoint

The preview endpoint was failing when called without
authentication. Now properly handles both authenticated
and anonymous requests.

Fixes issue where public invitations couldn't be
previewed without login.
```

### Footer (Optional)

Use for:
- **Breaking changes**: `BREAKING CHANGE: <description>`
- **Issue references**: `Fixes #123`, `Closes #456`, `Refs #789`
- **Co-authors**: `Co-authored-by: Name <email>`

**Breaking change example:**
```
feat(api): change invitation response format

BREAKING CHANGE: The invitation response now returns
`data` nested object instead of flat structure.
Migration guide: update clients to access `response.data`
instead of `response` directly.
```

## Repository-Specific Patterns

### Monorepo Structure

This is a monorepo with multiple apps. When changes span multiple apps, use appropriate scope:

- Single app: `feat(builder): add new layout component`
- Multiple apps: `feat: add analytics tracking` (no scope, or use `shared`)
- Infrastructure: `chore(infra): update terraform config`

### Common Scenarios

#### API Handler Changes
```
feat(handlers): add invitation preview endpoint

Add GET /api/invitations/:id/preview endpoint that
returns public preview without authentication.
```

#### Component Changes
```
feat(components): add asset upload progress indicator

Show upload progress with percentage and cancel option.
Improves UX during large file uploads.
```

#### Documentation
```
docs(api): add Swagger annotations to publish handlers

- Add complete annotations to Resolve method
- Enhance publish_handler.go with @Description fields
- Document all parameters and responses
```

#### Bug Fixes
```
fix(auth): handle expired refresh tokens gracefully

Previously, expired refresh tokens caused 500 errors.
Now returns 401 with clear error message.
```

#### Refactoring
```
refactor(usecase): extract invitation validation logic

Move validation from handler to use case layer for
better separation of concerns and testability.
```

## Implementation Steps

1. **Check git status**: Verify what's staged
2. **Analyze changes**: 
   - Read diff of staged files
   - Identify affected modules/apps
   - Determine change type
   - Check for breaking changes
3. **Generate commit message**:
   - Choose appropriate type
   - Determine scope (if applicable)
   - Write concise subject (max 72 chars)
   - Add detailed body explaining what and why
   - Include footer if needed (breaking changes, issues)
4. **Review and commit**:
   - Show the commit message to user
   - Execute `git commit -m "<subject>" -m "<body>"` (or use `-F` for multi-line)
   - If user approves, proceed with commit

## Examples

### Simple Feature
```
feat(builder): add dark mode toggle

Add theme switcher in settings that allows users to
toggle between light and dark modes. Persists preference
in localStorage.
```

### Bug Fix
```
fix(api): handle null invitation data in preview

The preview endpoint was crashing when invitation data
was null. Now returns 404 with proper error message.

Fixes #234
```

### Documentation
```
docs: update deployment guide with Cloudflare setup

Add comprehensive instructions for deploying to
Cloudflare Pages, including R2 bucket configuration
and edge worker setup.
```

### Refactoring
```
refactor(handlers): extract error handling to middleware

Move common error handling logic from individual
handlers to centralized error middleware. Improves
consistency and reduces code duplication.
```

### Breaking Change
```
feat(api): change asset upload response format

BREAKING CHANGE: Asset upload now returns object with
`url` and `id` fields instead of just URL string.

Migration: Update clients to access `response.url`
instead of using response directly as URL.
```

### Multi-App Change
```
feat: add analytics tracking across apps

- Add tracking service in builder
- Add analytics endpoint in API
- Track invitation views and RSVP submissions

Implements #567
```

## Notes

- Always use present tense, imperative mood
- Be specific about what changed
- Explain why when it's not obvious
- Keep subject line under 72 characters
- Use body for detailed explanation
- Reference issues when applicable
- Mark breaking changes clearly
- Consider the reviewer's perspective - what do they need to know?
