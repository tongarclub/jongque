import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { HomePage } from '../page-objects/HomePage';

export interface TestUser {
  email: string;
  password: string;
}

export class World extends CucumberWorld {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public authPage!: AuthPage;
  public homePage!: HomePage;
  public testUser?: TestUser;
  public manifest?: any;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({
      headless: process.env.CI === 'true',
      slowMo: process.env.CI === 'true' ? 0 : 100
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      // Enable PWA features for testing
      permissions: ['notifications'],
      // Mock location for testing
      geolocation: { latitude: 13.7563, longitude: 100.5018 }, // Bangkok coordinates
    });
    
    this.page = await this.context.newPage();
    
    // Set up console logging for debugging
    this.page.on('console', (msg) => {
      if (process.env.DEBUG_TESTS === 'true') {
        console.log(`Browser console: ${msg.text()}`);
      }
    });

    // Set up error handling
    this.page.on('pageerror', (error) => {
      console.error(`Browser error: ${error.message}`);
    });
  }

  async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}
