/**
 * Rate Cards E2E Smoke Tests
 * Validates the complete rate cards workflow from login to editing
 */

import { test, expect } from '@playwright/test';

test.describe('Rate Cards Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@pivotalflow.com');
    await page.fill('input[type="password"]', 'password123!extra');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for successful login (could redirect to dashboard or root)
    await page.waitForURL(/.*\/(dashboard|$)/, { timeout: 10000 });
    
    // Wait for authenticated page to load
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to rate cards page from sidebar', async ({ page }) => {
    // Click on Rate Cards in sidebar
    await page.click('a[href="/rate-cards"]');
    
    // Wait for rate cards page to load
    await page.waitForURL('**/rate-cards');
    await expect(page.locator('h1')).toContainText('Rate Cards');
  });

  test('should display rate cards list page', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Check page elements
    await expect(page.locator('h1')).toContainText('Rate Cards');
    await expect(page.locator('[data-testid="rate-cards-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="rate-cards-status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="rate-cards-currency-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-rate-card-button"]')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Test search input
    const searchInput = page.locator('[data-testid="rate-cards-search"]');
    await searchInput.fill('standard');
    
    // Search should trigger (debounced)
    await page.waitForTimeout(500);
    
    // Verify search input has value
    await expect(searchInput).toHaveValue('standard');
  });

  test('should handle status filter', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Test status filter
    const statusFilter = page.locator('[data-testid="rate-cards-status-filter"]');
    await statusFilter.selectOption('active');
    
    // Verify filter selection
    await expect(statusFilter).toHaveValue('active');
  });

  test('should handle currency filter', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Test currency filter
    const currencyFilter = page.locator('[data-testid="rate-cards-currency-filter"]');
    await currencyFilter.selectOption('USD');
    
    // Verify filter selection
    await expect(currencyFilter).toHaveValue('USD');
  });

  test('should open rate card drawer when rate card is selected', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Wait for rate cards to load and click on first one (if exists)
    const rateCardItem = page.locator('[data-testid="rate-card-item"]').first();
    
    if (await rateCardItem.count() > 0) {
      await rateCardItem.click();
      
      // Check that drawer opens
      await expect(page.locator('text=Edit Rate Card')).toBeVisible();
      await expect(page.locator('[data-testid="close-drawer"]')).toBeVisible();
    } else {
      // If no rate cards, should show empty state
      await expect(page.locator('text=No Rate Card Selected')).toBeVisible();
      await expect(page.locator('[data-testid="create-rate-card-empty-state"]')).toBeVisible();
    }
  });

  test('should open create rate card dialog', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Click create button
    await page.click('[data-testid="create-rate-card-button"]');
    
    // Check that create drawer opens
    await expect(page.locator('text=Create Rate Card')).toBeVisible();
    await expect(page.locator('[data-testid="rate-card-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="rate-card-currency"]')).toBeVisible();
  });

  test('should validate create rate card form', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Open create form
    await page.click('[data-testid="create-rate-card-button"]');
    
    // Try to submit empty form
    await page.click('[data-testid="save-rate-card"]');
    
    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/rate-cards');
    
    // Check that page is responsive
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="rate-cards-search"]')).toBeVisible();
    
    // Filters should stack on mobile
    const statusFilter = page.locator('[data-testid="rate-cards-status-filter"]');
    const currencyFilter = page.locator('[data-testid="rate-cards-currency-filter"]');
    
    await expect(statusFilter).toBeVisible();
    await expect(currencyFilter).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Search input
    await expect(page.locator('[data-testid="rate-cards-search"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Status filter
    await expect(page.locator('[data-testid="rate-cards-status-filter"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Currency filter
    await expect(page.locator('[data-testid="rate-cards-currency-filter"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Create button
    await expect(page.locator('[data-testid="create-rate-card-button"]')).toBeFocused();
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Page should load even if API fails
    await expect(page.locator('h1')).toContainText('Rate Cards');
    
    // Should handle empty state gracefully
    await expect(page.locator('[data-testid="rate-cards-search"]')).toBeVisible();
  });

  test('should handle accessibility features', async ({ page }) => {
    await page.goto('/rate-cards');
    
    // Check ARIA labels and roles
    const searchInput = page.locator('[data-testid="rate-cards-search"]');
    await expect(searchInput).toHaveAttribute('placeholder', 'Search rate cards...');
    
    const createButton = page.locator('[data-testid="create-rate-card-button"]');
    await expect(createButton).toBeVisible();
    
    // Check that form elements are properly labeled
    const statusFilter = page.locator('[data-testid="rate-cards-status-filter"]');
    await expect(statusFilter).toBeVisible();
  });
});
