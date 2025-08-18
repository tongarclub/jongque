import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroTitle: Locator;
  readonly heroDescription: Locator;
  readonly authTestLink: Locator;
  readonly redisTestLink: Locator;
  readonly uiTestLink: Locator;
  readonly pwaTestLink: Locator;
  readonly pwaInstallButton: Locator;
  readonly featuresSection: Locator;
  readonly navigationMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.heroTitle = page.locator('h1').filter({ hasText: 'ยินดีต้อนรับสู่ JongQue' });
    this.heroDescription = page.locator('p').filter({ hasText: 'ระบบจองคิวออนไลน์' });
    this.authTestLink = page.locator('a[href="/test-auth"]');
    this.redisTestLink = page.locator('a[href="/test-redis"]');
    this.uiTestLink = page.locator('a[href="/test-ui"]');
    this.pwaTestLink = page.locator('a[href="/test-pwa"]');
    this.pwaInstallButton = page.locator('[data-testid="pwa-install-button"]');
    this.featuresSection = page.locator('ol.list-decimal');
    this.navigationMenu = page.locator('nav');
  }

  async goToHome() {
    await this.goto('/');
    await this.waitForLoadState();
  }

  async clickLogin() {
    await this.click(this.loginButton);
    await this.waitForLoadState();
  }

  async clickRegister() {
    await this.click(this.registerButton);
    await this.waitForLoadState();
  }

  async installPWA() {
    if (await this.isVisible(this.pwaInstallButton)) {
      await this.click(this.pwaInstallButton);
      // Handle PWA install prompt
      await this.page.waitForTimeout(2000);
    }
  }

  async isPWAInstallable(): Promise<boolean> {
    return await this.isVisible(this.pwaInstallButton);
  }

  async getHeroTitle(): Promise<string> {
    return await this.getText(this.heroTitle);
  }

  async isPageLoaded(): Promise<boolean> {
    return await this.isVisible(this.heroTitle) && await this.isVisible(this.loginButton);
  }
}
