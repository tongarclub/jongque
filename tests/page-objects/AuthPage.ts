import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly googleLoginButton: Locator;
  readonly facebookLoginButton: Locator;
  readonly lineLoginButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input#email');
    this.passwordInput = page.locator('input#password');
    this.nameInput = page.locator('input#name');
    this.phoneInput = page.locator('input#phone');
    this.loginButton = page.locator('button[type="submit"]').filter({ hasText: 'เข้าสู่ระบบ' });
    this.registerButton = page.locator('button[type="submit"]').filter({ hasText: 'สมัครสมาชิก' });
    this.googleLoginButton = page.locator('button').filter({ hasText: 'Google' });
    this.facebookLoginButton = page.locator('button').filter({ hasText: 'Facebook' });
    this.lineLoginButton = page.locator('button').filter({ hasText: 'LINE' });
    this.errorMessage = page.locator('.text-red-600');
    this.successMessage = page.locator('.text-green-600');
    this.signInLink = page.locator('a[href="/signin"]');
    this.signUpLink = page.locator('a[href="/signup"]');
  }

  async goToSignIn() {
    await this.goto('/signin');
    await this.waitForLoadState();
  }

  async goToSignUp() {
    await this.goto('/signup');
    await this.waitForLoadState();
  }

  async loginWithCredentials(email: string, password: string) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForLoadState();
  }

  async registerWithCredentials(name: string, email: string, password: string) {
    await this.fill(this.nameInput, name);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.registerButton);
    await this.waitForLoadState();
  }

  async loginWithGoogle() {
    await this.click(this.googleLoginButton);
    // Note: OAuth flows require special handling for external auth providers
    // This would need to be mocked or use special test accounts
  }

  async loginWithFacebook() {
    await this.click(this.facebookLoginButton);
    // Note: OAuth flows require special handling for external auth providers
  }

  async loginWithLINE() {
    await this.click(this.lineLoginButton);
    // Note: OAuth flows require special handling for external auth providers
  }

  async getErrorMessage(): Promise<string> {
    if (await this.isVisible(this.errorMessage)) {
      return await this.getText(this.errorMessage);
    }
    return '';
  }

  async isLoggedIn(): Promise<boolean> {
    // Check if redirected to dashboard or authenticated page
    const currentUrl = this.page.url();
    return currentUrl.includes('/dashboard') || currentUrl.includes('/my-bookings') || currentUrl === '/';
  }

  async logout() {
    // Navigate to logout endpoint or click logout button
    await this.page.goto('/api/auth/signout');
    await this.page.locator('form button[type="submit"]').click();
    await this.waitForLoadState();
  }
}
