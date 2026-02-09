/**
 * Testing Utilities
 *
 * Helper functions and custom render functions for testing React components
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Custom render function that wraps components with necessary providers
 *
 * Usage:
 * ```typescript
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Add any global providers here (Theme, Auth, etc.)
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-123',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      role: 'user',
    },
    ...overrides,
  };
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: createMockUser() },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      range: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
    }),
  };
}

/**
 * Create a mock Next.js router
 */
export function createMockRouter(overrides = {}) {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    basePath: '',
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
    route: '/',
    ...overrides,
  };
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock API responses
 */
export function mockFetch(response: any, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status < 400,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  );
}

/**
 * Reset fetch mock
 */
export function resetFetch() {
  vi.restoreAllMocks();
}

/**
 * Test data factories
 */
export const factories = {
  user: (overrides = {}) => ({
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User',
    createdAt: new Date(),
    ...overrides,
  }),

  project: (overrides = {}) => ({
    id: 'project-123',
    name: 'Test Project',
    description: 'A test project',
    status: 'active' as const,
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  skill: (overrides = {}) => ({
    id: 'skill-123',
    name: 'React',
    category: 'Frontend Development',
    description: 'JavaScript library for building UIs',
    ...overrides,
  }),

  team: (overrides = {}) => ({
    id: 'team-123',
    name: 'Test Team',
    description: 'A test team',
    createdAt: new Date(),
    ...overrides,
  }),
};

/**
 * Assertion helpers
 */
export const assertions = {
  /**
   * Assert that an element is visible in the viewport
   */
  toBeInViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  },

  /**
   * Assert that an element has specific data attribute
   */
  toHaveDataAttribute(element: HTMLElement, key: string, value?: string) {
    const attr = element.getAttribute(`data-${key}`);
    if (value === undefined) {
      return attr !== null;
    }
    return attr === value;
  },

  /**
   * Assert that a function was called with specific args
   */
  toHaveBeenCalledWithObject(fn: any, obj: any) {
    return fn.mock.calls.some((call: any[]) => {
      const callObj = call[0];
      return Object.keys(obj).every(key => callObj[key] === obj[key]);
    });
  },
};

/**
 * Performance testing helpers
 */
export const performanceHelpers = {
  /**
   * Measure component render time
   */
  measureRenderTime(element: ReactElement) {
    const start = performance.now();
    render(element);
    const end = performance.now();
    return end - start;
  },

  /**
   * Assert render time is under threshold
   */
  assertRenderTimeUnder(element: ReactElement, threshold: number) {
    const time = this.measureRenderTime(element);
    return time < threshold;
  },
};

/**
 * Accessibility testing helpers
 */
export const a11yHelpers = {
  /**
   * Check if element has accessible name
   */
  hasAccessibleName(element: HTMLElement) {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent
    );
  },

  /**
   * Check if focusable elements have focus styles
   */
  hasFocusStyles(element: HTMLElement) {
    const styles = window.getComputedStyle(element, ':focus');
    return (
      styles.outline !== 'none' || styles.boxShadow !== 'none'
    );
  },
};
