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
│   │   └── builderStore.test.ts          # Unit tests - Store logic
│   ├── utils/
│   │   ├── assetUtils.test.ts            # Unit tests - Asset utilities
│   │   ├── jwtDecoder.test.ts            # Unit tests - JWT utilities
│   │   └── translations.test.ts          # Unit tests - Translation data
│   ├── services/
│   │   ├── authService.test.ts           # Unit tests - Auth service
│   │   ├── invitationService.test.ts      # Unit tests - Invitation service
│   │   ├── assetService.test.ts          # Unit tests - Asset service
│   │   ├── layoutService.test.ts         # Unit tests - Layout service
│   │   └── fontService.test.ts           # Unit tests - Font service
│   ├── hooks/
│   │   ├── useLanguage.test.ts           # Unit tests - Language hook
│   │   └── queries/
│   │       ├── useInvitations.test.ts    # Unit tests - Invitation hooks
│   │       └── useLayouts.test.ts        # Unit tests - Layout hooks
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── SignupPage.test.tsx       # Integration tests
│   │   │   └── LoginPage.test.tsx        # Integration tests
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.test.tsx        # Integration tests
│   │   │   └── dashboardStats.test.ts   # Unit tests - Stats calculation
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

**Service Layer** (`src/services/`)
- **authService.test.ts** - Authentication operations
  - User registration with token storage
  - User login and logout
  - Token refresh flow
  - Password reset requests
  - Current user retrieval
- **invitationService.test.ts** - Invitation CRUD operations
  - Fetching all invitations
  - Fetching single invitation
  - Creating new invitations
  - Updating invitations
  - Deleting invitations
  - Autosave with debouncing
- **assetService.test.ts** - Asset management
  - Image upload validation (file size, type)
  - Multiple image uploads
  - Asset deletion
  - Fetching all assets
  - Asset count by URLs
- **layoutService.test.ts** - Layout operations
  - Fetching layouts with filters (category, featured)
  - Fetching single layout
  - Fetching layout manifests
  - Getting all layout manifests
- **fontService.test.ts** - Font management
  - Getting all available fonts
  - Font type and style information
  - Google and premium font handling

**Utility Functions** (`src/utils/`)
- JWT decoding and expiration checks (`jwtDecoder.test.ts`)
- Asset URL extraction from data structures (`assetUtils.test.ts`)
- Translation data structure validation (`translations.test.ts`)
- Any pure functions with clear inputs/outputs

**Custom Hooks** (`src/hooks/`)
- **useLanguage.test.ts** - Language switching
  - Language initialization from localStorage
  - Language updates and persistence
  - Translation retrieval
  - Document language attribute updates
- **useInvitations.test.ts** - Invitation query hooks
  - Fetching all invitations
  - Fetching single invitation
  - Query enable/disable behavior
- **useLayouts.test.ts** - Layout query hooks
  - Fetching layouts with options
  - Fetching all layout manifests
  - Fetching single layout and manifest

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

### Example: Service Test

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getInvitations } from './invitationService';

// Mock apiClient
vi.mock('./apiClient', () => ({
  apiRequest: vi.fn(),
}));

