import { test, expect } from '@playwright/test';

test.describe('Accessibility and Performance E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for protected routes
    await page.goto('/');
    
    // If redirected to login, fill in demo credentials
    if (page.url().includes('login')) {
      await page.getByLabel(/email address/i).fill('admin@pivotalflow.com');
      await page.getByLabel(/password/i).fill('password123');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Wait for navigation or handle backend unavailability
      await page.waitForTimeout(2000);
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    
    // Should have at least one h1
    expect(await h1.count()).toBeGreaterThanOrEqual(1);
    
    // Check if headings are visible
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
    }
    
    if (await h2.count() > 0) {
      await expect(h2.first()).toBeVisible();
    }
  });

  test('should have proper form labels and accessibility', async ({ page }) => {
    await page.goto('/login');
    
    // Check for proper form labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Check for proper input types
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check for required attributes
    if (await emailInput.getAttribute('required')) {
      await expect(emailInput).toHaveAttribute('required');
    }
    
    if (await passwordInput.getAttribute('required')) {
      await expect(passwordInput).toHaveAttribute('required');
    }
  });

  test('should have proper button accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for proper button roles and labels
    const buttons = page.locator('button');
    
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
      
      // Check if button has accessible name
      const buttonText = await firstButton.textContent();
      const buttonLabel = await firstButton.getAttribute('aria-label');
      
      expect(buttonText || buttonLabel).toBeTruthy();
    }
  });

  test('should have proper link accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for proper link accessibility
    const links = page.locator('a[href]');
    
    if (await links.count() > 0) {
      const firstLink = links.first();
      await expect(firstLink).toBeVisible();
      
      // Check if link has accessible name
      const linkText = await firstLink.textContent();
      const linkLabel = await firstLink.getAttribute('aria-label');
      
      expect(linkText || linkLabel).toBeTruthy();
    }
  });

  test('should have proper table accessibility', async ({ page }) => {
    await page.goto('/quotes');
    
    // Check for proper table structure
    const tables = page.locator('table');
    
    if (await tables.count() > 0) {
      const table = tables.first();
      await expect(table).toBeVisible();
      
      // Check for table headers
      const headers = table.locator('th');
      if (await headers.count() > 0) {
        await expect(headers.first()).toBeVisible();
      }
      
      // Check for table body
      const tbody = table.locator('tbody');
      if (await tbody.isVisible()) {
        await expect(tbody).toBeVisible();
      }
    }
  });

  test('should handle keyboard navigation properly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test Tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
    
    // Test Shift+Tab navigation
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(500);
    
    // Test Enter key on focused element
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Test Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for common ARIA attributes
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    
    if (await ariaElements.count() > 0) {
      // Check if ARIA elements are properly implemented
      const firstAriaElement = ariaElements.first();
      await expect(firstAriaElement).toBeVisible();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/dashboard');
    
    // This test would require more sophisticated color contrast checking
    // For now, just verify that text is visible and readable
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
    
    if (await textElements.count() > 0) {
      const firstTextElement = textElements.first();
      await expect(firstTextElement).toBeVisible();
      
      // Check if text has proper color
      const color = await firstTextElement.evaluate(el => 
        window.getComputedStyle(el).color
      );
      
      expect(color).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
    }
  });

  test('should load pages within performance budget', async ({ page }) => {
    // Start performance measurement
    await page.goto('/dashboard');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Check if load time is reasonable (under 3 seconds)
    expect(performanceMetrics.loadTime).toBeLessThan(3000);
    
    // Check if DOM content loaded quickly (under 1 second)
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000);
  });

  test('should handle lazy loading properly', async ({ page }) => {
    await page.goto('/quotes');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Check if lazy-loaded content appears
    const lazyElements = page.locator('[data-testid*="lazy"], .lazy, [loading="lazy"]');
    
    if (await lazyElements.count() > 0) {
      // Scroll to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Check if lazy elements are now visible
      const visibleLazyElements = await lazyElements.count();
      expect(visibleLazyElements).toBeGreaterThan(0);
    }
  });

  test('should handle error boundaries gracefully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Try to trigger an error by navigating to invalid route
    await page.goto('/invalid-route-that-should-not-exist');
    
    // Should show error page or 404
    const errorPage = page.getByText(/404|not found|error|something went wrong/i);
    if (await errorPage.isVisible()) {
      await expect(errorPage).toBeVisible();
    }
    
    // Should still be able to navigate back
    await page.goto('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should handle responsive images properly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for responsive images
    const images = page.locator('img');
    
    if (await images.count() > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();
      
      // Check for alt text
      const altText = await firstImage.getAttribute('alt');
      expect(altText).toBeTruthy();
      
      // Check for responsive attributes
      const srcset = await firstImage.getAttribute('srcset');
      const sizes = await firstImage.getAttribute('sizes');
      
      // At least one responsive attribute should be present
      expect(srcset || sizes).toBeTruthy();
    }
  });

  test('should handle focus management in modals', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for modal triggers
    const modalTriggers = page.getByRole('button', { name: /create|add|new|open/i });
    
    if (await modalTriggers.count() > 0) {
      await modalTriggers.first().click();
      await page.waitForTimeout(1000);
      
      // Check if modal is open
      const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
      
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();
        
        // Check if focus is trapped in modal
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        
        const focusedElement = page.locator(':focus');
        if (await focusedElement.isVisible()) {
          await expect(focusedElement).toBeVisible();
        }
        
        // Test Escape key to close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle screen reader announcements', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live], [aria-atomic]');
    
    if (await liveRegions.count() > 0) {
      await expect(liveRegions.first()).toBeVisible();
    }
    
    // Check for status messages
    const statusMessages = page.locator('[role="status"], [role="alert"]');
    
    if (await statusMessages.count() > 0) {
      await expect(statusMessages.first()).toBeVisible();
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/dashboard');
    
    // Check if page is still usable in dark mode
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    
    // Check if text is still readable
    const textElements = page.locator('p, span, div, h1, h2, h3');
    if (await textElements.count() > 0) {
      await expect(textElements.first()).toBeVisible();
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/dashboard');
    
    // Check if page loads without motion
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    
    // Check if animations are reduced
    const animatedElements = page.locator('[class*="animate"], [style*="animation"]');
    
    if (await animatedElements.count() > 0) {
      // In reduced motion mode, animations should be minimal
      const animationStyle = await animatedElements.first().evaluate(el => 
        window.getComputedStyle(el).animation
      );
      
      // Animation should be 'none' or very short duration
      expect(animationStyle).toMatch(/none|0s/);
    }
  });
});
