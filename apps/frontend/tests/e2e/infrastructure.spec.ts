import { test, expect } from '@playwright/test';

test.describe('E2E Infrastructure Tests', () => {
  test('should load the E2E test page', async ({ page }) => {
    await page.goto('/e2e-test.html');
    
    // Check if the page loads
    await expect(page).toHaveTitle('Pivotal Flow - E2E Test Page');
    await expect(page.getByText('Pivotal Flow')).toBeVisible();
    await expect(page.getByText('Sign In')).toBeVisible();
  });

  test('should allow user to fill login form', async ({ page }) => {
    await page.goto('/e2e-test.html');
    
    // Fill in the login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Verify the form is filled
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[name="password"]')).toHaveValue('password123');
  });

  test('should submit login form successfully', async ({ page }) => {
    await page.goto('/e2e-test.html');
    
    // Fill and submit the form
    await page.fill('input[name="email"]', 'admin@pivotalflow.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Check for success message
    await expect(page.getByText('Welcome to Pivotal Flow!')).toBeVisible();
    await expect(page.getByText('Login successful')).toBeVisible();
    await expect(page.getByText('Email: admin@pivotalflow.com')).toBeVisible();
  });

  test('should show error for empty form submission', async ({ page }) => {
    await page.goto('/e2e-test.html');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.getByText('Please fill in all fields')).toBeVisible();
  });
});

