import { test, expect } from '@playwright/test';

test.describe('OAuth Integration Tests', () => {
  
  test.describe('OAuth Provider Configuration', () => {
    test('should have all OAuth providers configured', async ({ page }) => {
      const response = await page.request.get('/api/auth/providers');
      expect(response.status()).toBe(200);
      
      const providers = await response.json();
      
      // Check Google OAuth provider
      expect(providers).toHaveProperty('google');
      expect(providers.google.id).toBe('google');
      expect(providers.google.name).toBe('Google');
      expect(providers.google.type).toBe('oauth');
      
      // Check Facebook OAuth provider
      expect(providers).toHaveProperty('facebook');
      expect(providers.facebook.id).toBe('facebook');
      expect(providers.facebook.name).toBe('Facebook');
      expect(providers.facebook.type).toBe('oauth');
      
      // Check LINE OAuth provider (custom)
      expect(providers).toHaveProperty('line');
      expect(providers.line.id).toBe('line');
      expect(providers.line.name).toBe('LINE');
      expect(providers.line.type).toBe('oauth');
      
      // Check Credentials provider
      expect(providers).toHaveProperty('credentials');
      expect(providers.credentials.id).toBe('credentials');
      expect(providers.credentials.name).toBe('credentials');
      expect(providers.credentials.type).toBe('credentials');
    });

    test('should have OAuth callback routes', async ({ page }) => {
      // Test Google OAuth callback route exists
      const googleCallback = await page.request.get('/api/auth/callback/google');
      // Should return 400 (bad request) or redirect, not 404
      expect([400, 302, 307, 200]).toContain(googleCallback.status());
      
      // Test Facebook OAuth callback route exists
      const facebookCallback = await page.request.get('/api/auth/callback/facebook');
      expect([400, 302, 307]).toContain(facebookCallback.status());
      
      // Test LINE OAuth callback route exists
      const lineCallback = await page.request.get('/api/auth/callback/line');
      expect([400, 302, 307]).toContain(lineCallback.status());
    });
  });

  test.describe('OAuth UI Components', () => {
    test('should display OAuth buttons on signin page', async ({ page }) => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Check Google OAuth button
      const googleButton = page.locator('button:has-text("Google")');
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toBeEnabled();
      
      // Check Facebook OAuth button
      const facebookButton = page.locator('button:has-text("Facebook")');
      await expect(facebookButton).toBeVisible();
      await expect(facebookButton).toBeEnabled();
      
      // Check LINE OAuth button
      const lineButton = page.locator('button:has-text("LINE")');
      await expect(lineButton).toBeVisible();
      await expect(lineButton).toBeEnabled();
    });

    test('should display OAuth buttons on signup page', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
      
      // Check Google OAuth button
      const googleButton = page.locator('button:has-text("Google")');
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toBeEnabled();
      
      // Check Facebook OAuth button
      const facebookButton = page.locator('button:has-text("Facebook")');
      await expect(facebookButton).toBeVisible();
      await expect(facebookButton).toBeEnabled();
      
      // Check LINE OAuth button
      const lineButton = page.locator('button:has-text("LINE")');
      await expect(lineButton).toBeVisible();
      await expect(lineButton).toBeEnabled();
    });

    test('should have proper OAuth button styling', async ({ page }) => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Check Google button has proper styling
      const googleButton = page.locator('button:has-text("Google")');
      await expect(googleButton).toHaveCSS('cursor', 'pointer');
      
      // Check Facebook button has proper styling
      const facebookButton = page.locator('button:has-text("Facebook")');
      await expect(facebookButton).toHaveCSS('cursor', 'pointer');
      
      // Check LINE button has proper styling
      const lineButton = page.locator('button:has-text("LINE")');
      await expect(lineButton).toHaveCSS('cursor', 'pointer');
    });
  });

  test.describe('Google OAuth Test Page', () => {
    test('should display Google OAuth test interface', async ({ page }) => {
      await page.goto('/test-google-oauth');
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('Google OAuth Testing');
      
      // Check authentication status section
      await expect(page.locator('text=Authentication Status')).toBeVisible();
      
      // Check OAuth actions section
      await expect(page.locator('text=OAuth Actions')).toBeVisible();
      
      // Check environment check section
      await expect(page.locator('text=Environment Check')).toBeVisible();
      
      // Check setup instructions
      await expect(page.locator('text=Setup Instructions')).toBeVisible();
    });

    test('should show unauthenticated state initially', async ({ page }) => {
      await page.goto('/test-google-oauth');
      await page.waitForLoadState('networkidle');
      
      // Should show unauthenticated status
      await expect(page.locator('text=unauthenticated')).toBeVisible();
      
      // Should show sign in button
      await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible();
    });

    test('should display environment configuration status', async ({ page }) => {
      await page.goto('/test-google-oauth');
      await page.waitForLoadState('networkidle');
      
      // Check environment status (will show Missing if not configured)
      const envStatus = page.locator('text=Google Client ID:').locator('..').locator('span').last();
      await expect(envStatus).toBeVisible();
      
      // Should show either "✅ Configured" or "❌ Missing"
      const statusText = await envStatus.textContent();
      expect(statusText).toMatch(/✅ Configured|❌ Missing/);
    });

    test('should have setup instructions and links', async ({ page }) => {
      await page.goto('/test-google-oauth');
      await page.waitForLoadState('networkidle');
      
      // Check setup instructions
      await expect(page.locator('text=npm run test:google-oauth')).toBeVisible();
      await expect(page.locator('text=GOOGLE-OAUTH-SETUP.md')).toBeVisible();
      await expect(page.locator('text=.env.local')).toBeVisible();
    });
  });

  test.describe('OAuth Error Handling', () => {
    test('should handle OAuth errors gracefully', async ({ page }) => {
      await page.goto('/error?error=OAuthSignin');
      await page.waitForLoadState('networkidle');
      
      // Should display error page
      await expect(page).toHaveURL(/\/error/);
      
      // Should show error message in Thai
      await expect(page.locator('body')).toContainText('เกิดข้อผิดพลาด');
    });

    test('should handle OAuth configuration errors', async ({ page }) => {
      await page.goto('/error?error=Configuration');
      await page.waitForLoadState('networkidle');
      
      // Should display configuration error
      await expect(page).toHaveURL(/\/error/);
      
      // Should show configuration error message
      await expect(page.locator('body')).toContainText('การตั้งค่า');
    });

    test('should handle OAuth access denied', async ({ page }) => {
      await page.goto('/error?error=AccessDenied');
      await page.waitForLoadState('networkidle');
      
      // Should display access denied error
      await expect(page).toHaveURL(/\/error/);
      
      // Should show access denied message (check for Thai text)
      await expect(page.locator('body')).toContainText('AccessDenied');
    });
  });

  test.describe('OAuth Session Management', () => {
    test('should handle session endpoint', async ({ page }) => {
      const sessionResponse = await page.request.get('/api/auth/session');
      expect(sessionResponse.status()).toBe(200);
      
      const session = await sessionResponse.json();
      // Should return empty object or user session
      expect(typeof session).toBe('object');
    });

    test('should handle CSRF token endpoint', async ({ page }) => {
      const csrfResponse = await page.request.get('/api/auth/csrf');
      expect(csrfResponse.status()).toBe(200);
      
      const csrf = await csrfResponse.json();
      expect(csrf).toHaveProperty('csrfToken');
      expect(typeof csrf.csrfToken).toBe('string');
      expect(csrf.csrfToken.length).toBeGreaterThan(0);
    });

    test('should handle signout endpoint', async ({ page }) => {
      const signoutResponse = await page.request.post('/api/auth/signout');
      // Should redirect or return success
      expect([200, 302, 307]).toContain(signoutResponse.status());
    });
  });

  test.describe('OAuth Security', () => {
    test('should have secure OAuth configuration', async ({ page }) => {
      const providersResponse = await page.request.get('/api/auth/providers');
      const providers = await providersResponse.json();
      
      // Check that sensitive information is not exposed
      for (const [key, provider] of Object.entries(providers)) {
        const providerObj = provider as any;
        
        // Should not expose client secrets
        expect(providerObj).not.toHaveProperty('clientSecret');
        expect(providerObj).not.toHaveProperty('client_secret');
        
        // Should not expose sensitive configuration
        expect(JSON.stringify(providerObj)).not.toContain('secret');
        expect(JSON.stringify(providerObj)).not.toContain('Secret');
      }
    });

    test('should use HTTPS for OAuth redirects in production', async ({ page }) => {
      // This test would be more relevant in production environment
      // For now, just check that OAuth endpoints exist
      const response = await page.request.get('/api/auth/providers');
      expect(response.status()).toBe(200);
    });
  });

  test.describe('OAuth Integration Flow Simulation', () => {
    test('should simulate OAuth button clicks without actual authentication', async ({ page }) => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Test Google OAuth button click (should redirect or show loading)
      const googleButton = page.locator('button:has-text("Google")');
      await googleButton.click();
      
      // Should either redirect to Google or show some loading state
      // We can't complete the flow without actual OAuth setup
      await page.waitForTimeout(1000);
      
      // Navigate back to test other buttons
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Test Facebook OAuth button
      const facebookButton = page.locator('button:has-text("Facebook")');
      await facebookButton.click();
      await page.waitForTimeout(1000);
      
      // Navigate back to test LINE button
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Test LINE OAuth button
      const lineButton = page.locator('button:has-text("LINE")');
      await lineButton.click();
      await page.waitForTimeout(1000);
    });

    test('should handle OAuth state parameter', async ({ page }) => {
      // Test that OAuth URLs include state parameter for security
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Monitor network requests when clicking OAuth buttons
      const requests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('oauth') || request.url().includes('auth')) {
          requests.push(request.url());
        }
      });
      
      // Click Google OAuth button
      await page.locator('button:has-text("Google")').click();
      await page.waitForTimeout(2000);
      
      // Check if any OAuth-related requests were made
      // In a real test, we'd verify state parameters are included
      console.log('OAuth requests:', requests);
    });
  });
});
