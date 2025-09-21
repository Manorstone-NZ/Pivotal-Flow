/**
 * Simple Login Test
 * Test just the login functionality to verify it works
 */

import { test, expect } from '@playwright/test';

test.describe('Login Test', () => {
  test('should login successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5174/login');
    
    // Wait for login form to be visible
    await expect(page.locator('form')).toBeVisible();
    
    // Fill in login credentials
    await page.fill('input[type="email"]', 'admin@pivotalflow.com');
    await page.fill('input[type="password"]', 'password123!extra');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
