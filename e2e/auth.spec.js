/**
 * Authentication E2E Tests
 * 
 * Tests for login, signup, and auth guard functionality
 */

const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder(/email/i).fill('invalid@test.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({ timeout: 10000 });
  });

  test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });

  test('should have link to signup from login page', async ({ page }) => {
    await page.goto('/login');
    
    const signupLink = page.getByRole('link', { name: /sign up|create account/i });
    await expect(signupLink).toBeVisible();
    
    await signupLink.click();
    await expect(page).toHaveURL(/signup/);
  });

  test('should have link to login from signup page', async ({ page }) => {
    await page.goto('/signup');
    
    const loginLink = page.getByRole('link', { name: /sign in|login/i });
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Auth Navigation', () => {
  
  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to login when accessing instructor page', async ({ page }) => {
    await page.goto('/instructor');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
