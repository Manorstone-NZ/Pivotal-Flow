import { test, expect } from '@playwright/test';

test.describe('Frontend E2E Tests', () => {
  test('should load the frontend application', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads (should redirect to login or show some content)
    await expect(page).toHaveLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/frontend-homepage.png' });
  });

  test('should be able to navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page elements are present
    await expect(page.getByText('Sign In')).toBeVisible();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/login-page.png' });
  });
});

