# Testing Strategy

This document outlines the testing strategy for the wedding invitation builder application, following the testing pyramid approach: many unit tests, some integration tests, and few E2E tests.

## Overview

Our testing strategy is aligned with the React + Vite + Router + Zustand + vanilla CSS stack. We focus on testing behavior, not implementation, and prioritize confidence over coverage percentages.

## Testing Pyramid

```
        /\
       /  \     Few E2E tests (critical flows)
      /____\
     /      \   Some Integration tests (routes + state + API)
    /________\
   /          \  Many Unit tests (logic, stores, utils)
  /____________\
```

### Layer Breakdown

1. **Unit Tests** (Fast, cheap, high ROI)
   - Zustand stores (business logic)
   - Utility functions
   - Password logic (zxcvbn integration)
   - Template engine helpers
   - Any non-UI logic

2. **Integration Tests** (Most valuable layer)
   - Pages (not tiny components)
   - Routing behavior
   - Zustand + component interaction
   - API success & error states
   - Form validation & submission

3. **E2E Tests** (Few but powerful)
   - Create website flow
   - Customize template
   - Save & preview
   - Publish site
   - Auth flow

## Testing Stack

### Unit & Integration Tests
- **Vitest** - Fast unit/integration test runner (Vite-native, zero config)
- **React Testing Library** - Component testing with user-centric queries
- **MSW (Mock Service Worker)** - Network-level API mocking
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interaction simulation

### E2E Tests
- **Playwright** - Fast, reliable E2E testing with multiple browser support

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests once (CI mode)
npm test -- --run
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run specific test file
npm run test:e2e tests/e2e/auth-flow.spec.ts
```

## Test Structure

```
apps/builder/
├── src/
│   ├── store/
│   │   └── builderStore.test.ts          # Unit tests
│   ├── utils/
│   │   ├── assetUtils.test.ts
│   │   ├── jwtDecoder.test.ts
│   │   └── translations.test.ts
│   ├── components/
│   │   ├── Auth/
│   │   │   └── SignupPage.test.tsx       # Integration tests
│   │   ├── Dashboard/
│   │   │   └── Dashboard.test.tsx
│   │   └── Landing/
│   │       └── __tests__/
│   │           └── LandingPage.integration.test.tsx
│   └── tests/
│       ├── mocks/
│       │   ├── handlers.ts               # MSW handlers
│       │   └── server.ts                 # MSW server setup
│       └── setup.ts                      # Test setup/teardown
└── tests/
    └── e2e/
        ├── auth-flow.spec.ts
        ├── create-website.spec.ts
        ├── customize-template.spec.ts
        └── publish-flow.spec.ts
```

## Unit Tests

### What to Test

**Zustand Stores** (`src/store/builderStore.test.ts`)
- State initialization from localStorage
- Data updates with nested paths
- Section management (toggle, enable, disable, reorder)
- Theme management (presets, colors, fonts)
- Layout switching with data preservation
- Autosave triggering

**Utility Functions** (`src/utils/`)
- JWT decoding and expiration checks
- Asset URL extraction from data structures
- Translation logic
- Any pure functions with clear inputs/outputs

**Password Logic**
- zxcvbn integration
- Strength calculation (weak/medium/strong)
- Validation rules

### Example: Store Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from './builderStore';

describe('builderStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useBuilderStore.getState().resetToDefault();
  });

  it('should update nested data using dot notation path', () => {
    const store = useBuilderStore.getState();
    
    store.updateInvitationData('couple.bride.name', 'Emma');

    expect(store.currentInvitation.data.couple.bride.name).toBe('Emma');
  });
});
```

### Example: Utility Test

```typescript
import { describe, it, expect } from 'vitest';
import { extractAssetURLs } from './assetUtils';

describe('assetUtils', () => {
  it('should extract asset URLs from nested objects', () => {
    const data = {
      couple: {
        bride: { image: '/uploads/bride.jpg' },
        groom: { image: '/uploads/groom.jpg' },
      },
    };

    const urls = extractAssetURLs(data);

    expect(urls).toHaveLength(2);
    expect(urls).toContain('/uploads/bride.jpg');
  });
});
```

## Integration Tests

### What to Test

**Pages** (not tiny components)
- Form submission flows
- API integration with MSW
- Error handling
- Navigation/routing
- State management integration

**Component + Store Integration**
- Pages that interact with Zustand stores
- Routing with MemoryRouter
- API success/error states

