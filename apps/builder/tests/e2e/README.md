# E2E Test Infrastructure

This directory contains end-to-end tests for the wedding invitation builder application. The tests run against a fully isolated test environment with separate database and storage.

## Architecture

The E2E test infrastructure provides complete isolation from development data:

- **Test Database**: Separate Firestore database (`test` database)
- **Test Storage**: Separate MinIO buckets for assets and published sites
- **Test Configuration**: Dedicated `test.yaml` config file for backend
- **Automatic Setup/Cleanup**: Database and storage cleanup between test runs

```
┌─────────────────────────────────────────────────────────┐
│                    E2E Test Run                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐              │
│  │  Frontend    │         │   Backend    │              │
│  │  (Vite)      │────────▶│  (Go API)    │              │
│  │  Port 5173   │         │  Port 3100   │              │
│  └──────────────┘         └──────────────┘              │
│                                                          │
│         │                        │                       │
│         ▼                        ▼                       │
│  ┌──────────────────────────────────────────┐           │
│  │     Test Infrastructure                  │           │
│  ├──────────────────────────────────────────┤           │
│  │  • Firestore Emulator (port 8080)        │           │
│  │    - Database: "test"                    │           │
│  │  • MinIO (port 9000)                     │           │
│  │    - Bucket: sacred-vows-assets-test     │           │
│  │    - Bucket: sacred-vows-published-test  │           │
│  │    - Bucket: sacred-vows-public-assets-test│        │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

Before running E2E tests, ensure the following infrastructure is running:

### 1. Firestore Emulator

The Firestore emulator must be running and accessible:

```bash
# Using docker-compose (recommended)
docker-compose up -d firestore-emulator

# Or standalone
gcloud beta emulators firestore start --host-port=localhost:8080
```

**Verification**: The emulator should be accessible at `http://localhost:8080` (or `http://localhost:4000` for the UI).

### 2. MinIO

MinIO must be running and accessible:

```bash
# Using docker-compose (recommended)
docker-compose up -d minio

# Or standalone
minio server /data --console-address ":9001"
```

**Verification**: MinIO should be accessible at `http://localhost:9000` (API) and `http://localhost:9001` (Console).

### 3. Go Backend Dependencies

The backend server requires Go and dependencies:

```bash
cd apps/api-go
go mod download
```

## Running Tests

### Quick Start

```bash
# Ensure infrastructure is running
docker-compose up -d firestore-emulator minio

# Run all E2E tests
npm run test:e2e
```

### Available Commands

- **`npm run test:e2e`** - Run all E2E tests (headless)
- **`npm run test:e2e:ui`** - Run tests with Playwright UI
- **`npm run test:e2e:debug`** - Run tests in debug mode
- **`npm run test:e2e:setup`** - Show setup instructions

### Running Specific Tests

```bash
# Run a specific test file
npm run test:e2e tests/e2e/auth-flow.spec.ts

# Run tests matching a pattern
npm run test:e2e -- -g "auth"
```

## Test Infrastructure Details

### Test Database

- **Database Name**: `test` (isolated from `(default)` database)
- **Location**: Firestore emulator at `localhost:8080`
- **Migrations**: Run automatically when backend starts
- **Cleanup**: Test user is deleted after tests (unless `PRESERVE_TEST_DATA=true`)

### Test Storage Buckets

Three separate MinIO buckets for complete isolation:

1. **`sacred-vows-assets-test`** - User-uploaded assets
2. **`sacred-vows-published-test`** - Published sites
3. **`sacred-vows-public-assets-test`** - Public/default assets

Buckets are automatically created if they don't exist and cleared after tests.

### Test Configuration

The backend uses `apps/api-go/config/test.yaml` with:
- Port `3100` (to avoid conflicts with dev server on `3000` and Grafana on `3001`)
- Test-specific buckets and endpoints
- Test-only endpoints enabled (`ENABLE_TEST_ENDPOINTS=true`)

### Test User

A test user is automatically created during setup:
- **Email**: `test@example.com`
- **Password**: `password123`
- **Name**: `Test User`

