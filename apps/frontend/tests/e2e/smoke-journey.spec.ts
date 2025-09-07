import { test, expect } from '@playwright/test';

test.describe('E2E Smoke Tests @smoke', () => {
  // Test configuration
  const DEMO_CREDENTIALS = {
    admin: {
      email: 'admin@pivotalflow.com',
      password: 'password123',
    },
    user: {
      email: 'user@pivotalflow.com',
      password: 'password123',
    },
  };

  test('should complete full user journey: login → dashboard → quotes → quote details → logout', async ({ page }) => {
    // Step 1: Login
    await page.goto('/');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText(/sign in/i)).toBeVisible();
    
    // Fill in demo credentials
    await page.getByLabel(/email address/i).fill(DEMO_CREDENTIALS.admin.email);
    await page.getByLabel(/password/i).fill(DEMO_CREDENTIALS.admin.password);
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation to dashboard
    await page.waitForURL(/.*dashboard|.*\/$/);
    await expect(page).not.toHaveURL(/.*login/);
    
    // Step 2: Verify dashboard loads
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    await expect(page.getByText(/welcome/i)).toBeVisible();
    
    // Step 3: Navigate to quotes
    await page.getByRole('link', { name: /quotes/i }).click();
    await page.waitForURL(/.*quotes/);
    
    // Verify quotes page loads
    await expect(page.getByText(/quotes/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create quote/i })).toBeVisible();
    
    // Step 4: Check if quotes are displayed (from seeded data)
    const quoteRows = page.locator('[data-testid="quote-row"]');
    const quoteCount = await quoteRows.count();
    
    if (quoteCount > 0) {
      // Click on first quote to view details
      await quoteRows.first().click();
      await page.waitForURL(/.*quotes\/.*/);
      
      // Verify quote details page loads
      await expect(page.getByText(/quote details/i)).toBeVisible();
      await expect(page.getByText(/line items/i)).toBeVisible();
      
      // Verify quote information is displayed
      await expect(page.getByText(/total amount/i)).toBeVisible();
      await expect(page.getByText(/status/i)).toBeVisible();
      
      // Navigate back to quotes list
      await page.getByRole('button', { name: /back/i }).click();
      await page.waitForURL(/.*quotes$/);
    } else {
      // No quotes available, create one
      await page.getByRole('button', { name: /create quote/i }).click();
      await page.waitForURL(/.*quotes\/new/);
      
      // Fill in quote form
      await page.getByLabel(/customer/i).selectOption({ index: 1 });
      await page.getByLabel(/description/i).fill('E2E Test Quote');
      await page.getByLabel(/quantity/i).fill('10');
      await page.getByLabel(/unit price/i).fill('100');
      
      // Submit quote
      await page.getByRole('button', { name: /save quote/i }).click();
      await page.waitForURL(/.*quotes$/);
      
      // Verify quote was created
      await expect(page.getByText(/quote created successfully/i)).toBeVisible();
    }
    
    // Step 5: Navigate to users page
    await page.getByRole('link', { name: /users/i }).click();
    await page.waitForURL(/.*users/);
    
    // Verify users page loads
    await expect(page.getByText(/users/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create user/i })).toBeVisible();
    
    // Step 6: Logout
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByRole('menuitem', { name: /logout/i }).click();
    
    // Should redirect to login page
    await page.waitForURL(/.*login/);
    await expect(page.getByText(/sign in/i)).toBeVisible();
    
    // Verify logout was successful
    await expect(page.getByText(/logged out successfully/i)).toBeVisible();
  });

  test('should handle login with different user roles @smoke', async ({ page }) => {
    // Test admin user login
    await page.goto('/login');
    
    await page.getByLabel(/email address/i).fill(DEMO_CREDENTIALS.admin.email);
    await page.getByLabel(/password/i).fill(DEMO_CREDENTIALS.admin.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForURL(/.*dashboard|.*\/$/);
    await expect(page).not.toHaveURL(/.*login/);
    
    // Verify admin-specific features are available
    await expect(page.getByRole('link', { name: /users/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
    
    // Logout
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByRole('menuitem', { name: /logout/i }).click();
    await page.waitForURL(/.*login/);
    
    // Test regular user login
    await page.getByLabel(/email address/i).fill(DEMO_CREDENTIALS.user.email);
    await page.getByLabel(/password/i).fill(DEMO_CREDENTIALS.user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForURL(/.*dashboard|.*\/$/);
    await expect(page).not.toHaveURL(/.*login/);
    
    // Verify user-specific features (no admin features)
    await expect(page.getByRole('link', { name: /quotes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /users/i })).not.toBeVisible();
  });

  test('should validate protected routes redirect to login @smoke', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/quotes', '/users', '/rate-cards', '/payments', '/settings'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
      await expect(page.getByText(/sign in/i)).toBeVisible();
    }
  });

  test('should handle API errors gracefully @smoke', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill(DEMO_CREDENTIALS.admin.email);
    await page.getByLabel(/password/i).fill(DEMO_CREDENTIALS.admin.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForURL(/.*dashboard|.*\/$/);
    
    // Navigate to quotes and try to create a quote with invalid data
    await page.getByRole('link', { name: /quotes/i }).click();
    await page.waitForURL(/.*quotes/);
    
    await page.getByRole('button', { name: /create quote/i }).click();
    await page.waitForURL(/.*quotes\/new/);
    
    // Submit empty form to trigger validation errors
    await page.getByRole('button', { name: /save quote/i }).click();
    
    // Verify validation errors are shown
    await expect(page.getByText(/customer is required/i)).toBeVisible();
    await expect(page.getByText(/description is required/i)).toBeVisible();
    
    // Fill in valid data
    await page.getByLabel(/customer/i).selectOption({ index: 1 });
    await page.getByLabel(/description/i).fill('Test Quote');
    await page.getByLabel(/quantity/i).fill('5');
    await page.getByLabel(/unit price/i).fill('50');
    
    // Submit valid form
    await page.getByRole('button', { name: /save quote/i }).click();
    
    // Should navigate back to quotes list
    await page.waitForURL(/.*quotes$/);
    await expect(page.getByText(/quote created successfully/i)).toBeVisible();
  });

  test('should handle network errors gracefully @smoke', async ({ page }) => {
    // Simulate network error by going offline
    await page.context().setOffline(true);
    
    await page.goto('/login');
    
    // Try to login while offline
    await page.getByLabel(/email address/i).fill(DEMO_CREDENTIALS.admin.email);
    await page.getByLabel(/password/i).fill(DEMO_CREDENTIALS.admin.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show network error
    await expect(page.getByText(/network error/i)).toBeVisible();
    await expect(page.getByText(/please check your connection/i)).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
    
    // Try login again
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should work now
    await page.waitForURL(/.*dashboard|.*\/$/);
    await expect(page).not.toHaveURL(/.*login/);
  });

  test('should maintain session across page refreshes @smoke', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill(DEMO_CREDENTIALS.admin.email);
    await page.getByLabel(/password/i).fill(DEMO_CREDENTIALS.admin.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForURL(/.*dashboard|.*\/$/);
    
    // Refresh the page
    await page.reload();
    
    // Should still be logged in
    await expect(page).not.toHaveURL(/.*login/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    
    // Navigate to another page and refresh
    await page.getByRole('link', { name: /quotes/i }).click();
    await page.waitForURL(/.*quotes/);
    await page.reload();
    
    // Should still be logged in and on quotes page
    await expect(page).not.toHaveURL(/.*login/);
    await expect(page.getByText(/quotes/i)).toBeVisible();
  });
});
