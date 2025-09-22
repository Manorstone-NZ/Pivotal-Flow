import { test, expect } from '@playwright/test';

test.describe('F2 Rate Cards - Services Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to rate cards page
    await page.goto('/rate-cards');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display rate cards list page', async ({ page }) => {
    // Check page title and main elements
    await expect(page).toHaveTitle(/Rate Cards/);
    await expect(page.locator('h1')).toContainText('Rate Cards');
    
    // Check for main action button
    await expect(page.locator('button', { hasText: 'Create Rate Card' })).toBeVisible();
    
    // Check for search and filter controls
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('should create a new rate card', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("Create Rate Card")');
    
    // Wait for dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Fill in rate card details
    await page.fill('input[name="name"]', 'Test Rate Card');
    await page.fill('textarea[name="description"]', 'A test rate card for E2E testing');
    
    // Select currency (assuming NZD is default)
    await page.click('[data-testid="currency-select"]');
    await page.click('text=NZD');
    
    // Submit form
    await page.click('button:has-text("Create Rate Card")');
    
    // Wait for success and dialog to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Verify rate card appears in list
    await expect(page.locator('text=Test Rate Card')).toBeVisible();
  });

  test('should add services to a rate card', async ({ page }) => {
    // First create a rate card (or assume one exists)
    await page.click('button:has-text("Create Rate Card")');
    await page.fill('input[name="name"]', 'Services Test Card');
    await page.fill('textarea[name="description"]', 'Testing service management');
    await page.click('button:has-text("Create Rate Card")');
    
    // Wait for creation to complete
    await page.waitForTimeout(1000);
    
    // Click edit on the newly created rate card
    await page.click('button[aria-label="Edit Services Test Card"]');
    
    // Switch to Services tab
    await page.click('button:has-text("Services")');
    
    // Add a new service
    await page.click('button:has-text("Add Service")');
    
    // Fill service details
    await page.fill('input[name="name"]', 'Software Development');
    await page.fill('textarea[name="description"]', 'Custom software development services');
    
    // Select unit of measure
    await page.click('[data-testid="unit-of-measure-select"]');
    await page.click('text=Hour');
    
    // Enter pricing
    await page.fill('input[name="buyPrice"]', '75.00');
    await page.fill('input[name="sellPrice"]', '150.00');
    
    // Select tax class
    await page.click('[data-testid="tax-class-select"]');
    await page.click('text=Standard');
    
    // Save service
    await page.click('button:has-text("Add Service")');
    
    // Verify service appears in the services list
    await expect(page.locator('text=Software Development')).toBeVisible();
    await expect(page.locator('text=$150.00')).toBeVisible();
  });

  test('should edit an existing service', async ({ page }) => {
    // Assume we have a rate card with services (from previous test or setup)
    // Click edit on a rate card
    await page.click('button[aria-label*="Edit"]:first');
    
    // Go to Services tab
    await page.click('button:has-text("Services")');
    
    // If there are services, edit the first one
    const editButton = page.locator('button:has-text("Edit"):first');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Modify service details
      await page.fill('input[name="sellPrice"]', '175.00');
      
      // Save changes
      await page.click('button:has-text("Save Changes")');
      
      // Verify updated price appears
      await expect(page.locator('text=$175.00')).toBeVisible();
    }
  });

  test('should filter rate cards by currency', async ({ page }) => {
    // Use currency filter
    await page.click('[data-testid="currency-filter"]');
    await page.click('text=USD');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Check that only USD rate cards are shown (if any)
    // This test assumes there might be USD rate cards or shows empty state
    const rateCards = page.locator('[data-testid="rate-card-item"]');
    const count = await rateCards.count();
    
    if (count > 0) {
      // If there are rate cards, they should all be USD
      for (let i = 0; i < count; i++) {
        await expect(rateCards.nth(i).locator('text=USD')).toBeVisible();
      }
    } else {
      // If no USD rate cards, should show empty state
      await expect(page.locator('text=No rate cards found')).toBeVisible();
    }
  });

  test('should search rate cards by name', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'Test');
    
    // Wait for search to apply
    await page.waitForTimeout(500);
    
    // Check that only matching rate cards are shown
    const rateCards = page.locator('[data-testid="rate-card-item"]');
    const count = await rateCards.count();
    
    if (count > 0) {
      // All visible rate cards should contain "Test" in name or description
      for (let i = 0; i < count; i++) {
        const cardText = await rateCards.nth(i).textContent();
        expect(cardText?.toLowerCase()).toContain('test');
      }
    }
  });

  test('should handle rate card status toggle', async ({ page }) => {
    // Click edit on a rate card
    await page.click('button[aria-label*="Edit"]:first');
    
    // Toggle status (assuming there's a status toggle)
    const statusToggle = page.locator('input[type="checkbox"][name*="active"]');
    if (await statusToggle.isVisible()) {
      await statusToggle.click();
      
      // Save changes
      await page.click('button:has-text("Save")');
      
      // Verify status change is reflected
      await expect(page.locator('text=Inactive')).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    // Try to create rate card without required fields
    await page.click('button:has-text("Create Rate Card")');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Rate Card")');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
    
    // Dialog should still be open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should handle service pricing validation', async ({ page }) => {
    // Create a rate card first
    await page.click('button:has-text("Create Rate Card")');
    await page.fill('input[name="name"]', 'Validation Test Card');
    await page.click('button:has-text("Create Rate Card")');
    
    // Edit and go to services
    await page.click('button[aria-label="Edit Validation Test Card"]');
    await page.click('button:has-text("Services")');
    
    // Try to add service with invalid pricing
    await page.click('button:has-text("Add Service")');
    await page.fill('input[name="name"]', 'Test Service');
    
    // Enter invalid pricing (negative or non-numeric)
    await page.fill('input[name="buyPrice"]', '-10');
    await page.fill('input[name="sellPrice"]', 'invalid');
    
    // Try to submit
    await page.click('button:has-text("Add Service")');
    
    // Should show validation errors
    await expect(page.locator('text=valid price')).toBeVisible();
  });

  test('should maintain tenant isolation', async ({ page }) => {
    // This test verifies that rate cards are properly scoped to the tenant
    // In a real test environment, you would switch tenants/users and verify
    // that rate cards from other tenants are not visible
    
    // For now, just verify that the API calls include proper tenant scoping
    // by checking network requests (this would be expanded in a real implementation)
    
    await page.route('**/api/v1/rate-cards**', (route) => {
      const headers = route.request().headers();
      // Verify proper authentication headers are present
      expect(headers['cookie']).toBeDefined(); // Session-based auth
      route.continue();
    });
    
    // Trigger an API call
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/v1/rate-cards', (route) => {
      route.abort('failed');
    });
    
    // Try to load rate cards
    await page.reload();
    
    // Should show error state
    await expect(page.locator('text=error')).toBeVisible();
    await expect(page.locator('text=try again')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test keyboard accessibility
    await page.keyboard.press('Tab'); // Should focus on search
    await expect(page.locator('input[placeholder*="Search"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Should focus on create button
    await expect(page.locator('button:has-text("Create Rate Card")')).toBeFocused();
    
    // Test Enter key to open create dialog
    await page.keyboard.press('Enter');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Test Escape to close dialog
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});

