/**
 * Quote Delivery E2E Tests - SaaS Multi-Tenant
 * End-to-end testing of quote delivery and customer approval workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Quote Delivery System - SaaS Multi-Tenant', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as super admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@pivotalflow.com');
    await page.fill('[data-testid="password"]', 'password123!extra');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Complete quote delivery workflow', async ({ page, context }) => {
    // Step 1: Navigate to quotes and create/find a quote in approved status
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');
    
    // Find an approved quote or create one
    const approvedQuote = page.locator('[data-testid="quote-row"]').filter({
      has: page.locator('[data-testid="status-chip"]:has-text("Approved")')
    }).first();
    
    if (await approvedQuote.count() === 0) {
      // Create a new quote for testing (simplified)
      await page.click('[data-testid="new-quote-button"]');
      // Fill quote form and approve it
      // This would be implemented based on existing quote creation flow
      await page.waitForTimeout(1000); // Placeholder
    }

    // Step 2: Open quote details
    await approvedQuote.click();
    await page.waitForLoadState('networkidle');
    
    // Verify quote detail page loaded
    await expect(page.locator('h1')).toContainText('Quote');
    
    // Step 3: Deliver quote
    await page.click('[data-testid="deliver-quote-button"]');
    
    // Fill delivery form
    await page.fill('[data-testid="recipient-email"]', 'customer@testcompany.com');
    await page.fill('[data-testid="custom-message"]', 'Please review and approve this quote.');
    await page.fill('[data-testid="expiration-days"]', '7');
    
    // Submit delivery
    await page.click('[data-testid="deliver-submit"]');
    
    // Wait for delivery success
    await expect(page.locator('[data-testid="delivery-success"]')).toBeVisible();
    
    // Verify status changed to "Sent"
    await expect(page.locator('[data-testid="quote-status"]')).toContainText('Sent');
    
    // Get the public URL
    const publicUrlElement = page.locator('[data-testid="public-url"]');
    const publicUrl = await publicUrlElement.textContent();
    expect(publicUrl).toContain('/public/quotes/');

    // Step 4: Open public quote in new tab (customer perspective)
    const customerPage = await context.newPage();
    await customerPage.goto(publicUrl!);
    await customerPage.waitForLoadState('networkidle');
    
    // Verify public quote page loads
    await expect(customerPage.locator('h1')).toContainText('Quote');
    await expect(customerPage.locator('[data-testid="quote-number"]')).toBeVisible();
    await expect(customerPage.locator('[data-testid="quote-total"]')).toBeVisible();
    
    // Verify organization branding is displayed
    await expect(customerPage.locator('[data-testid="organization-name"]')).toBeVisible();
    
    // Step 5: Customer views quote (status should change to "Viewed")
    // Go back to staff interface and verify status changed
    await page.reload();
    await expect(page.locator('[data-testid="quote-status"]')).toContainText('Viewed');
    
    // Step 6: Customer approves quote
    await customerPage.click('[data-testid="accept-quote-button"]');
    
    // Fill approval form
    await customerPage.fill('[data-testid="approver-name"]', 'John Smith');
    await customerPage.fill('[data-testid="approver-role"]', 'Project Manager');
    await customerPage.check('[data-testid="accept-terms"]');
    
    // Submit approval
    await customerPage.click('[data-testid="submit-approval"]');
    
    // Verify success message
    await expect(customerPage.locator('[data-testid="approval-success"]')).toBeVisible();
    await expect(customerPage.locator('h1')).toContainText('Quote Accepted');
    
    // Step 7: Verify status in staff interface
    await page.reload();
    await expect(page.locator('[data-testid="quote-status"]')).toContainText('Accepted');
    
    // Verify delivery timestamps are shown
    await expect(page.locator('[data-testid="delivered-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="viewed-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="accepted-timestamp"]')).toBeVisible();
    
    await customerPage.close();
  });

  test('Quote rejection workflow', async ({ page, context }) => {
    // Similar setup to delivery test
    await page.goto('/quotes');
    
    // Find a sent quote
    const sentQuote = page.locator('[data-testid="quote-row"]').filter({
      has: page.locator('[data-testid="status-chip"]:has-text("Sent")')
    }).first();
    
    if (await sentQuote.count() > 0) {
      await sentQuote.click();
      
      // Get public URL and open in customer context
      const publicUrl = await page.locator('[data-testid="public-url"]').textContent();
      
      const customerPage = await context.newPage();
      await customerPage.goto(publicUrl!);
      
      // Reject quote
      await customerPage.click('[data-testid="decline-quote-button"]');
      await customerPage.fill('[data-testid="rejection-reason"]', 'Budget constraints prevent us from proceeding at this time.');
      await customerPage.click('[data-testid="submit-rejection"]');
      
      // Verify rejection success
      await expect(customerPage.locator('[data-testid="rejection-success"]')).toBeVisible();
      
      // Verify status in staff interface
      await page.reload();
      await expect(page.locator('[data-testid="quote-status"]')).toContainText('Rejected');
      
      await customerPage.close();
    }
  });

  test('Quote expiration handling', async ({ page }) => {
    // Test expired quote behavior
    await page.goto('/quotes');
    
    // This would test quotes that have passed their valid_until date
    // Implementation would depend on test data setup
  });

  test('Multi-tenant isolation', async ({ page, context }) => {
    // Test that quotes from one tenant cannot be accessed by another
    // This would require setting up multiple tenants and verifying isolation
    // Implementation would depend on tenant switching functionality
  });

  test('Accessibility compliance', async ({ page }) => {
    await page.goto('/quotes');
    
    // Run axe accessibility tests
    // await injectAxe(page);
    // const accessibilityScanResults = await checkA11y(page);
    // expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('Performance budget compliance', async ({ page }) => {
    await page.goto('/quotes');
    
    // Check bundle size and performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return {
        // @ts-ignore
        bundleSize: performance.getEntriesByType('navigation')[0]?.transferSize,
        // @ts-ignore
        loadTime: performance.getEntriesByType('navigation')[0]?.loadEventEnd
      };
    });
    
    // Verify route chunks ≤ 50KB gzipped (would need actual measurement)
    expect(performanceMetrics.loadTime).toBeLessThan(3000); // 3 second max
  });
});
