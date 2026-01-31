/**
 * Course Player E2E Tests
 * 
 * Tests for video player, progress tracking, and navigation
 */

const { test, expect } = require('@playwright/test');

// Test with authenticated user
test.describe('Course Player (Authenticated)', () => {
  
  // Skip these tests if running without auth setup
  test.skip(({ browserName }) => true, 'Requires authenticated session - run manually');

  test('should display course header when viewing a stage', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Course header should be visible
    await expect(page.getByText(/design thinking/i)).toBeVisible();
  });

  test('should show video player when content is available', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Look for video element or player container
    const videoPlayer = page.locator('[class*="video"]');
    await expect(videoPlayer.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have sidebar with tabs', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Should have Content, Project, AI tabs
    await expect(page.getByText(/content/i)).toBeVisible();
  });
});

// Tests that work without auth (public pages)
test.describe('Navigation', () => {
  
  test('should have working home page', async ({ page }) => {
    await page.goto('/');
    
    // Check page loads without error
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('should load login page quickly', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login');
    const loadTime = Date.now() - start;
    
    // Page should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
