import { test, expect } from '@playwright/test';

test.describe('Email Verification System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display email verification pages correctly', async ({ page }) => {
    // Test verify-email page structure
    await page.goto('/auth/verify-email');
    
    // Should show error state when no token provided
    await expect(page.locator('h1')).toContainText('เกิดข้อผิดพลาด');
    await expect(page).toHaveTitle(/JongQue/);
    
    // Should have link back to signin
    const signinLink = page.locator('a[href="/auth/signin"]');
    await expect(signinLink).toBeVisible();
  });

  test('should display forgot password page correctly', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/auth/forgot-password');
    
    // Check page structure
    await expect(page.locator('h1')).toContainText('ลืมรหัสผ่าน');
    await expect(page.locator('form')).toBeVisible();
    
    // Check email input field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('required');
    
    // Check submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText('ส่งลิงก์รีเซ็ตรหัสผ่าน');
    
    // Check navigation links
    const signinLink = page.locator('a[href="/auth/signin"]');
    const signupLink = page.locator('a[href="/auth/signup"]');
    await expect(signinLink).toBeVisible();
    await expect(signupLink).toBeVisible();
  });

  test('should display reset password page correctly', async ({ page }) => {
    // Navigate to reset password page (without valid token)
    await page.goto('/auth/reset-password');
    
    // Should show loading first, then invalid token state
    await page.waitForLoadState('networkidle');
    
    // Check for invalid token message or form
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/(ลิงก์ไม่ถูกต้อง|กำลังตรวจสอบลิงก์|รีเซ็ตรหัสผ่าน)/);
  });

  test('should have forgot password link in signin page', async ({ page }) => {
    // Navigate to signin page
    await page.goto('/auth/signin');
    
    // Check for forgot password link
    const forgotPasswordLink = page.locator('a[href="/auth/forgot-password"]');
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toContainText('ลืมรหัสผ่าน');
    
    // Test clicking the link
    await forgotPasswordLink.click();
    await page.waitForURL('/auth/forgot-password');
    await expect(page.locator('h1')).toContainText('ลืมรหัสผ่าน');
  });

  test('should validate email format in forgot password form', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    // Try to submit with invalid email
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.fill('invalid-email');
    await submitButton.click();
    
    // Browser validation should prevent form submission
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should submit forgot password form with valid email', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill valid email
    await emailInput.fill('test@example.com');
    
    // Submit form
    await submitButton.click();
    
    // Should show success state or loading state
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/(ส่งอีเมลแล้ว|กำลังส่ง)/);
  });

  test('should test email verification API endpoints accessibility', async ({ page, request }) => {
    // Test send-verification endpoint exists
    const sendVerificationResponse = await request.post('/api/auth/send-verification', {
      data: { email: 'test@example.com' }
    });
    
    // Should return 200 or 400/500 (not 404)
    expect([200, 400, 500]).toContain(sendVerificationResponse.status());

    // Test verify-email endpoint exists  
    const verifyEmailResponse = await request.post('/api/auth/verify-email', {
      data: { 
        email: 'test@example.com',
        token: 'dummy-token'
      }
    });
    
    // Should return 200, 400, or 500 (not 404)
    expect([200, 400, 500]).toContain(verifyEmailResponse.status());

    // Test forgot-password endpoint exists
    const forgotPasswordResponse = await request.post('/api/auth/forgot-password', {
      data: { email: 'test@example.com' }
    });
    
    // Should return 200 or 400/500 (not 404)
    expect([200, 400, 500]).toContain(forgotPasswordResponse.status());

    // Test reset-password endpoint exists
    const resetPasswordResponse = await request.post('/api/auth/reset-password', {
      data: { 
        email: 'test@example.com',
        token: 'dummy-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123'
      }
    });
    
    // Should return 200, 400, or 500 (not 404)
    expect([200, 400, 500]).toContain(resetPasswordResponse.status());
  });

  test('should test responsive design on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Test forgot password page on mobile
      await page.goto('/auth/forgot-password');
      
      // Check that form is properly sized
      const card = page.locator('[class*="card"]').first();
      await expect(card).toBeVisible();
      
      // Check that inputs are touch-friendly
      const emailInput = page.locator('input[type="email"]');
      const inputHeight = await emailInput.boundingBox();
      expect(inputHeight?.height).toBeGreaterThan(44); // At least 44px for touch targets
    }
  });

  test('should navigate between auth pages correctly', async ({ page }) => {
    // Start at signin
    await page.goto('/auth/signin');
    
    // Go to forgot password
    await page.locator('a[href="/auth/forgot-password"]').click();
    await page.waitForURL('/auth/forgot-password');
    await expect(page.locator('h1')).toContainText('ลืมรหัสผ่าน');
    
    // Go back to signin
    await page.locator('a[href="/auth/signin"]').first().click();
    await page.waitForURL('/auth/signin');
    await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ');
    
    // Go to signup
    await page.locator('a[href="/signup"]').click();
    await page.waitForURL('/signup');
    await expect(page.locator('h1')).toContainText('สมัครสมาชิก');
  });
});
