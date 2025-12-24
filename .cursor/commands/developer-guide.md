# Developer Guide

When the user invokes `/developer-guide`, provide comprehensive guidance on how to work with this repository following its best practices, architecture patterns, and development workflows.

## Context Understanding

1. **Identify the user's need**: Determine what aspect of development they need help with:
   - Starting a new feature
   - Fixing a bug
   - Debugging an issue
   - Understanding architecture
   - Setting up development environment
   - Writing tests
   - Code organization

2. **Check current context**: Look at:
   - Open files (to understand what they're working on)
   - Recent changes (git status/diff)
   - Error messages (if debugging)
   - Test failures (if testing)

## Guide Structure

Provide guidance following this repository's documented best practices:

### 1. Architecture Overview

**Backend (Go - Clean Architecture)**
- **Domain Layer** (`internal/domain/`): Pure business entities, no dependencies
- **Use Case Layer** (`internal/usecase/`): Application business logic
- **Interface Adapters** (`internal/interfaces/`): HTTP handlers, repository interfaces
- **Infrastructure Layer** (`internal/infrastructure/`): Database, auth, storage implementations

**Key Rule**: Dependencies point inward. Domain has no dependencies.

**Frontend (React/Vite)**
- Feature-based component organization
- Zustand for global state
- React Query for server state
- Services layer for API communication

### 2. Feature Development Pipeline

When helping with feature development, guide through these steps:

#### Step 1: Understand Requirements
- Read issue/requirement carefully
- Identify affected components (frontend, backend, or both)
- Check existing similar features for patterns

#### Step 2: Design the Solution

**For Backend:**
1. Identify domain entities involved
2. Design use case(s) needed
3. Define repository interfaces
4. Plan API endpoints
5. Consider error cases

**For Frontend:**
1. Identify components needed
2. Design state management approach
3. Plan API integration
4. Consider user experience

#### Step 3: Implementation Order

**Backend (Clean Architecture order):**
1. **Domain Layer** - Define entities and validation
2. **Repository Interface** - Define interface in `internal/interfaces/repository/`
3. **Use Case** - Implement business logic in `internal/usecase/`
4. **Repository Implementation** - Implement in `internal/infrastructure/database/firestore/`
5. **HTTP Handler** - Create handler in `internal/interfaces/http/handlers/`
6. **Register Routes** - Add route in `internal/interfaces/http/router.go`

**Frontend:**
1. **Service Layer** - Add API service in `src/services/`
2. **Store (if needed)** - Add Zustand store in `src/store/`
3. **Components** - Create components in `src/components/`
4. **Routes** - Add route if new page

#### Step 4: Write Tests (Iterative)

**Critical Rule**: Write ONE test, run it, verify it passes, then write the next.

**Backend Testing:**
- Use table-driven tests
- Mock interfaces, not concrete structs
- Prefer hand-written mocks for core logic
- Test behavior, not interactions
- Inject dependencies (clock, HTTP client)

**Frontend Testing:**
- Use React Testing Library
- Mock at network level with MSW
- Test user interactions with user-event
- Test behavior, not implementation

**Testing Workflow:**
1. Write ONE test case
2. Run: `npm test` (frontend) or `make test` (backend)
3. Verify test passes
4. Only then write the next test

#### Step 5: Update Documentation
- **API**: Add Swagger annotations (use `/add-swagger-annotations` command)
- **Frontend**: Update component documentation if needed
- Run `make swagger` to regenerate Swagger docs

#### Step 6: Manual Testing
- Start services: `docker-compose up -d`
- Start dev servers: `make dev` (API), `npm run dev` (Builder)
- Test in browser/Postman
- Check observability in Grafana (http://localhost:3001)

### 3. Bug Fixing Pipeline

When helping with bug fixes, guide through these steps:

#### Step 1: Reproduce the Bug
**Critical**: Never fix a bug you can't reproduce.

1. Understand the bug report
2. Reproduce locally
3. Document reproduction steps

#### Step 2: Identify Root Cause

**Debugging Tools:**

**Backend:**
- Check logs: `docker-compose logs api-go`
- Use observability: http://localhost:3001 (Grafana)
- Add strategic logging with structured logger

**Frontend:**
- Browser DevTools (Console, Network, React DevTools)
- Check Network tab for API errors
- Use React DevTools for state inspection

**Common Approaches:**
1. Check logs first
2. Use observability stack (Grafana/Tempo)
3. Add temporary logging
4. Use breakpoints if needed

#### Step 3: Write a Failing Test
Before fixing, write a test that reproduces the bug. After fix, it should pass.

#### Step 4: Implement Fix
- Make minimal change to fix the bug
- Follow existing patterns
- Don't refactor unless necessary (separate PR)

#### Step 5: Verify Fix
1. Run the failing test - should now pass
2. Reproduce original bug - should be fixed
3. Check for regressions - run full test suite
4. Test edge cases related to the bug

### 4. Debugging Workflows

#### Backend Debugging

1. **Check Service Health**
   ```bash
   docker-compose ps
   curl http://localhost:3000/health
   ```

2. **View Logs**
   ```bash
   docker-compose logs -f api-go
   ```

3. **Use Observability Stack**
   - Grafana: http://localhost:3001 (admin/admin)
   - Navigate to Explore → Tempo
   - Search traces by service or request ID

4. **Debug with Logging**
   ```go
   logger.Info("operation started",
       zap.String("userId", userID),
       zap.Any("input", input),
   )
   ```

5. **Test API Endpoints**
   - Swagger UI: http://localhost:3000/swagger/index.html
   - Or use curl/Postman

6. **Debug Database Issues**
   - Firestore Emulator UI: http://localhost:4000
   - Check collections and documents

#### Frontend Debugging

1. **Browser DevTools**
   - Console tab for errors
   - Network tab for API requests
   - React DevTools for component state
   - Application tab for localStorage

2. **Debug API Integration**
   - Add logging in services
   - Check Network tab for request/response
   - Verify request format matches API

3. **Debug State Management**
   - Use React DevTools
   - Add Zustand store subscriptions in dev mode

4. **Use MSW for Local Testing**
   - Modify handlers in `src/tests/mocks/handlers.ts`
   - Test error scenarios

5. **Debug Tests**
   ```bash
   npm test -- --watch
   npm run test:ui
   ```

### 5. Testing Best Practices

**Testing Pyramid:**
- Many Unit tests (logic, stores, utils)
- Some Integration tests (routes + state + API)
- Few E2E tests (critical flows only)

**Backend Testing Principles:**
- Mock interfaces, never concrete structs
- Prefer hand-written mocks for core logic
- Test behavior, not interactions
- Use table-driven tests
- Inject dependencies

**Frontend Testing Principles:**
- Test behavior, not implementation
- Use React Testing Library queries (getByRole, getByLabelText)
- Mock at network level with MSW
- Test user interactions with user-event

**Testing Workflow:**
- Write ONE test, run it, verify it passes, then write the next
- Never write multiple tests without running them
- Never proceed if current test fails

### 6. Code Organization

**Backend Structure:**
```
apps/api-go/
├── cmd/server/          # Application entry point
├── internal/
│   ├── domain/          # Business entities (no dependencies)
│   ├── usecase/         # Application business logic
│   ├── interfaces/      # HTTP handlers, repository interfaces
│   └── infrastructure/    # Database, auth, storage implementations
├── pkg/                 # Shared packages
└── config/              # Configuration files
```

**Frontend Structure:**
```
apps/builder/src/
├── components/          # React components (feature-based)
├── services/            # API service layer
├── store/               # Zustand stores
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── tests/               # Test utilities and mocks
```

### 7. Environment Management

**Environment Files:**
- **API**: `.env.local` (host) or `.env.docker` (Docker)
- **Builder**: `.env.local` or `.env.docker`
- Use `./scripts/select-env.sh local` or `./scripts/select-env.sh docker` for API

**Configuration:**
- Sensitive data → Environment variables
- Non-sensitive settings → YAML config files

### 8. Common Commands

```bash
# Start services
docker-compose up -d

# Start API with hot reload
cd apps/api-go && make dev

# Start Builder
cd apps/builder && npm run dev

# Run tests
cd apps/builder && npm test
cd apps/api-go && make test

# View logs
docker-compose logs -f api-go

# Generate Swagger docs
cd apps/api-go && make swagger
```

### 9. Important URLs (Local Development)

- **Builder App**: http://localhost:5173
- **API Server**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/swagger/index.html
- **Grafana**: http://localhost:3001 (admin/admin)
- **Firestore UI**: http://localhost:4000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Prometheus**: http://localhost:9090
- **Tempo**: http://localhost:3200

## Implementation Approach

When the user invokes `/developer-guide`:

1. **Assess Context**: 
   - Check what files are open
   - Check git status for recent changes
   - Look for error messages or test failures
   - Ask clarifying questions if needed

2. **Provide Targeted Guidance**:
   - If working on a feature → Guide through feature development pipeline
   - If fixing a bug → Guide through bug fixing pipeline
   - If debugging → Guide through debugging workflows
   - If setting up → Guide through initial setup
   - If writing tests → Guide through testing best practices

3. **Reference Documentation**:
   - Point to relevant docs in `docs/` directory
   - Reference existing code examples
   - Follow repository patterns

4. **Be Specific**:
   - Provide concrete examples from the codebase
   - Show exact file paths and patterns
   - Reference actual code when possible

5. **Emphasize Best Practices**:
   - Clean Architecture principles (backend)
   - Testing pyramid approach
   - One test at a time workflow
   - Observability for debugging
   - Environment-based configuration

## Examples

### Example 1: Starting a New Feature

**User**: "I need to add a new endpoint to delete assets"

**Response should include**:
1. Backend implementation order (Domain → Interface → Use Case → Repository → Handler → Route)
2. Reference existing asset handlers for patterns
3. Testing approach (write one test at a time)
4. Swagger annotation reminder
5. Manual testing steps

### Example 2: Debugging an Issue

**User**: "The API returns 500 when I try to create an invitation"

**Response should include**:
1. Check logs: `docker-compose logs api-go | grep ERROR`
2. Use Grafana to view traces
3. Add strategic logging in the handler
4. Check Firestore connection
5. Verify request format
6. Write a failing test to reproduce

### Example 3: Writing Tests

**User**: "How do I test this use case?"

**Response should include**:
1. Table-driven test pattern
2. Mock interface (not concrete struct)
3. Hand-written mock example
4. Test behavior, not interactions
5. One test at a time workflow
6. Reference similar test files

## Key Principles to Emphasize

1. **Clean Architecture**: Dependencies point inward, domain has no dependencies
2. **Testing**: Write one test at a time, test behavior not implementation
3. **Debugging**: Use observability stack, check logs, add strategic logging
4. **Code Quality**: Follow existing patterns, write self-documenting code
5. **Documentation**: Update Swagger annotations, document changes

## Related Commands

- `/commit` - Create conventional commit message
- `/add-swagger-annotations` - Add Swagger annotations to handlers

## Notes

- Always reference actual code patterns from the repository
- Provide concrete examples, not just theory
- Emphasize the "one test at a time" workflow
- Remind about observability tools for debugging
- Point to relevant documentation files when helpful

