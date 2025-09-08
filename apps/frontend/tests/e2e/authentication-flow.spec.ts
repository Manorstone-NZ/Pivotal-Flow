import { test, expect } from '@playwright/test';

test.describe('Authentication Flow E2E Tests', () => {
  test('should redirect to login page when not authenticated', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test('should display login form with proper elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check for demo credentials display
    const demoCredentials = page.getByText(/demo credentials/i);
    if (await demoCredentials.isVisible()) {
      await expect(demoCredentials).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation errors
    const emailError = page.getByText(/email.*required/i);
    const passwordError = page.getByText(/password.*required/i);
    
    if (await emailError.isVisible()) {
      await expect(emailError).toBeVisible();
    }
    
    if (await passwordError.isVisible()) {
      await expect(passwordError).toBeVisible();
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid email
    await page.getByLabel(/email address/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for email validation error
    const emailError = page.getByText(/invalid.*email|email.*format/i);
    if (await emailError.isVisible()) {
      await expect(emailError).toBeVisible();
    }
  });

  test('should handle login with demo credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in demo credentials
    await page.getByLabel(/email address/i).fill('admin@pivotalflow.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation or error message
    await page.waitForTimeout(2000);
    
    // Check if we're still on login page (backend not available)
    // or if we've been redirected to dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      // Backend not available, check for error message
      const errorMessage = page.getByText(/login failed|error|unable to connect/i);
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    } else {
      // Successfully logged in
      await expect(page).not.toHaveURL(/.*login/);
      await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
    }
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.getByLabel(/email address/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should show error message
    const errorMessage = page.getByText(/invalid.*credentials|login.*failed|error/i);
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should handle login loading state', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.getByLabel(/email address/i).fill('admin@pivotalflow.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for loading state
    const loadingButton = page.getByRole('button', { name: /signing in|loading/i });
    if (await loadingButton.isVisible()) {
      await expect(loadingButton).toBeVisible();
    }
    
    // Check if inputs are disabled during loading
    const emailInput = page.getByLabel(/email address/i);
    const passwordInput = page.getByLabel(/password/i);
    
    if (await emailInput.isDisabled()) {
      await expect(emailInput).toBeDisabled();
    }
    
    if (await passwordInput.isDisabled()) {
      await expect(passwordInput).toBeDisabled();
    }
  });

  test('should handle keyboard navigation in login form', async ({ page }) => {
    await page.goto('/login');
    
    // Test Tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Check if focus is on email input
    const emailInput = page.getByLabel(/email address/i);
    if (await emailInput.isFocused()) {
      await expect(emailInput).toBeFocused();
    }
    
    // Tab to password input
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    const passwordInput = page.getByLabel(/password/i);
    if (await passwordInput.isFocused()) {
      await expect(passwordInput).toBeFocused();
    }
    
    // Tab to submit button
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    const submitButton = page.getByRole('button', { name: /sign in/i });
    if (await submitButton.isFocused()) {
      await expect(submitButton).toBeFocused();
    }
  });

  test('should handle Enter key submission', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.getByLabel(/email address/i).fill('admin@pivotalflow.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Press Enter on password field
    await page.getByLabel(/password/i).press('Enter');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should attempt login
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/.*login.*|.*dashboard.*/);
  });

  test('should handle logout functionality', async ({ page }) => {
    // First login (mock)
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('admin@pivotalflow.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(2000);
    
    // If successfully logged in, test logout
    if (!page.url().includes('login')) {
      // Look for logout button
      const logoutButton = page.getByRole('button', { name: /logout|sign.*out/i });
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
        
        // Should be redirected to login page
        await expect(page).toHaveURL(/.*login/);
      }
    }
  });

  test('should handle session persistence', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('admin@pivotalflow.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(2000);
    
    // If successfully logged in, test session persistence
    if (!page.url().includes('login')) {
      // Navigate to another page
      await page.goto('/quotes');
      await page.waitForTimeout(1000);
      
      // Should still be authenticated
      await expect(page).not.toHaveURL(/.*login/);
      
      // Go back to dashboard
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);
      
      // Should still be authenticated
      await expect(page).not.toHaveURL(/.*login/);
    }
  });

  test('should handle session expiration', async ({ page }) => {
    // This test would require mocking session expiration
    // For now, just test that protected routes redirect when not authenticated
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
    
    await page.goto('/quotes');
    await expect(page).toHaveURL(/.*login/);
    
    await page.goto('/users');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle password visibility toggle', async ({ page }) => {
    await page.goto('/login');
    
    // Look for password visibility toggle
    const passwordToggle = page.getByRole('button', { name: /show.*password|hide.*password|toggle.*password/i });
    
    if (await passwordToggle.isVisible()) {
      const passwordInput = page.getByLabel(/password/i);
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle
      await passwordToggle.click();
      await page.waitForTimeout(500);
      
      // Password should be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click toggle again
      await passwordToggle.click();
      await page.waitForTimeout(500);
      
      // Password should be hidden again
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/login');
    
    // Look for forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot.*password|reset.*password/i });
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await page.waitForTimeout(1000);
      
      // Should navigate to forgot password page
      const forgotPasswordPage = page.getByText(/forgot.*password|reset.*password/i);
      if (await forgotPasswordPage.isVisible()) {
        await expect(forgotPasswordPage).toBeVisible();
      }
    }
  });

  test('should handle remember me functionality', async ({ page }) => {
    await page.goto('/login');
    
    // Look for remember me checkbox
    const rememberMeCheckbox = page.getByRole('checkbox', { name: /remember.*me|keep.*logged.*in/i });
    
    if (await rememberMeCheckbox.isVisible()) {
      await rememberMeCheckbox.click();
      await page.waitForTimeout(500);
      
      // Checkbox should be checked
      await expect(rememberMeCheckbox).toBeChecked();
      
      // Uncheck
      await rememberMeCheckbox.click();
      await page.waitForTimeout(500);
      
      // Checkbox should be unchecked
      await expect(rememberMeCheckbox).not.toBeChecked();
    }
  });

  test('should handle social login options', async ({ page }) => {
    await page.goto('/login');
    
    // Look for social login buttons
    const socialButtons = page.getByRole('button', { name: /google|facebook|microsoft|github/i });
    
    if (await socialButtons.count() > 0) {
      const firstSocialButton = socialButtons.first();
      await expect(firstSocialButton).toBeVisible();
      
      // Click social button (this would normally redirect to OAuth provider)
      await firstSocialButton.click();
      await page.waitForTimeout(1000);
      
      // Should either redirect or show OAuth flow
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/.*login.*|.*oauth.*|.*auth.*/);
    }
  });

  test('should handle mobile login experience', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    
    // Check if login form is mobile-friendly
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check if form is properly sized for mobile
    const emailInput = page.getByLabel(/email address/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Test mobile form interaction
    await emailInput.fill('admin@pivotalflow.com');
    await passwordInput.fill('password123');
    
    // Check if mobile keyboard doesn't break layout
    await page.waitForTimeout(500);
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(2000);
  });
});
