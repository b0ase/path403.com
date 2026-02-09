# Testing Infrastructure Guide

## Overview

This guide covers testing strategies for the b0ase.com application:
- **Unit Tests** - Test individual functions and components
- **Integration Tests** - Test components working together
- **E2E Tests** - Test complete user flows
- **Performance Tests** - Monitor bundle size and metrics

## Test Structure

```
project/
├── __tests__/
│   ├── unit/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── api/
│   ├── integration/
│   │   └── components/
│   └── e2e/
│       └── flows/
└── [source files]
```

## Unit Testing with Vitest

### Setup

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/dom
```

### Configuration (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.config.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Example Unit Test

```typescript
// __tests__/unit/utils/string.test.ts
import { describe, it, expect } from 'vitest';
import { formatName, truncate } from '@/lib/utils/string';

describe('String Utilities', () => {
  describe('formatName', () => {
    it('should format name correctly', () => {
      expect(formatName('john doe')).toBe('John Doe');
    });

    it('should handle empty strings', () => {
      expect(formatName('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Hi', 5)).toBe('Hi');
    });
  });
});
```

## Component Testing

### Example Component Test

```typescript
// __tests__/unit/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByText('Click')).toBeDisabled();
  });
});
```

## Hook Testing

### Example Hook Test

```typescript
// __tests__/unit/hooks/useDebounce.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/lib/utils/memoization';

describe('useDebounce Hook', () => {
  it('should debounce value changes', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Still debounced

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });
});
```

## API Testing

### Example API Route Test

```typescript
// __tests__/unit/api/projects.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from '@/app/api/v1/projects/route';

describe('Projects API', () => {
  it('GET should return projects for authenticated user', async () => {
    // Mock Supabase auth
    vi.mock('@/lib/supabase/server', () => ({
      createClient: vi.fn(() => ({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [] }),
        }),
      })),
    }));

    const req = new Request('http://localhost:3000/api/v1/projects');
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });
});
```

## E2E Testing with Playwright

### Setup

```bash
pnpm add -D @playwright/test
npx playwright install
```

### Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example E2E Test

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

## Test Coverage

### Coverage Configuration

Add to `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  include: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'components/**/*.{tsx}'],
  exclude: [
    'node_modules/',
    'dist/',
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.d.ts',
  ],
  lines: 70,      // 70% lines coverage required
  functions: 70,  // 70% functions coverage required
  branches: 60,   // 60% branches coverage required
  statements: 70, // 70% statements coverage required
}
```

### Run Coverage

```bash
pnpm test:coverage
```

## npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest --run",
    "test:coverage": "vitest --coverage --run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test:run && pnpm test:e2e"
  }
}
```

## Testing Best Practices

### ✅ DO

- Test behavior, not implementation
- Use descriptive test names
- Keep tests focused and small
- Mock external dependencies
- Test error cases
- Use factories for test data
- Test accessibility
- Test user interactions, not DOM details

### ❌ DON'T

- Test implementation details
- Write tests that are too long
- Test third-party libraries
- Mock internal functions unnecessarily
- Ignore errors and edge cases
- Use timeouts instead of proper waiting
- Test multiple things in one test

## Test Data Factories

```typescript
// __tests__/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  createdAt: faker.date.past(),
  ...overrides,
});

export const createUsers = (count = 3) =>
  Array.from({ length: count }, () => createUser());
```

## Mocking Strategies

### Mock Supabase

```typescript
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  })),
}));
```

### Mock Next.js Router

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    pathname: '/',
  }),
}));
```

## Continuous Integration

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
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:run
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Coverage Targets

| Category | Target | Priority |
|----------|--------|----------|
| Critical paths | 90%+ | High |
| Components | 80%+ | High |
| Utils/Helpers | 75%+ | Medium |
| Hooks | 80%+ | High |
| API routes | 85%+ | High |
| Styles/Config | N/A | Low |

## Testing Pyramid

```
       E2E Tests (10%)
       ↑ slow, expensive

     Integration (30%)
     ↑ moderate speed

   Unit Tests (60%)
   ↑ fast, cheap
```

## Resources

- [Vitest Docs](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com)
- [Playwright Docs](https://playwright.dev)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Checklist

- [ ] vitest configured
- [ ] Playwright configured
- [ ] Test utilities created
- [ ] Example tests written
- [ ] Coverage tracking enabled
- [ ] CI/CD pipeline set up
- [ ] Coverage badges added
- [ ] Documentation updated
