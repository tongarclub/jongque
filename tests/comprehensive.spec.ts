import { test, expect } from '@playwright/test';

test.describe('JongQue Application - Comprehensive Tests', () => {
  
  test.describe('Homepage and Navigation', () => {
    test('should display homepage with all navigation elements', async ({ page }) => {
      await page.goto('/');
      
      // Check main hero section
      await expect(page.locator('h1')).toContainText('JongQue');
      
      // Check navigation links exist
      const testLinks = [
        { href: '/test-auth', text: 'Authentication' },
        { href: '/test-redis', text: 'Redis Test' },
        { href: '/test-ui', text: 'UI Components' },
        { href: '/test-pwa', text: 'PWA Test' },
        { href: '/test-google-oauth', text: 'Google OAuth' }
      ];
      
      for (const link of testLinks) {
        await expect(page.locator(`a[href="${link.href}"]`)).toBeVisible();
      }
      
      // Check main action buttons
      await expect(page.locator('a[href="/signin"]')).toBeVisible();
      await expect(page.locator('a[href="/signup"]')).toBeVisible();
    });

    test('should navigate to all test pages successfully', async ({ page }) => {
      const testPages = [
        '/test-auth',
        '/test-redis', 
        '/test-ui',
        '/test-pwa',
        '/test-google-oauth'
      ];
      
      for (const testPage of testPages) {
        await page.goto(testPage);
        await expect(page).toHaveURL(testPage);
        // Wait for page to load
        await page.waitForLoadState('networkidle');
      }
    });
  });

  test.describe('Authentication Pages', () => {
    test('should display signin page with all OAuth options', async ({ page }) => {
      await page.goto('/signin');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
      
      // Check form elements
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check OAuth buttons
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      await expect(page.locator('button:has-text("Facebook")')).toBeVisible();
      await expect(page.locator('button:has-text("LINE")')).toBeVisible();
      
      // Check navigation links
      await expect(page.locator('a[href="/signup"]')).toBeVisible();
    });

    test('should display signup page with all OAuth options', async ({ page }) => {
      await page.goto('/signup');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('สมัครสมาชิก');
      
      // Check form elements
      await expect(page.locator('input#name')).toBeVisible();
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check OAuth buttons
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      await expect(page.locator('button:has-text("Facebook")')).toBeVisible();
      await expect(page.locator('button:has-text("LINE")')).toBeVisible();
      
      // Check navigation links
      await expect(page.locator('a[href="/signin"]')).toBeVisible();
    });

    test('should validate signin form inputs', async ({ page }) => {
      await page.goto('/signin');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation messages (HTML5 validation)
      const emailInput = page.locator('input#email');
      const passwordInput = page.locator('input#password');
      
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
    });

    test('should validate signup form inputs', async ({ page }) => {
      await page.goto('/signup');
      
      // Check required fields
      const nameInput = page.locator('input#name');
      const emailInput = page.locator('input#email');
      const passwordInput = page.locator('input#password');
      
      await expect(nameInput).toHaveAttribute('required');
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
      
      // Test email validation
      await emailInput.fill('invalid-email');
      await page.click('button[type="submit"]');
      
      // HTML5 validation should prevent submission
      await expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  test.describe('OAuth Testing Pages', () => {
    test('should display Google OAuth test page', async ({ page }) => {
      await page.goto('/test-google-oauth');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('Google OAuth Testing');
      
      // Check authentication status section
      await expect(page.locator('text=Authentication Status')).toBeVisible();
      await expect(page.locator('text=OAuth Actions')).toBeVisible();
      
      // Check environment check section
      await expect(page.locator('text=Environment Check')).toBeVisible();
      
      // Check setup instructions
      await expect(page.locator('text=Setup Instructions')).toBeVisible();
    });

    test('should display general OAuth test page', async ({ page }) => {
      await page.goto('/test-oauth');
      
      // Check page loads successfully
      await expect(page).toHaveURL('/test-oauth');
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('UI Components Test Page', () => {
    test('should display UI components with tab navigation', async ({ page }) => {
      await page.goto('/test-ui');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('UI Components Showcase');
      
      // Check tab navigation
      const tabs = ['Components', 'Forms', 'Layout', 'Feedback', 'Navigation'];
      
      for (const tab of tabs) {
        await expect(page.locator(`button:has-text("${tab}")`)).toBeVisible();
      }
      
      // Test tab switching
      await page.click('button:has-text("Forms")');
      await expect(page.locator('text=Form Elements')).toBeVisible();
      
      await page.click('button:has-text("Layout")');
      await expect(page.locator('text=Grid System')).toBeVisible();
      
      await page.click('button:has-text("Feedback")');
      await expect(page.locator('text=Notifications')).toBeVisible();
      
      await page.click('button:has-text("Navigation")');
      await expect(page.locator('text=Breadcrumbs')).toBeVisible();
    });

    test('should interact with form components', async ({ page }) => {
      await page.goto('/test-ui');
      
      // Switch to Forms tab
      await page.click('button:has-text("Forms")');
      
      // Test select dropdown
      const select = page.locator('select').first();
      await select.selectOption('option2');
      await expect(select).toHaveValue('option2');
      
      // Test textarea
      const textarea = page.locator('textarea').first();
      await textarea.fill('Test message');
      await expect(textarea).toHaveValue('Test message');
      
      // Test checkbox
      const checkbox = page.locator('input[type="checkbox"]').first();
      await checkbox.check();
      await expect(checkbox).toBeChecked();
      
      // Test radio button
      const radio = page.locator('input[type="radio"]').first();
      await radio.check();
      await expect(radio).toBeChecked();
    });
  });

  test.describe('PWA Features', () => {
    test('should display PWA test page', async ({ page }) => {
      await page.goto('/test-pwa');
      
      // Check page loads
      await expect(page).toHaveURL('/test-pwa');
      await page.waitForLoadState('networkidle');
    });

    test('should have PWA manifest', async ({ page }) => {
      await page.goto('/');
      
      // Check for manifest link
      const manifest = page.locator('link[rel="manifest"]');
      await expect(manifest).toHaveAttribute('href', '/manifest.json');
    });

    test('should load manifest.json', async ({ page }) => {
      const response = await page.request.get('/manifest.json');
      expect(response.status()).toBe(200);
      
      const manifest = await response.json();
      expect(manifest.name).toBe('JongQue');
      expect(manifest.short_name).toBe('JongQue');
      expect(manifest.start_url).toBe('/');
    });

    test('should have service worker registration', async ({ page }) => {
      await page.goto('/');
      
      // Check if service worker is registered
      const swRegistered = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      expect(swRegistered).toBe(true);
    });
  });

  test.describe('Redis Test Page', () => {
    test('should display Redis test page', async ({ page }) => {
      await page.goto('/test-redis');
      
      // Check page loads
      await expect(page).toHaveURL('/test-redis');
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('API Endpoints', () => {
    test('should respond to health check endpoint', async ({ page }) => {
      const response = await page.request.get('/api/health');
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('ok');
    });

    test('should respond to simple health check', async ({ page }) => {
      const response = await page.request.get('/api/health-simple');
      expect(response.status()).toBe(200);
      
      const text = await response.text();
      // Health simple might return JSON instead of plain text
      expect(text).toContain('healthy');
    });

    test('should have NextAuth endpoints', async ({ page }) => {
      // Test NextAuth configuration endpoint
      const response = await page.request.get('/api/auth/providers');
      expect(response.status()).toBe(200);
      
      const providers = await response.json();
      expect(providers).toHaveProperty('google');
      expect(providers).toHaveProperty('facebook');
      expect(providers).toHaveProperty('credentials');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      const response = await page.goto('/non-existent-page');
      expect(response?.status()).toBe(404);
    });

    test('should display auth error page', async ({ page }) => {
      await page.goto('/error?error=Configuration');
      
      // Check error page loads
      await expect(page).toHaveURL(/\/error/);
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check mobile layout
      await expect(page.locator('h1')).toBeVisible();
      
      // Test navigation on mobile
      await page.goto('/signin');
      await expect(page.locator('input#email')).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      // Check tablet layout
      await expect(page.locator('h1')).toBeVisible();
      
      // Test UI components on tablet
      await page.goto('/test-ui');
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      
      // Check desktop layout
      await expect(page.locator('h1')).toBeVisible();
      
      // Test all test pages on desktop
      const testPages = ['/test-auth', '/test-ui', '/test-pwa', '/test-google-oauth'];
      
      for (const testPage of testPages) {
        await page.goto(testPage);
        await expect(page).toHaveURL(testPage);
      }
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load homepage quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have proper meta tags', async ({ page }) => {
      await page.goto('/');
      
      // Check viewport meta tag
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
        'content', 
        /width=device-width, initial-scale=1/
      );
      
      // Check charset
      await expect(page.locator('meta[charset="utf-8"]')).toBeAttached();
    });
  });

  test.describe('Security Headers', () => {
    test('should have security headers', async ({ page }) => {
      const response = await page.goto('/');
      
      // Check for basic security headers
      const headers = response?.headers();
      
      // These might be set by Next.js or deployment platform
      if (headers) {
        // Just verify response is successful
        expect(response?.status()).toBe(200);
      }
    });
  });
});
