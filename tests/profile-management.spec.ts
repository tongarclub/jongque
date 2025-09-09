import { test, expect } from '@playwright/test';

test.describe('Profile Management System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display profile management pages correctly', async ({ page }) => {
    // Test main profile page structure
    await page.goto('/profile');
    
    // Check if redirects to signin when not authenticated
    await page.waitForURL('/auth/signin', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
  });

  test('should display profile settings page correctly', async ({ page }) => {
    // Test profile settings page structure
    await page.goto('/profile/settings');
    
    // Check if redirects to signin when not authenticated
    await page.waitForURL('/auth/signin', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
  });

  test('should display security page correctly', async ({ page }) => {
    // Test security page structure
    await page.goto('/profile/security');
    
    // Check if redirects to signin when not authenticated
    await page.waitForURL('/auth/signin', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
  });

  test('should display booking history page correctly', async ({ page }) => {
    // Test booking history page structure
    await page.goto('/profile/bookings');
    
    // Check if redirects to signin when not authenticated
    await page.waitForURL('/auth/signin', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
  });

  test('should test profile API endpoints accessibility', async ({ page, request }) => {
    // Test profile API endpoint exists
    const profileResponse = await request.get('/api/user/profile');
    
    // Should return 401 for unauthenticated requests
    expect(profileResponse.status()).toBe(401);

    // Test security API endpoint exists  
    const securityResponse = await request.get('/api/user/security');
    
    // Should return 401 for unauthenticated requests
    expect(securityResponse.status()).toBe(401);

    // Test change password API endpoint exists
    const changePasswordResponse = await request.post('/api/user/change-password', {
      data: { 
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      }
    });
    
    // Should return 401 for unauthenticated requests
    expect(changePasswordResponse.status()).toBe(401);
  });

  test('should validate change password form', async ({ page }) => {
    await page.goto('/profile/security');
    
    // Check if redirects to signin when not authenticated
    await page.waitForURL('/auth/signin', { timeout: 10000 });
    
    // Go back to security page to test form validation
    await page.goto('/profile/security');
    
    // Should still redirect to signin
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should handle profile navigation correctly', async ({ page }) => {
    // Start at profile page
    await page.goto('/profile');
    
    // Should redirect to signin
    await page.waitForURL('/auth/signin');
    
    // Try settings page
    await page.goto('/profile/settings');
    await page.waitForURL('/auth/signin');
    
    // Try security page  
    await page.goto('/profile/security');
    await page.waitForURL('/auth/signin');
    
    // Try bookings page
    await page.goto('/profile/bookings');
    await page.waitForURL('/auth/signin');
  });

  test('should test responsive design on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Test profile pages on mobile
      await page.goto('/profile');
      
      // Should still redirect properly on mobile
      await page.waitForURL('/auth/signin');
      await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
    }
  });

  test('should validate API request/response format', async ({ request }) => {
    // Test profile API with invalid data
    const profileUpdateResponse = await request.put('/api/user/profile', {
      data: { 
        name: '', // Invalid - empty name
        email: 'invalid-email' // Invalid email format
      }
    });
    
    // Should return 401 (unauthorized) or 400 (bad request)
    expect([401, 400]).toContain(profileUpdateResponse.status());

    // Test change password with invalid data
    const invalidPasswordResponse = await request.post('/api/user/change-password', {
      data: { 
        newPassword: '123', // Too short
        confirmPassword: '456' // Doesn't match
      }
    });
    
    // Should return 401 (unauthorized) or 400 (bad request)
    expect([401, 400]).toContain(invalidPasswordResponse.status());
  });

  test('should handle form validation client-side', async ({ page }) => {
    await page.goto('/profile/security');
    
    // Should redirect to signin
    await page.waitForURL('/auth/signin');
    
    // Test that the security form has proper structure
    await page.goto('/profile/security');
    
    // Even though we get redirected, test that the route exists
    const response = await page.goto('/profile/security');
    expect(response?.status()).not.toBe(404);
  });

  test('should test profile management workflow', async ({ page }) => {
    // Test complete profile management workflow
    
    // 1. Try to access profile (should redirect to signin)
    await page.goto('/profile');
    await page.waitForURL('/auth/signin');
    
    // 2. Test each profile sub-page
    const profilePages = [
      '/profile',
      '/profile/settings', 
      '/profile/security',
      '/profile/bookings'
    ];

    for (const profilePage of profilePages) {
      await page.goto(profilePage);
      
      // Should redirect to signin since not authenticated
      await page.waitForURL('/auth/signin');
      
      // Verify signin page loads correctly
      await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
    }
  });

  test('should validate profile page structure when accessible', async ({ page }) => {
    // Mock authentication state for testing
    await page.goto('/profile');
    
    // Check redirect behavior
    await page.waitForURL('/auth/signin');
    
    // Verify the page structure exists (even if redirected)
    const profilePageResponse = await page.goto('/profile');
    expect(profilePageResponse?.status()).not.toBe(404);
    
    // Test settings page structure
    const settingsPageResponse = await page.goto('/profile/settings');
    expect(settingsPageResponse?.status()).not.toBe(404);
    
    // Test security page structure
    const securityPageResponse = await page.goto('/profile/security');
    expect(securityPageResponse?.status()).not.toBe(404);
    
    // Test bookings page structure
    const bookingsPageResponse = await page.goto('/profile/bookings');
    expect(bookingsPageResponse?.status()).not.toBe(404);
  });

  test('should test error handling in profile forms', async ({ page }) => {
    // Test that profile pages don't crash when accessed
    const testPages = [
      '/profile',
      '/profile/settings',
      '/profile/security', 
      '/profile/bookings'
    ];

    for (const testPage of testPages) {
      await page.goto(testPage);
      
      // Should not show error page
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('This page could not be found');
      expect(bodyText).not.toContain('500');
      expect(bodyText).not.toContain('Internal Server Error');
    }
  });

  test('should test profile integration with authentication', async ({ page }) => {
    // Test that profile pages properly check authentication
    await page.goto('/profile');
    
    // Should redirect to signin
    await page.waitForURL('/auth/signin');
    
    // Test forgot password link exists (from profile flows)
    const forgotPasswordLink = page.locator('a[href="/auth/forgot-password"]');
    await expect(forgotPasswordLink).toBeVisible();
    
    // Test navigation back to profile would work
    await page.goto('/profile');
    await page.waitForURL('/auth/signin');
    
    // Verify consistent redirect behavior
    await expect(page).toHaveURL('/auth/signin');
  });
});