### Example: Page Integration Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SignupPage from './SignupPage';

describe('SignupPage', () => {
  it('should show password strength as user types', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'StrongP@ssw0rd123!');
    await user.click(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/strong password/i)).toBeInTheDocument();
    });
  });
});
```

## E2E Tests

### What to Test (Critical Flows Only)

**Auth Flow** (`tests/e2e/auth-flow.spec.ts`)
- User registration
- User login
- Password reset flow
- Logout

**Create Website Flow** (`tests/e2e/create-website.spec.ts`)
- Navigate to dashboard
- Create new invitation
- Select layout

**Customize Template** (`tests/e2e/customize-template.spec.ts`)
- Edit invitation data
- Change theme
- Toggle sections
- Preview changes

**Publish Flow** (`tests/e2e/publish-flow.spec.ts`)
- Save invitation
- Publish site
- Verify published site loads
- Test export/download

### Example: E2E Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'SecurePassword123!');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*app|.*dashboard/);
  });
});
```

## MSW (Mock Service Worker)

MSW mocks APIs at the network level, preventing fake fetch mocks that lie. It works in both tests and dev.

### Setup

MSW handlers are defined in `src/tests/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      accessToken: 'mock-token',
      user: { id: '1', email: body.email },
    });
  }),
  // ... more handlers
];
```

### Usage in Tests

MSW is automatically set up in `src/tests/setup.ts`. No additional configuration needed in individual tests.

## Coverage Expectations

Coverage is a signal, not a goal. We focus on confidence over percentages.

| Layer | Coverage Target |
|-------|----------------|
| Utils / Stores | 80-90% |
| Pages | 60-70% |
| UI Components | Selective (no strict threshold) |
| E2E | Critical flows only |

## Testing Principles

### ✅ DO

- **Test behavior, not implementation** - Use React Testing Library queries
- **Mock at network level** - Use MSW, not fetch mocks
- **Start small** - Begin with store tests, then expand
- **E2E for money flows** - Focus on critical user journeys
- **Test what users see** - Query by accessible labels, not CSS classes
- **Use user-event** - Simulate real user interactions

### ❌ DON'T

- **Snapshot tests for UI-heavy pages** - They add noise, not confidence
- **Test CSS classes** - Implementation detail
- **Test third-party libraries** - Trust they work
- **Test React internals** - Test behavior instead
- **Chase 100% coverage** - Focus on confidence

## Best Practices

### 1. Test Organization

- Group related tests in `describe` blocks
- Use descriptive test names that explain what is being tested
- Keep tests focused on one behavior

### 2. Test Data

- Use realistic test data
- Create test fixtures for complex data structures
- Clean up test data in `beforeEach`/`afterEach`

### 3. Async Testing

- Always use `waitFor` for async operations
- Use `userEvent` instead of `fireEvent` for better simulation
- Handle loading states appropriately

### 4. Mocking

- Mock at the network level with MSW
- Mock external dependencies, not internal modules
- Keep mocks simple and focused

### 5. E2E Tests

- Keep E2E tests focused on critical flows
- Use data-testid sparingly (prefer accessible queries)
- Test happy paths and critical error scenarios
- Keep tests independent and isolated

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm test builderStore.test.ts

# Run tests matching pattern
npm test -- -t "should update"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/vitest
```

### Playwright

```bash
# Run with UI for debugging
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e -- --headed

# Debug specific test
npm run test:e2e:debug tests/e2e/auth-flow.spec.ts
```

## CI Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit/integration tests
        run: npm test -- --run
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
```

## Troubleshooting

### Tests failing with MSW

- Ensure MSW handlers match actual API endpoints
- Check that handlers return correct response format
- Verify MSW server is started in `setup.ts`

### E2E tests timing out

- Increase timeout in Playwright config if needed
- Check that dev server is running
- Verify selectors are correct

### Coverage not generating

- Ensure `@vitest/coverage-v8` is installed
- Check `vitest.config.ts` has coverage configuration
- Run `npm run test:coverage` explicitly

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Getting Started

1. **Run existing tests** to verify setup:
   ```bash
   npm test
   ```

2. **Write your first test** - Start with a utility function or store method

3. **Add integration tests** - Test a page that uses the store

4. **Add E2E tests** - Test critical user flows

Remember: Start small, expand gradually, and focus on confidence over coverage.

