/**
 * Projects E2E Tests
 * Playwright tests for the projects workflow (login → list → filters → details)
 */

import { test, expect } from '@playwright/test';

test.describe('Projects Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5173/login');
    
    // Wait for login form to be visible
    await expect(page.locator('form')).toBeVisible();
    
    // Fill in login credentials
    await page.fill('input[type="email"]', 'admin@pivotalflow.com');
    await page.fill('input[type="password"]', 'password123!extra');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for successful login (could redirect to dashboard or root)
    await page.waitForURL(/.*\/(dashboard|$)/, { timeout: 10000 });
    
    // Wait for authenticated page to load (dashboard or landing)
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to projects page from sidebar', async ({ page }) => {
    // Click on Projects in sidebar
    await page.click('a[href="/projects"]');
    
    // Wait for projects page to load
    await expect(page).toHaveURL(/.*\/projects/);
    await expect(page.locator('h1')).toContainText('Projects');
  });

  test('should display projects list with proper elements', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check for search input
    await expect(page.locator('input[placeholder*="Search projects"]')).toBeVisible();
    
    // Check for status filter dropdown
    await expect(page.locator('select')).toBeVisible();
    
    // Check for Create Project button
    await expect(page.locator('button:has-text("Create Project")')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search projects"]');
    await searchInput.fill('test');
    
    // Check that search input has the value
    await expect(searchInput).toHaveValue('test');
  });

  test('should handle status filter', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Select status filter
    const statusFilter = page.locator('select');
    await statusFilter.selectOption('active');
    
    // Check that filter is selected
    await expect(statusFilter).toHaveValue('active');
  });

  test('should display table headers correctly', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check for table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Start Date")')).toBeVisible();
    await expect(page.locator('th:has-text("End Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Created")')).toBeVisible();
  });

  test('should handle table sorting', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Click on Name header to sort
    await page.click('th:has-text("Name")');
    
    // Check that sorting indicator appears (arrow)
    await expect(page.locator('th:has-text("Name") span')).toBeVisible();
  });

  test('should navigate to project detail page', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check if there are any project rows
    const projectRows = page.locator('tbody tr');
    const rowCount = await projectRows.count();
    
    if (rowCount > 0) {
      // Click on first project row
      await projectRows.first().click();
      
      // Wait for navigation to project detail page
      await expect(page).toHaveURL(/.*\/projects\/[^\/]+$/);
      
      // Check for project detail elements
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('button:has-text("Back to Projects")')).toBeVisible();
      await expect(page.locator('button:has-text("Edit Project")')).toBeVisible();
    } else {
      // If no projects, check for empty state
      await expect(page.locator('text=No projects')).toBeVisible();
    }
  });

  test('should handle project detail page elements', async ({ page }) => {
    // Navigate to projects page first
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check if there are any project rows
    const projectRows = page.locator('tbody tr');
    const rowCount = await projectRows.count();
    
    if (rowCount > 0) {
      // Click on first project row
      await projectRows.first().click();
      
      // Wait for navigation to project detail page
      await expect(page).toHaveURL(/.*\/projects\/[^\/]+$/);
      
      // Check for project detail sections
      await expect(page.locator('h2:has-text("Project Overview")')).toBeVisible();
      await expect(page.locator('h2:has-text("Project Information")')).toBeVisible();
      await expect(page.locator('h2:has-text("Quick Actions")')).toBeVisible();
      
      // Check for status chip
      await expect(page.locator('[role="status"]')).toBeVisible();
    }
  });

  test('should navigate back to projects list from detail page', async ({ page }) => {
    // Navigate to projects page first
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check if there are any project rows
    const projectRows = page.locator('tbody tr');
    const rowCount = await projectRows.count();
    
    if (rowCount > 0) {
      // Click on first project row
      await projectRows.first().click();
      
      // Wait for navigation to project detail page
      await expect(page).toHaveURL(/.*\/projects\/[^\/]+$/);
      
      // Click back button
      await page.click('button:has-text("Back to Projects")');
      
      // Wait for navigation back to projects list
      await expect(page).toHaveURL(/.*\/projects$/);
      await expect(page.locator('h1')).toContainText('Projects');
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Test keyboard navigation on table headers
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Press Enter on focused element (should be a sortable header)
    await page.keyboard.press('Enter');
    
    // Check that sorting indicator appears
    await expect(page.locator('th span')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check that elements are still visible on mobile
    await expect(page.locator('input[placeholder*="Search projects"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Project")')).toBeVisible();
    
    // Check that table is horizontally scrollable
    const tableContainer = page.locator('.overflow-x-auto');
    await expect(tableContainer).toBeVisible();
  });

  test('should handle accessibility features', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for table accessibility
    await expect(page.locator('table[role="table"]')).toBeVisible();
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
    
    // Check for proper ARIA labels
    const table = page.locator('table');
    await expect(table).toHaveAttribute('aria-label', 'Projects table');
    
    // Check for sortable headers
    const sortableHeaders = page.locator('th[role="columnheader"]');
    const headerCount = await sortableHeaders.count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/projects');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check if there's an error state or empty state
    const hasError = await page.locator('text=Error').isVisible();
    const hasEmpty = await page.locator('text=No projects').isVisible();
    const hasTable = await page.locator('table').isVisible();
    
    // At least one of these should be true
    expect(hasError || hasEmpty || hasTable).toBeTruthy();
  });
});

