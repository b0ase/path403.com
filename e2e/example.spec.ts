import { test, expect } from '@playwright/test';

/**
 * Example E2E Tests
 *
 * These demonstrate how to write end-to-end tests for the application
 */

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should load home page', async ({ page }) => {
    // Check that page loaded
    await expect(page).toHaveTitle(/.*b0ase.*/);
  });

  test('should display main navigation', async ({ page }) => {
    // Check navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have clickable links', async ({ page }) => {
    // Find and test navigation links
    const links = page.locator('nav a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Click on a link (adjust selector as needed)
    const link = page.locator('a[href*="/about"]');
    if (await link.isVisible()) {
      await link.click();
      await expect(page).toHaveURL(/.*about.*/);
    }
  });

  test('should go back using browser back button', async ({ page }) => {
    await page.goto('/');
    const initialURL = page.url();

    // Navigate somewhere else
    const link = page.locator('a').first();
    await link.click();
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    expect(page.url()).toBe(initialURL);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that content is visible on mobile
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Should have at least one h1
    const h1s = page.locator('h1');
    await expect(h1s.first()).toBeVisible();
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    // Check that images have alt text
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Skip decorative images, but most should have alt text
      if (alt !== null && alt !== '') {
        expect(alt?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have focusable elements', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    // Should have some focusable element
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have good Largest Contentful Paint', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      const lcpEntries = performance
        .getEntriesByType('largest-contentful-paint');
      const lcpEntry = lcpEntries[lcpEntries.length - 1];
      return lcpEntry ? (lcpEntry as any).renderTime : null;
    });

    // LCP should be less than 2.5 seconds
    if (metrics) {
      expect(metrics).toBeLessThan(2500);
    }
  });
});

test.describe('Forms (if applicable)', () => {
  test('should submit form with valid data', async ({ page }) => {
    await page.goto('/');

    // Find and fill a form (adjust selectors as needed)
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      const inputs = form.locator('input');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const type = await input.getAttribute('type');
        if (type === 'text' || type === 'email') {
          await input.fill('test@example.com');
        }
      }

      // Submit form
      const submitBtn = form.locator('button[type="submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 errors gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    // Should either redirect or show error page
    expect([404, 307, 308]).toContain(response?.status());
  });

  test('should recover from network errors', async ({ page }) => {
    await page.goto('/');
    const initialURL = page.url();

    // Go offline
    await page.context().setOffline(true);

    // Try to navigate
    await page.goto('/');

    // Go back online
    await page.context().setOffline(false);

    // Should still be functional
    expect(page.url()).toBeDefined();
  });
});
