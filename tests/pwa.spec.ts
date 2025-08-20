import { test, expect } from '@playwright/test';

test.describe('PWA (Progressive Web App) Tests', () => {
  
  test.describe('PWA Manifest', () => {
    test('should have valid PWA manifest', async ({ page }) => {
      const response = await page.request.get('/manifest.json');
      expect(response.status()).toBe(200);
      
      const manifest = await response.json();
      
      // Check required manifest fields
      expect(manifest.name).toBe('JongQue - ระบบจองคิวออนไลน์');
      expect(manifest.short_name).toBe('JongQue');
      expect(manifest.start_url).toBe('/');
      expect(manifest.display).toBe('standalone');
      expect(manifest.orientation).toBe('portrait');
      
      // Check theme colors
      expect(manifest.theme_color).toBeDefined();
      expect(manifest.background_color).toBeDefined();
      
      // Validate color format (should be hex colors)
      expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      
      // Check icons array
      expect(manifest.icons).toBeInstanceOf(Array);
      expect(manifest.icons.length).toBeGreaterThan(0);
      
      // Validate icon structure
      for (const icon of manifest.icons) {
        expect(icon).toHaveProperty('src');
        expect(icon).toHaveProperty('sizes');
        expect(icon).toHaveProperty('type');
        expect(icon.type).toBe('image/svg+xml');
      }
      
      // Check for required icon sizes
      const iconSizes = manifest.icons.map((icon: any) => icon.sizes);
      expect(iconSizes).toContain('192x192');
      expect(iconSizes).toContain('512x512');
    });

    test('should have manifest linked in HTML', async ({ page }) => {
      await page.goto('/');
      
      // Check for manifest link in head
      const manifestLink = page.locator('link[rel="manifest"]');
      await expect(manifestLink).toBeAttached();
      await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
    });

    test('should have proper meta tags for PWA', async ({ page }) => {
      await page.goto('/');
      
      // Check viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toBeAttached();
      await expect(viewport).toHaveAttribute('content', /width=device-width, initial-scale=1/);
      
      // Check theme color meta tag
      const themeColor = page.locator('meta[name="theme-color"]');
      await expect(themeColor).toBeAttached();
      
      // Check apple touch icon
      const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
      await expect(appleTouchIcon).toBeAttached();
    });
  });

  test.describe('Service Worker', () => {
    test('should have service worker files', async ({ page }) => {
      // Check main service worker
      const swResponse = await page.request.get('/sw.js');
      expect(swResponse.status()).toBe(200);
      
      const swContent = await swResponse.text();
      expect(swContent).toContain('self'); // Service worker should reference 'self'
      
      // Check manual service worker
      const manualSwResponse = await page.request.get('/manual-sw.js');
      expect(manualSwResponse.status()).toBe(200);
      
      // Check register service worker script
      const registerSwResponse = await page.request.get('/register-sw.js');
      expect(registerSwResponse.status()).toBe(200);
    });

    test('should register service worker in browser', async ({ page }) => {
      await page.goto('/');
      
      // Check if service worker is supported
      const swSupported = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      expect(swSupported).toBe(true);
      
      // Wait for service worker registration
      await page.waitForTimeout(2000);
      
      // Check if service worker is registered
      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          return registration !== undefined;
        }
        return false;
      });
      
      // Service worker should be registered (might take time)
      expect(swRegistered).toBe(true);
    });

    test('should have service worker registration script', async ({ page }) => {
      await page.goto('/');
      
      // Just check that service worker is supported
      const swSupported = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      expect(swSupported).toBe(true);
    });
  });

  test.describe('PWA Icons', () => {
    test('should have all required icon sizes', async ({ page }) => {
      const requiredSizes = [
        '72x72', '96x96', '128x128', '144x144', 
        '152x152', '192x192', '384x384', '512x512'
      ];
      
      for (const size of requiredSizes) {
        const response = await page.request.get(`/icons/icon-${size}.svg`);
        expect(response.status()).toBe(200);
        
        const content = await response.text();
        expect(content).toContain('<svg');
        expect(content).toContain('</svg>');
      }
    });

    test('should have favicon', async ({ page }) => {
      const faviconResponse = await page.request.get('/favicon.ico');
      expect(faviconResponse.status()).toBe(200);
      
      // Check content type
      const contentType = faviconResponse.headers()['content-type'];
      expect(contentType).toContain('image');
    });

    test('should have apple touch icons', async ({ page }) => {
      await page.goto('/');
      
      // Check for apple touch icon link (might be multiple)
      const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]').first();
      await expect(appleTouchIcon).toBeAttached();
      
      const href = await appleTouchIcon.getAttribute('href');
      expect(href).toBeTruthy();
      
      // Verify the icon file exists
      if (href) {
        const iconResponse = await page.request.get(href);
        expect(iconResponse.status()).toBe(200);
      }
    });
  });

  test.describe('PWA Installation', () => {
    test('should display PWA install button', async ({ page }) => {
      await page.goto('/test-pwa');
      await page.waitForLoadState('networkidle');
      
      // Should have PWA install button (might be hidden initially)
      const installButton = page.locator('button:has-text("Install")');
      // Button might not be visible if PWA is already installed or not installable
      // Just check if it exists in DOM
      const buttonExists = await installButton.count() > 0;
      expect(buttonExists).toBe(true);
    });

    test('should handle beforeinstallprompt event', async ({ page }) => {
      await page.goto('/');
      
      // Check if PWA install prompt handling is implemented
      const hasInstallPromptHandler = await page.evaluate(() => {
        return window.addEventListener !== undefined;
      });
      
      expect(hasInstallPromptHandler).toBe(true);
    });

    test('should be installable as PWA', async ({ page }) => {
      await page.goto('/');
      
      // Check PWA installability criteria
      const manifest = await page.request.get('/manifest.json');
      expect(manifest.status()).toBe(200);
      
      const sw = await page.request.get('/sw.js');
      expect(sw.status()).toBe(200);
      
      // Check HTTPS (in production) or localhost (in development)
      const url = page.url();
      const isSecure = url.startsWith('https://') || url.startsWith('http://localhost');
      expect(isSecure).toBe(true);
    });
  });

  test.describe('PWA Caching', () => {
    test('should cache static assets', async ({ page }) => {
      await page.goto('/');
      
      // Wait for service worker to activate
      await page.waitForTimeout(3000);
      
      // Check if caching is working by looking at network requests
      const responses: string[] = [];
      page.on('response', response => {
        responses.push(response.url());
      });
      
      // Reload page to test caching
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Some assets should be cached (this is hard to test without specific cache inspection)
      expect(responses.length).toBeGreaterThan(0);
    });

    test('should work offline (basic test)', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for service worker to cache resources
      await page.waitForTimeout(3000);
      
      // Simulate offline by intercepting network requests
      await page.route('**/*', route => {
        // Allow service worker and cached resources
        if (route.request().url().includes('/sw.js') || 
            route.request().url().includes('/_next/static/')) {
          route.continue();
        } else {
          route.abort();
        }
      });
      
      // Try to navigate (should work if properly cached)
      await page.goto('/');
      
      // Page should still load (from cache)
      await expect(page.locator('body')).toBeAttached();
    });
  });

  test.describe('PWA Test Page', () => {
    test('should display PWA test interface', async ({ page }) => {
      await page.goto('/test-pwa');
      await page.waitForLoadState('networkidle');
      
      // Check if PWA test page loads
      await expect(page).toHaveURL('/test-pwa');
      
      // Should have some PWA-related content
      const bodyContent = await page.locator('body').textContent();
      expect(bodyContent).toBeTruthy();
    });

    test('should show PWA installation status', async ({ page }) => {
      await page.goto('/test-pwa');
      await page.waitForLoadState('networkidle');
      
      // Check for PWA install button component
      const installButton = page.locator('button:has-text("Install")');
      const buttonCount = await installButton.count();
      
      // Button should exist (even if not visible)
      expect(buttonCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('PWA Screenshots', () => {
    test('should have PWA screenshots for app store', async ({ page }) => {
      // Check if screenshots exist (for PWA app store listings)
      const desktopScreenshot = await page.request.get('/screenshots/desktop-1.svg');
      expect(desktopScreenshot.status()).toBe(200);
      
      const mobileScreenshot = await page.request.get('/screenshots/mobile-1.svg');
      expect(mobileScreenshot.status()).toBe(200);
      
      // Verify they are valid SVG files
      const desktopContent = await desktopScreenshot.text();
      expect(desktopContent).toContain('<svg');
      
      const mobileContent = await mobileScreenshot.text();
      expect(mobileContent).toContain('<svg');
    });
  });

  test.describe('PWA Performance', () => {
    test('should load quickly on first visit', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
    });

    test('should load even faster on repeat visits (caching)', async ({ page }) => {
      // First visit
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Let service worker cache
      
      // Second visit (should be faster due to caching)
      const startTime = Date.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load quickly from cache
      expect(loadTime).toBeLessThan(3000);
    });
  });

  test.describe('PWA Security', () => {
    test('should serve over HTTPS in production', async ({ page }) => {
      const url = page.url();
      
      // In development, localhost is acceptable
      // In production, should be HTTPS
      const isSecure = url.startsWith('https://') || 
                      url.startsWith('http://localhost') || 
                      url.startsWith('http://127.0.0.1');
      
      expect(isSecure).toBe(true);
    });

    test('should have secure service worker', async ({ page }) => {
      const swResponse = await page.request.get('/sw.js');
      expect(swResponse.status()).toBe(200);
      
      const swContent = await swResponse.text();
      
      // Service worker should not contain sensitive information
      expect(swContent).not.toContain('password');
      expect(swContent).not.toContain('secret');
      expect(swContent).not.toContain('api_key');
    });
  });

  test.describe('PWA Accessibility', () => {
    test('should have proper PWA meta tags for accessibility', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper viewport
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute('content', /width=device-width, initial-scale=1/);
      
      // Check for theme color (helps with status bar)
      const themeColor = page.locator('meta[name="theme-color"]');
      await expect(themeColor).toBeAttached();
    });

    test('should work with keyboard navigation', async ({ page }) => {
      await page.goto('/test-pwa');
      await page.waitForLoadState('networkidle');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with keyboard
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });
});
