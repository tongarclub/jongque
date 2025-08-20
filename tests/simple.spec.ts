import { test, expect } from '@playwright/test';

test.describe('JongQue Application - Essential Tests', () => {
  
  test.describe('Basic Functionality', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check if page loads
      await expect(page.locator('body')).toBeAttached();
      
      // Check for main content
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should navigate to test pages', async ({ page }) => {
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
        
        // Check page loads successfully
        await expect(page.locator('body')).toBeAttached();
      }
    });

    test('should load authentication pages', async ({ page }) => {
      // Test signin page
      await page.goto('/signin');
      await expect(page).toHaveURL('/signin');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeAttached();
      
      // Test signup page  
      await page.goto('/signup');
      await expect(page).toHaveURL('/signup');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeAttached();
    });
  });

  test.describe('API Health Checks', () => {
    test('should respond to health endpoints', async ({ page }) => {
      // Test main health endpoint
      const healthResponse = await page.request.get('/api/health');
      expect([200, 503]).toContain(healthResponse.status());
      
      // Test simple health endpoint  
      const simpleResponse = await page.request.get('/api/health-simple');
      expect([200, 503]).toContain(simpleResponse.status());
    });

    test('should have NextAuth providers', async ({ page }) => {
      const response = await page.request.get('/api/auth/providers');
      expect(response.status()).toBe(200);
      
      const providers = await response.json();
      expect(providers).toHaveProperty('google');
      expect(providers).toHaveProperty('facebook');
      expect(providers).toHaveProperty('credentials');
    });
  });

  test.describe('PWA Features', () => {
    test('should have PWA manifest', async ({ page }) => {
      const response = await page.request.get('/manifest.json');
      expect(response.status()).toBe(200);
      
      const manifest = await response.json();
      expect(manifest).toHaveProperty('name');
      expect(manifest).toHaveProperty('short_name');
      expect(manifest).toHaveProperty('start_url');
      expect(manifest).toHaveProperty('display');
    });

    test('should have service worker files', async ({ page }) => {
      // Check main service worker
      const swResponse = await page.request.get('/sw.js');
      expect(swResponse.status()).toBe(200);
      
      // Check manual service worker
      const manualSwResponse = await page.request.get('/manual-sw.js');
      expect(manualSwResponse.status()).toBe(200);
    });

    test('should have PWA icons', async ({ page }) => {
      const iconSizes = ['192x192', '512x512'];
      
      for (const size of iconSizes) {
        const response = await page.request.get(`/icons/icon-${size}.svg`);
        expect(response.status()).toBe(200);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages', async ({ page }) => {
      const response = await page.goto('/non-existent-page');
      expect(response?.status()).toBe(404);
    });

    test('should load error pages', async ({ page }) => {
      await page.goto('/error');
      await expect(page).toHaveURL('/error');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeAttached();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeAttached();
      
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeAttached();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeAttached();
      
      await page.goto('/test-ui');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeAttached();
    });
  });

  test.describe('Performance', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds (generous for CI)
      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe('Security', () => {
    test('should not expose sensitive information', async ({ page }) => {
      const response = await page.request.get('/api/auth/providers');
      const providers = await response.json();
      
      const responseText = JSON.stringify(providers);
      expect(responseText).not.toContain('secret');
      expect(responseText).not.toContain('Secret');
      expect(responseText).not.toContain('password');
    });
  });
});
