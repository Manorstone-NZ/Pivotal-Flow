import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  email: 'admin@pivotalflow.com',
  password: 'password123!extra'
};

const timeEntryData = {
  description: 'E2E Test: Frontend development work',
  duration: 480, // 8 hours in minutes
  activityType: 'development'
};

test.describe('Time Approvals Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login with test credentials
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should complete time entry submission and approval flow', async ({ page }) => {
    // Step 1: Navigate to time tracking page
    await page.click('[data-testid="nav-time"]');
    await expect(page.locator('h1')).toContainText('Time Tracking');
    
    // Verify page loads with expected elements
    await expect(page.locator('[data-testid="week-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-time-entry-button"]')).toBeVisible();

    // Step 2: Add a new time entry
    await page.click('[data-testid="add-time-entry-button"]');
    
    // Fill in time entry form (assuming modal opens)
    await page.fill('[data-testid="time-entry-description"]', timeEntryData.description);
    await page.fill('[data-testid="time-entry-duration"]', timeEntryData.duration.toString());
    await page.selectOption('[data-testid="time-entry-activity-type"]', timeEntryData.activityType);
    
    // Save the entry
    await page.click('[data-testid="save-time-entry-button"]');
    
    // Verify entry appears in the grid
    await expect(page.locator('[data-testid="time-entry"]').filter({ hasText: timeEntryData.description })).toBeVisible();

    // Step 3: Submit the entry for approval
    await page.click('[data-testid="time-entry"] [data-testid="submit-button"]');
    
    // Confirm submission
    await page.click('[data-testid="confirm-submit-button"]');
    
    // Verify status changed to submitted
    await expect(page.locator('[data-testid="time-entry-status"]')).toContainText('submitted');

    // Step 4: Navigate to approvals page
    await page.click('[data-testid="nav-approvals-time"]');
    await expect(page.locator('h1')).toContainText('Time Approvals');
    
    // Verify the submitted entry appears in approvals queue
    await expect(page.locator('[data-testid="approval-item"]').filter({ hasText: timeEntryData.description })).toBeVisible();

    // Step 5: Approve the entry
    const approvalItem = page.locator('[data-testid="approval-item"]').filter({ hasText: timeEntryData.description });
    await approvalItem.locator('[data-testid="approve-button"]').click();
    
    // Add approval comments
    await page.fill('[data-testid="approval-comments"]', 'E2E Test: Approved automatically');
    await page.click('[data-testid="confirm-approve-button"]');
    
    // Verify entry is removed from pending approvals
    await expect(approvalItem).not.toBeVisible();

    // Step 6: Verify approval in time tracking page
    await page.click('[data-testid="nav-time"]');
    
    // Check that the entry now shows as approved
    const timeEntry = page.locator('[data-testid="time-entry"]').filter({ hasText: timeEntryData.description });
    await expect(timeEntry.locator('[data-testid="time-entry-status"]')).toContainText('approved');
  });

  test('should handle bulk approval of multiple entries', async ({ page }) => {
    // Navigate to approvals page
    await page.click('[data-testid="nav-approvals-time"]');
    await expect(page.locator('h1')).toContainText('Time Approvals');
    
    // Check if there are pending approvals
    const approvalItems = page.locator('[data-testid="approval-item"]');
    const itemCount = await approvalItems.count();
    
    if (itemCount > 0) {
      // Select all items
      await page.click('[data-testid="select-all-checkbox"]');
      
      // Verify all items are selected
      const checkboxes = page.locator('[data-testid="approval-item-checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      for (let i = 0; i < checkboxCount; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
      
      // Bulk approve
      await page.click('[data-testid="bulk-approve-button"]');
      
      // Add bulk approval comments
      await page.fill('[data-testid="approval-comments"]', 'E2E Test: Bulk approval');
      await page.click('[data-testid="confirm-approve-button"]');
      
      // Verify items are removed from queue
      await expect(page.locator('[data-testid="approval-item"]')).toHaveCount(0);
      
      // Verify empty state message
      await expect(page.locator('[data-testid="empty-approvals-message"]')).toContainText('No pending approvals');
    } else {
      // Skip test if no pending approvals
      test.skip(itemCount === 0, 'No pending approvals to test bulk approval');
    }
  });

  test('should handle rejection with reason', async ({ page }) => {
    // First, create a time entry to reject (similar to first test)
    await page.click('[data-testid="nav-time"]');
    await page.click('[data-testid="add-time-entry-button"]');
    
    await page.fill('[data-testid="time-entry-description"]', 'E2E Test: Entry to be rejected');
    await page.fill('[data-testid="time-entry-duration"]', '600'); // 10 hours - excessive
    
    await page.click('[data-testid="save-time-entry-button"]');
    await page.click('[data-testid="time-entry"] [data-testid="submit-button"]');
    await page.click('[data-testid="confirm-submit-button"]');
    
    // Navigate to approvals
    await page.click('[data-testid="nav-approvals-time"]');
    
    // Find and reject the entry
    const approvalItem = page.locator('[data-testid="approval-item"]').filter({ hasText: 'Entry to be rejected' });
    await approvalItem.locator('[data-testid="reject-button"]').click();
    
    // Select rejection reason
    await page.selectOption('[data-testid="rejection-reason-select"]', 'Time allocation seems excessive');
    
    // Add additional comments
    await page.fill('[data-testid="rejection-comments"]', 'E2E Test: 10 hours seems too much for this task');
    
    // Confirm rejection
    await page.click('[data-testid="confirm-reject-button"]');
    
    // Verify entry is removed from approvals
    await expect(approvalItem).not.toBeVisible();
    
    // Navigate back to time tracking to verify rejection
    await page.click('[data-testid="nav-time"]');
    
    const rejectedEntry = page.locator('[data-testid="time-entry"]').filter({ hasText: 'Entry to be rejected' });
    await expect(rejectedEntry.locator('[data-testid="time-entry-status"]')).toContainText('rejected');
    
    // Verify rejection reason is displayed
    await expect(rejectedEntry.locator('[data-testid="rejection-reason"]')).toContainText('Time allocation seems excessive');
  });

  test('should display correct approval statistics', async ({ page }) => {
    // Navigate to approvals page
    await page.click('[data-testid="nav-approvals-time"]');
    
    // Check that stats cards are present
    await expect(page.locator('[data-testid="pending-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="approved-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="rejected-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-hours"]')).toBeVisible();
    
    // Verify stats are numeric
    const pendingCount = await page.locator('[data-testid="pending-count"]').textContent();
    expect(pendingCount).toMatch(/^\d+$/);
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Navigate to approvals page
    await page.click('[data-testid="nav-approvals-time"]');
    
    // Test select all shortcut (Ctrl+Shift+A)
    await page.keyboard.press('Control+Shift+A');
    
    // Verify all items are selected (if any exist)
    const approvalItems = page.locator('[data-testid="approval-item"]');
    const itemCount = await approvalItems.count();
    
    if (itemCount > 0) {
      const checkboxes = page.locator('[data-testid="approval-item-checkbox"]');
      for (let i = 0; i < itemCount; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
    }
    
    // Test refresh shortcut (F5)
    await page.keyboard.press('F5');
    
    // Wait for page to reload and verify we're still on approvals page
    await expect(page.locator('h1')).toContainText('Time Approvals');
  });

  test('should be accessible', async ({ page }) => {
    // Navigate to time tracking page
    await page.click('[data-testid="nav-time"]');
    
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for proper ARIA labels on interactive elements
    await expect(page.locator('[data-testid="add-time-entry-button"]')).toHaveAttribute('aria-label');
    
    // Navigate to approvals page
    await page.click('[data-testid="nav-approvals-time"]');
    
    // Check approval buttons have proper labels
    const approveButtons = page.locator('[data-testid="approve-button"]');
    const approveButtonCount = await approveButtons.count();
    
    if (approveButtonCount > 0) {
      await expect(approveButtons.first()).toHaveAttribute('aria-label');
    }
    
    // Check modal accessibility when opened
    if (approveButtonCount > 0) {
      await approveButtons.first().click();
      
      // Check modal has proper focus management
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('[role="dialog"]')).toBeFocused();
      
      // Close modal
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network failure for time entries
    await page.route('**/api/v1/time-entries*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Navigate to time tracking page
    await page.click('[data-testid="nav-time"]');
    
    // Verify error state is displayed
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load');
    
    // Verify retry button is present
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    
    // Clear the route mock
    await page.unroute('**/api/v1/time-entries*');
    
    // Test retry functionality
    await page.click('[data-testid="retry-button"]');
    
    // Verify data loads after retry
    await expect(page.locator('[data-testid="week-grid"]')).toBeVisible();
  });
});