describe('invitationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all invitations successfully', async () => {
    const { apiRequest } = await import('./apiClient');
    const mockInvitations = [
      {
        id: 'inv-1',
        userId: '1',
        layoutId: 'classic-scroll',
        data: { couple: { bride: { name: 'Sarah' } } },
      },
    ];

    vi.mocked(apiRequest).mockResolvedValue({
      ok: true,
      json: async () => ({ invitations: mockInvitations }),
    } as Response);

    const result = await getInvitations();

    expect(result).toEqual(mockInvitations);
    expect(apiRequest).toHaveBeenCalledWith('/invitations', { method: 'GET' });
  });
});
```

### Example: Hook Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLanguage } from './useLanguage';

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('should update language when updateLanguage is called', () => {
    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.updateLanguage('te');
    });

    expect(result.current.currentLang).toBe('te');
    expect(localStorage.getItem('wedding-lang')).toBe('te');
    expect(document.documentElement.lang).toBe('te');
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

**Auth Pages** (`src/components/Auth/`)
- **SignupPage.test.tsx** - User registration flow
  - Form rendering with all fields
  - Password strength validation
  - Form validation and submission
  - API error handling
  - Navigation links
- **LoginPage.test.tsx** - User login flow
  - Form rendering
  - Successful login with navigation
  - Invalid credentials error handling
  - Loading states during submission
  - Navigation to signup and forgot password

**Component + Store Integration**
- Pages that interact with Zustand stores
- Routing with MemoryRouter
- API success/error states

### Example: Page Integration Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app');
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

| Layer | Coverage Target | Current Status |
|-------|----------------|----------------|
| Utils / Stores | 80-90% | ✅ Comprehensive coverage |
| Services | 80-90% | ✅ Comprehensive coverage |
| Hooks | 80-90% | ✅ Comprehensive coverage |
| Pages | 60-70% | ✅ Good coverage (Auth pages, Dashboard) |
| UI Components | Selective (no strict threshold) | ✅ Selective coverage |
| E2E | Critical flows only | ✅ Critical flows covered |

### Current Test Coverage Summary

**Unit Tests (60+ tests)**
- ✅ **Services** - Complete coverage of all service layers:
  - `authService` (15 tests) - Registration, login, logout, token refresh, password reset
  - `invitationService` (7 tests) - CRUD operations, autosave
  - `assetService` (7 tests) - Upload validation, deletion, fetching
  - `layoutService` (6 tests) - Layout fetching with filters
  - `fontService` (3 tests) - Font list retrieval
- ✅ **Utilities** - Core utility functions:
  - `assetUtils` - Asset URL extraction
  - `jwtDecoder` - JWT decoding and expiration
  - `translations` - Translation data validation
  - `dashboardStats` - Stats calculation
- ✅ **Hooks** - Custom React hooks:
  - `useLanguage` (6 tests) - Language switching and translations
  - `useInvitations` (3 tests) - Invitation query hooks
  - `useLayouts` (4 tests) - Layout query hooks
- ✅ **Stores** - Zustand store logic:
  - `builderStore` - State management, data updates, theme management

**Integration Tests (15+ tests)**
- ✅ **Auth Pages**:
  - `SignupPage` - Form validation, password strength, submission
  - `LoginPage` - Login flow, error handling, navigation
- ✅ **Dashboard**:
  - `Dashboard` - Stats display, invitation lists, navigation
- ✅ **Landing Page**:
  - Personalization modal flow, localStorage persistence

**E2E Tests**
- ✅ Auth flow (registration, login, logout, password reset)
- ✅ Create website flow (dashboard navigation, invitation creation)

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
          node-version: '20.19.0'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.24.0

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit/integration tests
        run: pnpm test -- --run

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm run test:e2e
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
- Run `pnpm run test:coverage` explicitly

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Testing Workflow

### Iterative Test Development Process

Each test case must follow this strict workflow:

1. **Write ONE test case** - Focus on a single, specific test scenario
2. **Run the test** - Execute the test to verify it works (`pnpm test` for frontend)
3. **Verify success** - Ensure the test passes completely before proceeding
4. **Move to next test** - Only after current test passes, write the next test case

**Rules:**
- Never write multiple tests without running them individually
- Never proceed to the next test if the current one fails
- Fix any failing tests immediately before continuing
- Run tests frequently: `pnpm test` (frontend)
- Use watch mode for faster feedback: `pnpm test -- --watch`

**Benefits:**
- Catches issues early
- Ensures each test is valid before building on it
- Prevents accumulation of failing tests
- Maintains test suite health

## Getting Started

1. **Run existing tests** to verify setup:
   ```bash
   npm test
   ```

2. **Write your first test** - Start with a utility function or store method

3. **Add integration tests** - Test a page that uses the store

4. **Add E2E tests** - Test critical user flows

Remember: Start small, expand gradually, and focus on confidence over coverage.

## Test Maintenance

### Adding New Tests

When adding new functionality:

1. **Service Layer** - Add tests in `src/services/[serviceName].test.ts`
   - Test all public methods
   - Test error cases
   - Mock dependencies (apiClient, tokenStorage, etc.)

2. **Hooks** - Add tests in `src/hooks/[hookName].test.ts`
   - Test hook behavior with React Testing Library's `renderHook`
   - Test state changes and side effects
   - Mock dependencies appropriately

3. **Pages** - Add integration tests in `src/components/[PageName]/[PageName].test.tsx`
   - Test user interactions
   - Test API integration with MSW
   - Test navigation and routing

4. **Utilities** - Add tests in `src/utils/[utilName].test.ts`
   - Test all exported functions
   - Test edge cases and error conditions

### Running Specific Tests

```bash
# Run a specific test file
npm test authService.test.ts

# Run tests matching a pattern
npm test -- -t "should login"

# Run tests in a specific directory
npm test -- src/services/

# Run with coverage for a specific file
npm run test:coverage -- authService.test.ts
```

