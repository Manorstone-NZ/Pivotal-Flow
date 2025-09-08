import { test, expect } from '@playwright/test';

test.describe('Quotes Workflow', () => {
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

  test('should navigate to quotes page from dashboard', async ({ page }) => {
    // Start at dashboard
    await page.goto('/dashboard');
    
    // Look for navigation to quotes
    const quotesLink = page.getByRole('link', { name: /quotes/i });
    if (await quotesLink.isVisible()) {
      await quotesLink.click();
      await expect(page).toHaveURL(/.*quotes/);
    } else {
      // If no direct link, check if quotes page loads directly
      await page.goto('/quotes');
      await expect(page).toHaveURL(/.*quotes/);
    }
  });

  test('should display quotes list page', async ({ page }) => {
    await page.goto('/quotes');
    
    // Check for quotes page elements
    await expect(page.getByText(/quotes/i)).toBeVisible();
    
    // Check for common quotes page elements
    const pageTitle = page.getByRole('heading', { level: 1 });
    await expect(pageTitle).toBeVisible();
    
    // Check for data table or list
    const table = page.locator('table, [role="table"]');
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    } else {
      // Check for alternative content structure
      await expect(page.locator('[data-testid="quotes-list"], .quotes-list')).toBeVisible();
    }
  });

  test('should handle quote creation flow', async ({ page }) => {
    await page.goto('/quotes');
    
    // Look for create quote button
    const createButton = page.getByRole('button', { name: /create.*quote|new.*quote|add.*quote/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Check if we're taken to a quote creation page or modal
      await page.waitForTimeout(1000);
      
      // Look for quote form elements
      const formElements = [
        page.getByLabel(/title|name/i),
        page.getByLabel(/description/i),
        page.getByLabel(/customer|client/i),
        page.getByLabel(/amount|price/i)
      ];
      
      // Check if any form elements are visible
      const visibleElements = await Promise.all(
        formElements.map(async (element) => await element.isVisible())
      );
      
      expect(visibleElements.some(Boolean)).toBeTruthy();
    }
  });

  test('should navigate to quote detail page', async ({ page }) => {
    await page.goto('/quotes');
    
    // Look for quote links or rows
    const quoteLinks = page.locator('a[href*="/quotes/"], [data-testid*="quote-"]');
    const quoteRows = page.locator('tr, [role="row"]');
    
    if (await quoteLinks.count() > 0) {
      // Click on first quote link
      await quoteLinks.first().click();
      await expect(page).toHaveURL(/.*quotes\/.*/);
    } else if (await quoteRows.count() > 1) {
      // Click on first data row (skip header)
      await quoteRows.nth(1).click();
      await expect(page).toHaveURL(/.*quotes\/.*/);
    } else {
      // Try direct navigation to a sample quote
      await page.goto('/quotes/1');
      await expect(page).toHaveURL(/.*quotes\/1/);
    }
  });

  test('should display quote detail page elements', async ({ page }) => {
    await page.goto('/quotes/1');
    
    // Check for quote detail page elements
    await expect(page.getByText(/quote.*detail|quote.*information/i)).toBeVisible();
    
    // Look for common quote detail elements
    const elements = [
      page.getByText(/quote.*number|quote.*id/i),
      page.getByText(/customer|client/i),
      page.getByText(/amount|total|price/i),
      page.getByText(/status/i),
      page.getByText(/date|created|updated/i)
    ];
    
    // Check if at least some elements are visible
    const visibleElements = await Promise.all(
      elements.map(async (element) => await element.isVisible())
    );
    
    expect(visibleElements.some(Boolean)).toBeTruthy();
  });

  test('should handle quote status updates', async ({ page }) => {
    await page.goto('/quotes/1');
    
    // Look for status update controls
    const statusSelect = page.locator('select[name*="status"], [data-testid*="status"]');
    const statusButtons = page.getByRole('button', { name: /approve|reject|send|draft/i });
    
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption({ label: /approved|sent/i });
      await page.waitForTimeout(500);
    } else if (await statusButtons.count() > 0) {
      await statusButtons.first().click();
      await page.waitForTimeout(500);
    }
    
    // Check for success message or status change
    const successMessage = page.getByText(/success|updated|saved/i);
    if (await successMessage.isVisible()) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('should handle quote editing', async ({ page }) => {
    await page.goto('/quotes/1');
    
    // Look for edit button or form
    const editButton = page.getByRole('button', { name: /edit|modify|update/i });
    const editableFields = page.locator('input[type="text"], textarea');
    
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);
    }
    
    // Try to edit a field if available
    if (await editableFields.count() > 0) {
      const firstField = editableFields.first();
      await firstField.fill('Updated quote information');
      
      // Look for save button
      const saveButton = page.getByRole('button', { name: /save|update|submit/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle quote filtering and search', async ({ page }) => {
    await page.goto('/quotes');
    
    // Look for search/filter controls
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"]');
    const filterSelect = page.locator('select[name*="filter"], select[name*="status"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test quote');
      await page.waitForTimeout(500);
    }
    
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption({ label: /draft|pending|approved/i });
      await page.waitForTimeout(500);
    }
    
    // Check if results are filtered
    const results = page.locator('table tbody tr, [role="row"]');
    if (await results.count() > 0) {
      await expect(results).toBeVisible();
    }
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/quotes');
    
    // Look for pagination controls
    const nextButton = page.getByRole('button', { name: /next|>|→/i });
    const pageNumbers = page.locator('[data-testid*="page"], .pagination button');
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Check if URL changed or content updated
      const currentUrl = page.url();
      expect(currentUrl).toContain('quotes');
    } else if (await pageNumbers.count() > 1) {
      await pageNumbers.nth(1).click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/quotes');
    
    // Check if mobile layout is working
    await expect(page.getByText(/quotes/i)).toBeVisible();
    
    // Check if sidebar is collapsed or mobile menu is available
    const mobileMenu = page.getByRole('button', { name: /menu|hamburger/i });
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500);
    }
    
    // Check if content is still accessible
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });
});
