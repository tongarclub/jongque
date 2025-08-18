import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page title contains expected text
    await expect(page).toHaveTitle(/JongQue/);
    
    // Check if main content elements are present
    const heroTitle = page.locator('h1').filter({ hasText: 'ยินดีต้อนรับสู่ JongQue' });
    const authTestLink = page.locator('a[href="/test-auth"]');
    
    await expect(heroTitle).toBeVisible();
    await expect(authTestLink).toBeVisible();
  });

  test('signin page loads successfully', async ({ page }) => {
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    
    // Check if login form elements are present
    const emailInput = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('signup page loads successfully', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Check if registration form elements are present
    const nameInput = page.locator('input#name');
    const emailInput = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('PWA manifest is accessible', async ({ page }) => {
    const response = await page.request.get('/manifest.json');
    expect(response.ok()).toBeTruthy();
    
    const manifest = await response.json();
    expect(manifest.name).toBeDefined();
    expect(manifest.start_url).toBeDefined();
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('health check endpoints work', async ({ page }) => {
    const healthResponse = await page.request.get('/api/health');
    expect(healthResponse.ok()).toBeTruthy();
    
    const healthData = await healthResponse.json();
    expect(healthData.status).toBe('healthy');
  });

  test('OAuth providers are configured on signin page', async ({ page }) => {
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    
    // Check if OAuth buttons are present
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    const facebookButton = page.locator('button').filter({ hasText: 'Facebook' });
    const lineButton = page.locator('button').filter({ hasText: 'LINE' });
    
    await expect(googleButton).toBeVisible();
    await expect(facebookButton).toBeVisible();
    await expect(lineButton).toBeVisible();
  });
});
