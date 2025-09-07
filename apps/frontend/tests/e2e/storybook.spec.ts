import { test, expect } from '@playwright/test';

test.describe('Storybook E2E Tests', () => {
  test('should load Storybook and display components', async ({ page }) => {
    await page.goto('/');
    
    // Check if Storybook is loaded
    await expect(page.getByText('Storybook')).toBeVisible();
    
    // Check if we can see the sidebar with stories
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('should navigate to Button component story', async ({ page }) => {
    await page.goto('/');
    
    // Look for Button story in the sidebar
    await page.getByText('Button').first().click();
    
    // Check if the Button component is displayed
    await expect(page.locator('button')).toBeVisible();
  });
});

