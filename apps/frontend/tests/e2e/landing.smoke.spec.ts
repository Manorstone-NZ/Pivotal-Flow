import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the landing page', async ({ page }) => {
    // Check that the main elements are present
    await expect(page.getByRole('heading', { name: 'Pivotal Flow' })).toBeVisible();
    await expect(page.getByText('Quotes → Invoices → Payments, flawlessly connected.')).toBeVisible();
    await expect(page.getByText('Everything you need to manage your business')).toBeVisible();
    await expect(page.getByText('System Status')).toBeVisible();
  });

  test('should show Sign In CTA when not authenticated', async ({ page }) => {
    // Should show Sign In button
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).not.toBeDisabled();

    // Should show Sign In Required for feature cards
    const signInRequiredButtons = page.getByRole('button', { name: 'Sign In Required' });
    await expect(signInRequiredButtons.first()).toBeVisible();
  });

  test('should navigate to login when Sign In is clicked', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();

    // Should navigate to login page
    await expect(page).toHaveURL('/login');
  });

  test('should show Continue to Dashboard when authenticated', async ({ page }) => {
    // Mock authentication by setting localStorage
    await page.evaluate(() => {
      localStorage.setItem('pivotal-flow-auth', JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { email: 'test@example.com' },
          accessToken: 'mock-token',
        },
        version: 0,
      }));
    });

    // Reload page to pick up auth state
    await page.reload();

    // Should show Continue to Dashboard button
    await expect(page.getByRole('button', { name: 'Continue to Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Explore Quotes' })).toBeVisible();
    await expect(page.getByText('Welcome back, test@example.com')).toBeVisible();

    // Should show Get Started for feature cards
    const getStartedButtons = page.getByRole('button', { name: 'Get Started' });
    await expect(getStartedButtons.first()).toBeVisible();
  });

  test('should navigate to dashboard when Continue to Dashboard is clicked', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('pivotal-flow-auth', JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { email: 'test@example.com' },
          accessToken: 'mock-token',
        },
        version: 0,
      }));
    });

    await page.reload();

    const continueButton = page.getByRole('button', { name: 'Continue to Dashboard' });
    await continueButton.click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show system status', async ({ page }) => {
    // Should show system status section
    await expect(page.getByText('System Status')).toBeVisible();
    
    // Should show status badge (could be different states)
    const statusBadge = page.locator('[data-testid="status-badge"], .bg-green-100, .bg-red-100, .bg-yellow-100').first();
    await expect(statusBadge).toBeVisible();

    // Should show Show Details button
    await expect(page.getByRole('button', { name: 'Show Details' })).toBeVisible();
  });

  test('should show detailed status when Show Details is clicked', async ({ page }) => {
    const showDetailsButton = page.getByRole('button', { name: 'Show Details' });
    await showDetailsButton.click();

    // Should show detailed status information
    await expect(page.getByText('Database')).toBeVisible();
    await expect(page.getByText('Redis')).toBeVisible();
    await expect(page.getByText('Metrics')).toBeVisible();
    await expect(page.getByText(/Version:/)).toBeVisible();
    await expect(page.getByText(/Uptime:/)).toBeVisible();

    // Button should change to Hide Details
    await expect(page.getByRole('button', { name: 'Hide Details' })).toBeVisible();
  });

  test('should show footer with version information', async ({ page }) => {
    // Scroll to bottom to ensure footer is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Should show footer content
    await expect(page.getByText('Pivotal Flow')).toBeVisible();
    await expect(page.getByText('Documentation')).toBeVisible();
    await expect(page.getByText('Changelog')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText(/Version:/)).toBeVisible();
    await expect(page.getByText(/Build:/)).toBeVisible();
    await expect(page.getByText(/© \d{4} Pivotal Flow/)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that hero section stacks properly
    await expect(page.getByRole('heading', { name: 'Pivotal Flow' })).toBeVisible();
    
    // Check that feature grid adapts to mobile
    const featureCards = page.locator('article');
    await expect(featureCards.first()).toBeVisible();

    // Check that footer is still visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByText('Pivotal Flow')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check heading hierarchy
    const mainHeading = page.getByRole('heading', { name: 'Pivotal Flow' });
    await expect(mainHeading).toHaveAttribute('id', 'hero-heading');

    // Check section labels
    const heroSection = mainHeading.locator('..');
    await expect(heroSection).toHaveAttribute('aria-labelledby', 'hero-heading');

    // Check feature grid structure
    const featureArticles = page.locator('article');
    await expect(featureArticles.first()).toBeVisible();

    // Check footer semantic structure
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();

    const footerNav = page.getByRole('navigation', { name: 'Footer navigation' });
    await expect(footerNav).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab');
    
    // Should focus on Sign In button
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeFocused();

    // Tab to next interactive element
    await page.keyboard.press('Tab');
    
    // Should focus on feature card buttons
    const firstFeatureButton = page.getByRole('button', { name: 'Sign In Required' }).first();
    await expect(firstFeatureButton).toBeFocused();
  });

  test('should refresh system status when Refresh button is clicked', async ({ page }) => {
    // Wait for initial status to load
    await expect(page.getByText('System Status')).toBeVisible();

    // Click refresh button
    const refreshButton = page.getByRole('button', { name: 'Refresh' });
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Should show refreshing state briefly
    await expect(page.getByRole('button', { name: 'Refreshing...' })).toBeVisible();
  });
});