This user is deleted after tests complete (unless `PRESERVE_TEST_DATA=true`).

## Test Lifecycle

### Global Setup (`global-setup.ts`)

1. Verify Firestore emulator is running
2. Verify MinIO is accessible
3. Initialize test buckets (create if they don't exist)
4. Wait for backend server to be ready (with migrations)
5. Wait for frontend server to be ready
6. Create test user

### Test Execution

Tests run against the isolated test environment:
- Frontend at `http://localhost:5173` (configured with `VITE_API_URL=http://localhost:3100/api`)
- Backend at `http://localhost:3100`
- Test database and storage buckets

### Global Teardown (`global-teardown.ts`)

1. Delete test user (if `PRESERVE_TEST_DATA` is not set)
2. Clear all test storage buckets
3. Log cleanup results

**Note**: The Firestore database is not fully cleared (collections remain). To reset the test database completely, restart the Firestore emulator with a fresh volume:

```bash
docker-compose down -v firestore-emulator
docker-compose up -d firestore-emulator
```

## Debugging

### Preserve Test Data

To preserve test data for debugging, set the `PRESERVE_TEST_DATA` environment variable:

```bash
PRESERVE_TEST_DATA=true npm run test:e2e
```

This will skip cleanup and leave test data in the database and storage.

### View Test Data

**Firestore Emulator UI**: http://localhost:4000
- Browse collections and documents
- View test data created during tests

**MinIO Console**: http://localhost:9001
- Login: `minioadmin` / `minioadmin`
- Browse test buckets and objects

### Debug Failed Tests

1. **Run with UI**: `npm run test:e2e:ui` - Visual test runner with step-by-step execution
2. **Run in debug mode**: `npm run test:e2e:debug` - Step through tests with browser
3. **Check logs**: Both servers log to console during test execution
4. **Preserve data**: Use `PRESERVE_TEST_DATA=true` to inspect test state after failures

### Common Issues

**Backend server doesn't start**
- Check that Go dependencies are installed: `cd apps/api-go && go mod download`
- Verify Firestore emulator is running: `curl http://localhost:8080`
- Check backend logs for configuration errors

**Frontend server doesn't start**
- Verify Node.js dependencies: `npm install`
- Check for port conflicts (5173 should be available)

**Tests fail with "connection refused"**
- Ensure Firestore emulator is running: `docker-compose ps firestore-emulator`
- Ensure MinIO is running: `docker-compose ps minio`
- Check that servers have enough time to start (increase timeout if needed)

**Test data persists between runs**
- This is expected if `PRESERVE_TEST_DATA=true` was used
- Clear manually via Firestore UI or MinIO Console
- Or restart emulators: `docker-compose restart firestore-emulator minio`

## CI/CD Integration

The test infrastructure is designed to work in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Start test infrastructure
  run: |
    docker-compose up -d firestore-emulator minio
    # Wait for services to be ready
    sleep 10

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
    # CI=true ensures servers are not reused
```

**CI Considerations**:
- Set `CI=true` to prevent server reuse
- Ensure Firestore emulator and MinIO are started before tests
- Tests will automatically initialize buckets and wait for servers

## Test Files

- **`auth-flow.spec.ts`** - Authentication flows (register, login, logout, password reset)
- **`create-website.spec.ts`** - Website creation and layout selection
- **`global-setup.ts`** - Test environment initialization
- **`global-teardown.ts`** - Test environment cleanup
- **`test-env-setup.ts`** - Test infrastructure helper utilities

## Best Practices

1. **Isolation**: Each test should be independent and not rely on data from other tests
2. **Cleanup**: Use `beforeEach` to clear browser state (cookies, localStorage)
3. **Wait for Elements**: Always wait for elements to be visible before interacting
4. **Error Handling**: Tests should fail fast with clear error messages
5. **Test Data**: Use unique identifiers (e.g., `Date.now()`) to avoid conflicts

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Testing Strategy](../../../docs/development/testing-strategy.md)
- [Local Development Setup](../../../docs/getting-started/local-development.md)

