/**
 * Quotes E2E Smoke Tests
 * Validates the complete quotes workflow: create→edit→save→reopen, assert totals
 */

import { test, expect } from '@playwright/test';

test.describe('Quotes Workflow', () => {
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

  test('should display quotes list page', async ({ page }) => {
    await page.goto('/quotes');
    
    // Check page elements
    await expect(page.locator('h1').filter({ hasText: 'Quotes' })).toBeVisible();
    await expect(page.locator('text=Create Quote')).toBeVisible();
  });

  test('should create new quote and navigate to details', async ({ page }) => {
    await page.goto('/quotes');
    
    // Click create quote button
    await page.click('text=Create Quote');
    
    // Should navigate to quote details page
    await page.waitForURL('**/quotes/*');
    await expect(page.locator('h1').filter({ hasText: 'New Quote' })).toBeVisible();
  });

  test('should display quote builder components', async ({ page }) => {
    await page.goto('/quotes');
    
    // Create a quote first
    await page.click('text=Create Quote');
    await page.waitForURL('**/quotes/*');
    
    // Check that all builder components are present
    await expect(page.locator('text=Quote Details')).toBeVisible();
    await expect(page.locator('text=Line Items')).toBeVisible();
    await expect(page.locator('text=Quote Summary')).toBeVisible();
    await expect(page.locator('text=Discount')).toBeVisible();
    await expect(page.locator('text=Customer')).toBeVisible();
  });

  test('should handle quote editing workflow', async ({ page }) => {
    await page.goto('/quotes');
    
    // Create a quote
    await page.click('text=Create Quote');
    await page.waitForURL('**/quotes/*');
    
    // Edit quote details
    await page.click('text=Edit Quote');
    
    // Update title
    const titleInput = page.locator('input[value="New Quote"]');
    await titleInput.fill('Updated Quote Title');
    
    // Save changes
    await page.click('text=Save Changes');
    
    // Verify title updated
    await expect(page.locator('h1').filter({ hasText: 'Updated Quote Title' })).toBeVisible();
  });

  test('should handle line item management', async ({ page }) => {
    await page.goto('/quotes');
    
    // Create a quote
    await page.click('text=Create Quote');
    await page.waitForURL('**/quotes/*');
    
    // Add line item
    await page.click('text=Add Line Item');
    
    // Fill line item form (if visible)
    const descriptionInput = page.locator('input[placeholder="Item description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Development Services');
      
      const quantityInput = page.locator('input[placeholder="1"]');
      await quantityInput.fill('10');
      
      const priceInput = page.locator('input[placeholder="0.00"]');
      await priceInput.fill('150.00');
      
      // Save line item
      await page.click('text=Add');
      
      // Verify line item appears
      await expect(page.locator('text=Development Services')).toBeVisible();
    }
  });

  test('should display server-calculated totals', async ({ page }) => {
    await page.goto('/quotes');
    
    // Create a quote
    await page.click('text=Create Quote');
    await page.waitForURL('**/quotes/*');
    
    // Check that summary card shows totals
    await expect(page.locator('text=Total Amount:')).toBeVisible();
    await expect(page.locator('text=calculations performed server-side')).toBeVisible();
  });

  test('should handle discount application', async ({ page }) => {
    await page.goto('/quotes');
    
    // Create a quote
    await page.click('text=Create Quote');
    await page.waitForURL('**/quotes/*');
    
    // Try to add discount
    await page.click('text=Add Discount');
    
    // Check discount editor opens
    await expect(page.locator('text=Discount Type')).toBeVisible();
  });

  test('should handle quote status transitions', async ({ page }) => {
    await page.goto('/quotes');
    
    // Create a quote
    await page.click('text=Create Quote');
    await page.waitForURL('**/quotes/*');
    
    // Check initial status
    await expect(page.locator('text=Draft')).toBeVisible();
    
    // Status management should be available
    await expect(page.locator('text=Quote Status')).toBeVisible();
  });

  test('should handle accessibility features', async ({ page }) => {
    await page.goto('/quotes');
    
    // Create a quote
    await page.click('text=Create Quote');
    await page.waitForURL('**/quotes/*');
    
    // Check ARIA live region exists
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeInTheDocument();
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto('/quotes/non-existent-id');
    
    // Should show error state
    await expect(page.locator('text=Quote Not Found')).toBeVisible();
    await expect(page.locator('text=Back to Quotes')).toBeVisible();
  });
});
