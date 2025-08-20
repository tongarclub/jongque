import { test, expect } from '@playwright/test';

test.describe('JongQue Core Functionality Tests', () => {
  
  test.describe('Basic Page Loading', () => {
    test('should display homepage with correct content', async ({ page }) => {
      await page.goto('/');
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page).toHaveTitle(/JongQue/);
      
      // Check main heading
      const heroTitle = page.locator('h1').filter({ hasText: 'ยินดีต้อนรับสู่ JongQue' });
      await expect(heroTitle).toBeVisible();
      
      // Check navigation links are present and functional
      const testLinks = [
        '/test-auth',
        '/test-redis', 
        '/test-ui',
        '/test-pwa',
        '/test-google-oauth'
      ];
      
      for (const link of testLinks) {
        await expect(page.locator(`a[href="${link}"]`)).toBeVisible();
      }
      
      // Check main action buttons
      await expect(page.locator('a[href="/signin"]')).toBeVisible();
      await expect(page.locator('a[href="/signup"]')).toBeVisible();
    });

    test('should navigate between pages successfully', async ({ page }) => {
      // Start from homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to signin
      await page.click('a[href="/signin"]');
      await expect(page).toHaveURL('/signin');
      
      // Navigate to signup from signin
      await page.click('a[href="/signup"]');
      await expect(page).toHaveURL('/signup');
      
      // Navigate back to signin from signup
      await page.click('a[href="/signin"]');
      await expect(page).toHaveURL('/signin');
    });
  });

  test.describe('Authentication Pages', () => {
    test('should display signin page correctly', async ({ page }) => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Check URL
      await expect(page).toHaveURL('/signin');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
      
      // Check form elements
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#email')).toHaveAttribute('type', 'email');
      await expect(page.locator('input#email')).toHaveAttribute('required');
      
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.locator('input#password')).toHaveAttribute('type', 'password');
      await expect(page.locator('input#password')).toHaveAttribute('required');
      
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check OAuth buttons
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      await expect(page.locator('button:has-text("Facebook")')).toBeVisible();
      await expect(page.locator('button:has-text("LINE")')).toBeVisible();
    });

    test('should display signup page correctly', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
      
      // Check URL
      await expect(page).toHaveURL('/signup');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('สมัครสมาชิก');
      
      // Check form elements
      await expect(page.locator('input#name')).toBeVisible();
      await expect(page.locator('input#name')).toHaveAttribute('required');
      
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#email')).toHaveAttribute('type', 'email');
      await expect(page.locator('input#email')).toHaveAttribute('required');
      
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.locator('input#password')).toHaveAttribute('type', 'password');
      await expect(page.locator('input#password')).toHaveAttribute('required');
      
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check OAuth buttons
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      await expect(page.locator('button:has-text("Facebook")')).toBeVisible();
      await expect(page.locator('button:has-text("LINE")')).toBeVisible();
    });

    test('should validate form inputs', async ({ page }) => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Test empty form submission
      await page.click('button[type="submit"]');
      
      // Browser should prevent submission due to required fields
      await expect(page).toHaveURL('/signin');
      
      // Test invalid email format
      await page.fill('input#email', 'invalid-email');
      await page.fill('input#password', 'password123');
      await page.click('button[type="submit"]');
      
      // Should still be on signin page due to invalid email
      await expect(page).toHaveURL('/signin');
    });
  });

  test.describe('Test Pages Functionality', () => {
    test('should display all test pages', async ({ page }) => {
      const testPages = [
        '/test-auth',
        '/test-ui',
        '/test-pwa',
        '/test-redis',
        '/test-google-oauth'
      ];
      
      for (const testPage of testPages) {
        await page.goto(testPage);
        await expect(page).toHaveURL(testPage);
        await page.waitForLoadState('networkidle');
        
        // Each test page should have some content
        await expect(page.locator('body')).not.toBeEmpty();
      }
    });

    test('should have functional UI components test page', async ({ page }) => {
      await page.goto('/test-ui');
      await page.waitForLoadState('networkidle');
      
      // Check tab navigation
      await expect(page.locator('button:has-text("Components")')).toBeVisible();
      await expect(page.locator('button:has-text("Forms")')).toBeVisible();
      await expect(page.locator('button:has-text("Layout")')).toBeVisible();
      
      // Test tab switching
      await page.click('button:has-text("Forms")');
      await expect(page.locator('text=Form Elements')).toBeVisible();
      
      await page.click('button:has-text("Components")');
      await expect(page.locator('text=Basic Components')).toBeVisible();
    });

    test('should display Google OAuth test page', async ({ page }) => {
      await page.goto('/test-google-oauth');
      await page.waitForLoadState('networkidle');
      
      // Check main sections
      await expect(page.locator('h1')).toContainText('Google OAuth Testing');
      await expect(page.locator('text=Authentication Status')).toBeVisible();
      await expect(page.locator('text=OAuth Actions')).toBeVisible();
      await expect(page.locator('text=Environment Check')).toBeVisible();
      await expect(page.locator('text=Setup Instructions')).toBeVisible();
    });
  });

  test.describe('API Endpoints', () => {
    test('should have working health endpoints', async ({ page }) => {
      // Test main health endpoint
      const healthResponse = await page.request.get('/api/health');
      expect(healthResponse.status()).toBe(200);
      
      const healthData = await healthResponse.json();
      expect(healthData.status).toBe('ok');
      expect(healthData).toHaveProperty('timestamp');
      
      // Test simple health endpoint
      const simpleHealthResponse = await page.request.get('/api/health-simple');
      expect(simpleHealthResponse.status()).toBe(200);
      
      const simpleHealthText = await simpleHealthResponse.text();
      // Health simple might return JSON instead of plain text
      expect(simpleHealthText).toContain('healthy');
    });

    test('should have NextAuth API endpoints', async ({ page }) => {
      // Test providers endpoint
      const providersResponse = await page.request.get('/api/auth/providers');
      expect(providersResponse.status()).toBe(200);
      
      const providers = await providersResponse.json();
      expect(providers).toHaveProperty('google');
      expect(providers).toHaveProperty('facebook');
      expect(providers).toHaveProperty('credentials');
      
      // Verify provider configurations
      expect(providers.google.name).toBe('Google');
      expect(providers.facebook.name).toBe('Facebook');
      expect(providers.credentials.name).toBe('credentials');
    });

    test('should handle Redis test endpoint', async ({ page }) => {
      const redisResponse = await page.request.get('/api/test/redis');
      // Should respond (either success or error, but not 404)
      expect([200, 500]).toContain(redisResponse.status());
    });
  });

  test.describe('PWA Features', () => {
    test('should load PWA manifest correctly', async ({ page }) => {
      const manifestResponse = await page.request.get('/manifest.json');
      expect(manifestResponse.status()).toBe(200);
      
      const manifest = await manifestResponse.json();
      expect(manifest.name).toBe('JongQue - ระบบจองคิวออนไลน์');
      expect(manifest.short_name).toBe('JongQue');
      expect(manifest.start_url).toBe('/');
      expect(manifest.display).toBe('standalone');
      expect(manifest.theme_color).toBeDefined();
      expect(manifest.background_color).toBeDefined();
      expect(manifest.icons).toBeInstanceOf(Array);
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    test('should have service worker files', async ({ page }) => {
      // Check if service worker file exists
      const swResponse = await page.request.get('/sw.js');
      expect(swResponse.status()).toBe(200);
      
      // Check if manual service worker exists
      const manualSwResponse = await page.request.get('/manual-sw.js');
      expect(manualSwResponse.status()).toBe(200);
    });

    test('should have PWA icons', async ({ page }) => {
      // Test some key icon sizes
      const iconSizes = ['192x192', '512x512'];
      
      for (const size of iconSizes) {
        const iconResponse = await page.request.get(`/icons/icon-${size}.svg`);
        expect(iconResponse.status()).toBe(200);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages', async ({ page }) => {
      const response = await page.goto('/non-existent-page');
      expect(response?.status()).toBe(404);
    });

    test('should display auth error page', async ({ page }) => {
      await page.goto('/error');
      await expect(page).toHaveURL('/error');
      await page.waitForLoadState('networkidle');
    });

    test('should handle unauthorized access', async ({ page }) => {
      await page.goto('/unauthorized');
      await expect(page).toHaveURL('/unauthorized');
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toBeVisible();
      
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toBeVisible();
      
      await page.goto('/test-ui');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});