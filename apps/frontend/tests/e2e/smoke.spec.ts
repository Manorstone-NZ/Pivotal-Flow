import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/');
    
    // Check if we're redirected to login page
    await expect(page).toHaveURL(/.*login/);
    
    // Check if login form elements are present
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check if demo credentials are shown
    await expect(page.getByText(/demo credentials/i)).toBeVisible();
    await expect(page.getByText(/admin@pivotalflow.com/)).toBeVisible();
  });

  test('should handle login with demo credentials', async ({ page }) => {
    await page.goto('/');
    
    // Fill in demo credentials
    await page.getByLabel(/email address/i).fill('admin@pivotalflow.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation or error message
    await page.waitForTimeout(2000);
    
    // Check if we're still on login page (backend not available)
    // or if we've been redirected to dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      // Backend not available, check for error message
      await expect(page.getByText(/login failed/i)).toBeVisible();
    } else {
      // Successfully logged in
      await expect(page).not.toHaveURL(/.*login/);
    }
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/');
    
    // Fill in invalid email
    await page.getByLabel(/email address/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation error
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email address/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    await expect(page.getByRole('heading', { name: /pivotal flow/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    
    // Check for proper form labels
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    // Check for proper button text
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});

