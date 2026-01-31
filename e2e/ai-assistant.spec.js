/**
 * AI Assistant E2E Tests
 * 
 * Tests for the AI mentor chat interface
 */

const { test, expect } = require('@playwright/test');

test.describe('AI Assistant (Unauthenticated)', () => {
  
  test('should redirect to login when trying to access stage', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});

// These tests require authentication - documented for manual testing
test.describe('AI Assistant Features', () => {
  
  test.skip(({ }) => true, 'Requires authenticated session with project - run manually');

  test('should display AI tab in sidebar', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Look for AI tab
    const aiTab = page.getByRole('button', { name: /ai/i });
    await expect(aiTab).toBeVisible();
  });

  test('should show project selection prompt when no project', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Click AI tab
    await page.getByRole('button', { name: /ai/i }).click();
    
    // Should prompt to select project
    await expect(page.getByText(/select a project/i)).toBeVisible();
  });

  test('should display quick actions after project selected', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Click AI tab
    await page.getByRole('button', { name: /ai/i }).click();
    
    // After project is selected, quick actions should appear
    await expect(page.getByText(/help me prepare/i)).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    await page.goto('/stage/empathise');
    
    // Click AI tab
    await page.getByRole('button', { name: /ai/i }).click();
    
    // Type and send message
    await page.getByPlaceholder(/ask me anything/i).fill('How do I start my research?');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should show loading state
    await expect(page.getByText(/thinking/i)).toBeVisible();
    
    // Should eventually show response
    await expect(page.getByText(/research|interview|user/i)).toBeVisible({ timeout: 30000 });
  });
});
