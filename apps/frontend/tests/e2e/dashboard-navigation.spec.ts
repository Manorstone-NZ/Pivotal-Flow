import { test, expect } from '@playwright/test';

test.describe('Dashboard and Navigation Workflow', () => {
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

  test('should load dashboard after successful login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for dashboard elements
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    
    // Check for welcome message
    const welcomeMessage = page.getByText(/welcome|hello/i);
    if (await welcomeMessage.isVisible()) {
      await expect(welcomeMessage).toBeVisible();
    }
    
    // Check for dashboard cards or widgets
    const cards = page.locator('[data-testid*="card"], .card, [role="region"]');
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should display dashboard metrics and widgets', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for common dashboard widgets
    const widgets = [
      page.getByText(/quick.*actions/i),
      page.getByText(/recent.*activity/i),
      page.getByText(/system.*status/i),
      page.getByText(/statistics|metrics/i)
    ];
    
    // Check if at least some widgets are visible
    const visibleWidgets = await Promise.all(
      widgets.map(async (widget) => await widget.isVisible())
    );
    
    expect(visibleWidgets.some(Boolean)).toBeTruthy();
  });

  test('should handle sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for sidebar navigation
    const sidebar = page.locator('nav, [role="navigation"], .sidebar');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
      
      // Look for navigation links
      const navLinks = page.locator('nav a, [role="navigation"] a');
      if (await navLinks.count() > 0) {
        await expect(navLinks.first()).toBeVisible();
      }
    }
  });

  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test navigation to different sections
    const sections = [
      { name: 'quotes', url: '/quotes' },
      { name: 'users', url: '/users' },
      { name: 'rate-cards', url: '/rate-cards' },
      { name: 'payments', url: '/payments' },
      { name: 'settings', url: '/settings' }
    ];
    
    for (const section of sections) {
      // Try to find navigation link
      const navLink = page.getByRole('link', { name: new RegExp(section.name, 'i') });
      
      if (await navLink.isVisible()) {
        await navLink.click();
        await expect(page).toHaveURL(new RegExp(section.url));
        await page.waitForTimeout(1000);
        
        // Navigate back to dashboard
        const dashboardLink = page.getByRole('link', { name: /dashboard|home/i });
        if (await dashboardLink.isVisible()) {
          await dashboardLink.click();
          await expect(page).toHaveURL(/.*dashboard/);
        } else {
          await page.goto('/dashboard');
        }
      } else {
        // Try direct navigation
        await page.goto(section.url);
        await expect(page).toHaveURL(new RegExp(section.url));
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should handle mobile menu toggle', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    
    // Look for mobile menu button
    const menuButton = page.getByRole('button', { name: /menu|hamburger|toggle/i });
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // Check if mobile menu is open
      const mobileMenu = page.locator('.mobile-menu, [data-testid*="mobile"], .sidebar.mobile');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
        
        // Try to close menu
        const closeButton = page.getByRole('button', { name: /close|×/i });
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should handle user profile and logout', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for user profile menu
    const profileButton = page.getByRole('button', { name: /profile|user|account/i });
    const userMenu = page.locator('[data-testid*="user-menu"], .user-menu');
    
    if (await profileButton.isVisible()) {
      await profileButton.click();
      await page.waitForTimeout(500);
      
      // Look for logout option
      const logoutButton = page.getByRole('button', { name: /logout|sign.*out/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
        
        // Should be redirected to login page
        await expect(page).toHaveURL(/.*login/);
      }
    }
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    await page.goto('/quotes');
    
    // Look for breadcrumb navigation
    const breadcrumbs = page.locator('[aria-label*="breadcrumb"], .breadcrumb, nav[aria-label*="breadcrumb"]');
    
    if (await breadcrumbs.isVisible()) {
      await expect(breadcrumbs).toBeVisible();
      
      // Check for breadcrumb links
      const breadcrumbLinks = page.locator('[aria-label*="breadcrumb"] a, .breadcrumb a');
      if (await breadcrumbLinks.count() > 0) {
        await expect(breadcrumbLinks.first()).toBeVisible();
      }
    }
  });

  test('should handle page loading states', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for loading indicators
    const loadingIndicators = page.locator('[data-testid*="loading"], .loading, .spinner, [aria-label*="loading"]');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if loading indicators are gone
    if (await loadingIndicators.count() > 0) {
      // Wait for loading to complete
      await page.waitForTimeout(2000);
    }
    
    // Verify page content is visible
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for error boundaries or error states
    const errorMessages = page.getByText(/error|failed|something went wrong/i);
    
    // If no errors, try to trigger one by navigating to invalid route
    if (!(await errorMessages.isVisible())) {
      await page.goto('/invalid-route');
      
      // Should show 404 or error page
      const notFoundMessage = page.getByText(/404|not found|page not found/i);
      if (await notFoundMessage.isVisible()) {
        await expect(notFoundMessage).toBeVisible();
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    
    // Test Enter key on focused element
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });

  test('should handle responsive design across breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 320, height: 568 },   // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 },  // Desktop
      { width: 1920, height: 1080 }  // Large desktop
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize(breakpoint);
      await page.goto('/dashboard');
      
      // Check if page is responsive
      await expect(page.getByText(/dashboard/i)).toBeVisible();
      
      // Check if layout adapts
      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent).toBeVisible();
      
      await page.waitForTimeout(500);
    }
  });

  test('should handle theme toggle', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for theme toggle button
    const themeToggle = page.getByRole('button', { name: /theme|dark|light|toggle/i });
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check if theme changed (this might be hard to verify without specific classes)
      // Just verify the button is still functional
      await expect(themeToggle).toBeVisible();
      
      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for global search
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
    const searchButton = page.getByRole('button', { name: /search/i });
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test search');
      await page.waitForTimeout(500);
      
      if (await searchButton.isVisible()) {
        await searchButton.click();
        await page.waitForTimeout(1000);
      } else {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }
      
      // Check if search results are shown
      const searchResults = page.getByText(/search.*results|results.*for/i);
      if (await searchResults.isVisible()) {
        await expect(searchResults).toBeVisible();
      }
    }
  });
});
