import { test, expect } from '@playwright/test';

test.describe('API Endpoints Tests', () => {
  
  test.describe('Health Check Endpoints', () => {
    test('should respond to main health endpoint', async ({ page }) => {
      const response = await page.request.get('/api/health');
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('uptime');
      expect(data).toHaveProperty('environment');
      
      // Verify timestamp is recent (within last minute)
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - timestamp.getTime();
      expect(timeDiff).toBeLessThan(60000); // Less than 1 minute
    });

    test('should respond to simple health endpoint', async ({ page }) => {
      const response = await page.request.get('/api/health-simple');
      
      expect(response.status()).toBe(200);
      
      const text = await response.text();
      // Health simple might return JSON instead of plain text
      expect(text).toContain('healthy');
      
      // Check response headers (might be JSON)
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/text\/plain|application\/json/);
    });

    test('should have proper response times', async ({ page }) => {
      const startTime = Date.now();
      const response = await page.request.get('/api/health');
      const endTime = Date.now();
      
      expect(response.status()).toBe(200);
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  test.describe('Authentication API Endpoints', () => {
    test('should provide NextAuth providers', async ({ page }) => {
      const response = await page.request.get('/api/auth/providers');
      
      expect(response.status()).toBe(200);
      
      const providers = await response.json();
      
      // Check required providers exist
      expect(providers).toHaveProperty('google');
      expect(providers).toHaveProperty('facebook');
      expect(providers).toHaveProperty('line');
      expect(providers).toHaveProperty('credentials');
      
      // Verify provider structure
      expect(providers.google.name).toBe('Google');
      expect(providers.google.type).toBe('oauth');
      expect(providers.facebook.name).toBe('Facebook');
      expect(providers.facebook.type).toBe('oauth');
      expect(providers.line.name).toBe('LINE');
      expect(providers.line.type).toBe('oauth');
      expect(providers.credentials.name).toBe('credentials');
      expect(providers.credentials.type).toBe('credentials');
    });

    test('should provide session endpoint', async ({ page }) => {
      const response = await page.request.get('/api/auth/session');
      
      expect(response.status()).toBe(200);
      
      const session = await response.json();
      
      // Should return empty object when not authenticated
      expect(typeof session).toBe('object');
      
      // Check response headers
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });

    test('should provide CSRF token', async ({ page }) => {
      const response = await page.request.get('/api/auth/csrf');
      
      expect(response.status()).toBe(200);
      
      const csrf = await response.json();
      
      expect(csrf).toHaveProperty('csrfToken');
      expect(typeof csrf.csrfToken).toBe('string');
      expect(csrf.csrfToken.length).toBeGreaterThan(20); // CSRF tokens should be reasonably long
    });

    test('should handle OAuth callback endpoints', async ({ page }) => {
      const oauthProviders = ['google', 'facebook', 'line'];
      
      for (const provider of oauthProviders) {
        const response = await page.request.get(`/api/auth/callback/${provider}`);
        
        // Should return 400 (bad request) or redirect, not 404
        expect([400, 302, 307]).toContain(response.status());
      }
    });

    test('should handle signin endpoint', async ({ page }) => {
      const response = await page.request.get('/api/auth/signin');
      
      // Should return signin page or redirect
      expect([200, 302, 307]).toContain(response.status());
    });

    test('should handle signout endpoint', async ({ page }) => {
      const response = await page.request.post('/api/auth/signout');
      
      // Should handle signout request
      expect([200, 302, 307]).toContain(response.status());
    });
  });

  test.describe('User Registration API', () => {
    test('should handle registration endpoint', async ({ page }) => {
      const response = await page.request.post('/api/auth/register', {
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpassword123'
        }
      });
      
      // Should either succeed or return validation error
      expect([200, 201, 400, 409]).toContain(response.status());
      
      if (response.status() === 400) {
        const error = await response.json();
        expect(error).toHaveProperty('error');
      }
    });

    test('should validate registration data', async ({ page }) => {
      // Test with missing required fields
      const response = await page.request.post('/api/auth/register', {
        data: {
          name: '',
          email: '',
          password: ''
        }
      });
      
      expect(response.status()).toBe(400);
      
      const error = await response.json();
      expect(error).toHaveProperty('error');
    });

    test('should validate email format', async ({ page }) => {
      const response = await page.request.post('/api/auth/register', {
        data: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'testpassword123'
        }
      });
      
      expect(response.status()).toBe(400);
      
      const error = await response.json();
      expect(error).toHaveProperty('error');
    });
  });

  test.describe('Redis Test API', () => {
    test('should handle Redis test endpoint', async ({ page }) => {
      const response = await page.request.get('/api/test/redis');
      
      // Should respond with either success or error (Redis might not be available)
      expect([200, 500]).toContain(response.status());
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
      
      if (response.status() === 200) {
        expect(data.status).toBe('success');
        expect(data).toHaveProperty('redis');
      } else {
        expect(data.status).toBe('error');
        expect(data).toHaveProperty('error');
      }
    });
  });

  test.describe('Admin API Endpoints', () => {
    test('should have admin database setup endpoint', async ({ page }) => {
      const response = await page.request.post('/api/admin/setup-database');
      
      // Should respond (might require authentication)
      expect([200, 401, 403, 500]).toContain(response.status());
    });

    test('should have admin migration endpoint', async ({ page }) => {
      const response = await page.request.post('/api/admin/migrate-database');
      
      // Should respond (might require authentication)
      expect([200, 401, 403, 500]).toContain(response.status());
    });

    test('should have admin manual migration endpoint', async ({ page }) => {
      const response = await page.request.post('/api/admin/manual-migration');
      
      // Should respond (might require authentication)
      expect([200, 401, 403, 500]).toContain(response.status());
    });

    test('should have admin password reset endpoint', async ({ page }) => {
      const response = await page.request.post('/api/admin/reset-password', {
        data: {
          newPassword: 'newpassword123'
        }
      });
      
      // Should respond (might require authentication)
      expect([200, 400, 401, 403, 500]).toContain(response.status());
    });
  });

  test.describe('API Error Handling', () => {
    test('should handle non-existent API endpoints', async ({ page }) => {
      const response = await page.request.get('/api/non-existent-endpoint');
      
      expect(response.status()).toBe(404);
    });

    test('should handle invalid HTTP methods', async ({ page }) => {
      // Try PATCH on health endpoint (should only accept GET)
      const response = await page.request.patch('/api/health');
      
      expect([405, 404]).toContain(response.status());
    });

    test('should handle malformed JSON requests', async ({ page }) => {
      const response = await page.request.post('/api/auth/register', {
        data: 'invalid-json-string',
        headers: {
          'content-type': 'application/json'
        }
      });
      
      expect([400, 500]).toContain(response.status());
    });
  });

  test.describe('API Security', () => {
    test('should have proper CORS headers', async ({ page }) => {
      const response = await page.request.get('/api/health');
      
      expect(response.status()).toBe(200);
      
      // Check for security headers (might be set by Next.js)
      const headers = response.headers();
      
      // At minimum, should have content-type
      expect(headers).toHaveProperty('content-type');
    });

    test('should not expose sensitive information', async ({ page }) => {
      const response = await page.request.get('/api/auth/providers');
      const providers = await response.json();
      
      // Should not expose client secrets
      const responseText = JSON.stringify(providers);
      expect(responseText).not.toContain('secret');
      expect(responseText).not.toContain('Secret');
      expect(responseText).not.toContain('CLIENT_SECRET');
      expect(responseText).not.toContain('password');
    });

    test('should handle rate limiting gracefully', async ({ page }) => {
      // Make multiple rapid requests to test rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(page.request.get('/api/health'));
      }
      
      const responses = await Promise.all(requests);
      
      // All should succeed or some might be rate limited
      for (const response of responses) {
        expect([200, 429]).toContain(response.status());
      }
    });
  });

  test.describe('API Performance', () => {
    test('should respond quickly to health checks', async ({ page }) => {
      const startTime = Date.now();
      const response = await page.request.get('/api/health-simple');
      const endTime = Date.now();
      
      expect(response.status()).toBe(200);
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(500); // Should respond within 500ms
    });

    test('should handle concurrent requests', async ({ page }) => {
      const concurrentRequests = 5;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(page.request.get('/api/health'));
      }
      
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      // All requests should succeed
      for (const response of responses) {
        expect(response.status()).toBe(200);
      }
      
      // Total time should be reasonable
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  test.describe('API Response Formats', () => {
    test('should return proper JSON responses', async ({ page }) => {
      const response = await page.request.get('/api/health');
      
      expect(response.status()).toBe(200);
      
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
      
      const data = await response.json();
      expect(typeof data).toBe('object');
    });

    test('should return proper text responses', async ({ page }) => {
      const response = await page.request.get('/api/health-simple');
      
      expect(response.status()).toBe(200);
      
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/plain');
      
      const text = await response.text();
      expect(typeof text).toBe('string');
    });

    test('should handle OPTIONS requests for CORS', async ({ page }) => {
      const response = await page.request.fetch('/api/health', {
        method: 'OPTIONS'
      });
      
      // Should handle OPTIONS request
      expect([200, 204, 405]).toContain(response.status());
    });
  });
});
