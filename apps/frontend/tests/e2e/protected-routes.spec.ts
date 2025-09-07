import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access a protected route directly
    await page.goto('/dashboard');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test('should redirect to login when accessing users page without auth', async ({ page }) => {
    // Try to access users page directly
    await page.goto('/users');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test('should redirect to login when accessing quotes page without auth', async ({ page }) => {
    // Try to access quotes page directly
    await page.goto('/quotes');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });
});

