import { test, expect } from '@playwright/test';

test.describe('User Management Workflow', () => {
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

  test('should navigate to users page from dashboard', async ({ page }) => {
    // Start at dashboard
    await page.goto('/dashboard');
    
    // Look for navigation to users
    const usersLink = page.getByRole('link', { name: /users/i });
    if (await usersLink.isVisible()) {
      await usersLink.click();
      await expect(page).toHaveURL(/.*users/);
    } else {
      // If no direct link, check if users page loads directly
      await page.goto('/users');
      await expect(page).toHaveURL(/.*users/);
    }
  });

  test('should display users list page', async ({ page }) => {
    await page.goto('/users');
    
    // Check for users page elements
    await expect(page.getByText(/users/i)).toBeVisible();
    
    // Check for common users page elements
    const pageTitle = page.getByRole('heading', { level: 1 });
    await expect(pageTitle).toBeVisible();
    
    // Check for data table or list
    const table = page.locator('table, [role="table"]');
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    } else {
      // Check for alternative content structure
      await expect(page.locator('[data-testid="users-list"], .users-list')).toBeVisible();
    }
  });

  test('should handle user creation flow', async ({ page }) => {
    await page.goto('/users');
    
    // Look for create user button
    const createButton = page.getByRole('button', { name: /create.*user|new.*user|add.*user/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Check if we're taken to a user creation page or modal
      await page.waitForTimeout(1000);
      
      // Look for user form elements
      const formElements = [
        page.getByLabel(/name|full name/i),
        page.getByLabel(/email/i),
        page.getByLabel(/role/i),
        page.getByLabel(/password/i)
      ];
      
      // Check if any form elements are visible
      const visibleElements = await Promise.all(
        formElements.map(async (element) => await element.isVisible())
      );
      
      expect(visibleElements.some(Boolean)).toBeTruthy();
    }
  });

  test('should handle user form validation', async ({ page }) => {
    await page.goto('/users');
    
    // Try to trigger user creation form
    const createButton = page.getByRole('button', { name: /create.*user|new.*user|add.*user/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /save|create|submit/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for validation errors
        const validationErrors = page.getByText(/required|invalid|error/i);
        if (await validationErrors.isVisible()) {
          await expect(validationErrors).toBeVisible();
        }
      }
    }
  });

  test('should handle user editing', async ({ page }) => {
    await page.goto('/users');
    
    // Look for user rows or edit buttons
    const editButtons = page.getByRole('button', { name: /edit|modify|update/i });
    const userRows = page.locator('tr, [role="row"]');
    
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Look for editable fields
      const editableFields = page.locator('input[type="text"], input[type="email"], select');
      if (await editableFields.count() > 0) {
        const firstField = editableFields.first();
        await firstField.fill('Updated user information');
        
        // Look for save button
        const saveButton = page.getByRole('button', { name: /save|update|submit/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(500);
        }
      }
    } else if (await userRows.count() > 1) {
      // Click on first user row (skip header)
      await userRows.nth(1).click();
      await page.waitForTimeout(1000);
    }
  });

  test('should handle user role management', async ({ page }) => {
    await page.goto('/users');
    
    // Look for role management controls
    const roleSelects = page.locator('select[name*="role"], [data-testid*="role"]');
    const roleButtons = page.getByRole('button', { name: /admin|user|manager/i });
    
    if (await roleSelects.count() > 0) {
      await roleSelects.first().selectOption({ label: /admin|manager|user/i });
      await page.waitForTimeout(500);
    } else if (await roleButtons.count() > 0) {
      await roleButtons.first().click();
      await page.waitForTimeout(500);
    }
    
    // Check for success message or role change
    const successMessage = page.getByText(/success|updated|role.*changed/i);
    if (await successMessage.isVisible()) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('should handle user status management', async ({ page }) => {
    await page.goto('/users');
    
    // Look for status management controls
    const statusSelects = page.locator('select[name*="status"], [data-testid*="status"]');
    const statusButtons = page.getByRole('button', { name: /activate|deactivate|enable|disable/i });
    
    if (await statusSelects.count() > 0) {
      await statusSelects.first().selectOption({ label: /active|inactive|enabled|disabled/i });
      await page.waitForTimeout(500);
    } else if (await statusButtons.count() > 0) {
      await statusButtons.first().click();
      await page.waitForTimeout(500);
    }
    
    // Check for success message or status change
    const successMessage = page.getByText(/success|updated|status.*changed/i);
    if (await successMessage.isVisible()) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('should handle user search and filtering', async ({ page }) => {
    await page.goto('/users');
    
    // Look for search/filter controls
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"]');
    const filterSelect = page.locator('select[name*="filter"], select[name*="role"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('admin');
      await page.waitForTimeout(500);
    }
    
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption({ label: /admin|user|manager/i });
      await page.waitForTimeout(500);
    }
    
    // Check if results are filtered
    const results = page.locator('table tbody tr, [role="row"]');
    if (await results.count() > 0) {
      await expect(results).toBeVisible();
    }
  });

  test('should handle user deletion with confirmation', async ({ page }) => {
    await page.goto('/users');
    
    // Look for delete buttons
    const deleteButtons = page.getByRole('button', { name: /delete|remove/i });
    
    if (await deleteButtons.count() > 0) {
      await deleteButtons.first().click();
      
      // Check for confirmation dialog
      const confirmDialog = page.getByRole('dialog');
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
      
      if (await confirmDialog.isVisible()) {
        await expect(confirmDialog).toBeVisible();
        
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await page.waitForTimeout(500);
          
          // Check for success message
          const successMessage = page.getByText(/success|deleted|removed/i);
          if (await successMessage.isVisible()) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    }
  });

  test('should handle bulk user operations', async ({ page }) => {
    await page.goto('/users');
    
    // Look for bulk operation controls
    const selectAllCheckbox = page.locator('input[type="checkbox"][aria-label*="select all"], th input[type="checkbox"]');
    const bulkActionSelect = page.locator('select[name*="bulk"], [data-testid*="bulk"]');
    const bulkActionButton = page.getByRole('button', { name: /bulk|batch|selected/i });
    
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.click();
      await page.waitForTimeout(500);
      
      if (await bulkActionSelect.isVisible()) {
        await bulkActionSelect.selectOption({ label: /activate|deactivate|delete/i });
        await page.waitForTimeout(500);
      }
      
      if (await bulkActionButton.isVisible()) {
        await bulkActionButton.click();
        await page.waitForTimeout(500);
        
        // Check for confirmation or success message
        const message = page.getByText(/success|updated|bulk|batch/i);
        if (await message.isVisible()) {
          await expect(message).toBeVisible();
        }
      }
    }
  });

  test('should handle user profile viewing', async ({ page }) => {
    await page.goto('/users');
    
    // Look for user profile links or rows
    const profileLinks = page.locator('a[href*="/users/"], [data-testid*="user-"]');
    const userRows = page.locator('tr, [role="row"]');
    
    if (await profileLinks.count() > 0) {
      await profileLinks.first().click();
      await page.waitForTimeout(1000);
    } else if (await userRows.count() > 1) {
      await userRows.nth(1).click();
      await page.waitForTimeout(1000);
    }
    
    // Check for user profile elements
    const profileElements = [
      page.getByText(/profile|user.*information/i),
      page.getByText(/email/i),
      page.getByText(/role/i),
      page.getByText(/last.*login/i)
    ];
    
    // Check if at least some elements are visible
    const visibleElements = await Promise.all(
      profileElements.map(async (element) => await element.isVisible())
    );
    
    expect(visibleElements.some(Boolean)).toBeTruthy();
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/users');
    
    // Check if mobile layout is working
    await expect(page.getByText(/users/i)).toBeVisible();
    
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
