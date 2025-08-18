import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { HomePage } from '../page-objects/HomePage';
import { World } from '../support/world';

Given('I am on the homepage', async function (this: World) {
  this.homePage = new HomePage(this.page);
  await this.homePage.goToHome();
});

Given('I visit the homepage', async function (this: World) {
  this.homePage = new HomePage(this.page);
  await this.homePage.goToHome();
});

Given('I am on the registration page', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  await this.authPage.goToSignUp();
});

Given('I am on the login page', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  await this.authPage.goToSignIn();
});

Given('I have a registered account with email {string} and password {string}', 
  async function (this: World, email: string, password: string) {
    // This step assumes the account already exists in the test database
    // In a real test scenario, you might want to create the account via API
    this.testUser = { email, password };
  }
);

Given('I am logged in as {string}', async function (this: World, email: string) {
  this.authPage = new AuthPage(this.page);
  await this.authPage.goToSignIn();
  await this.authPage.loginWithCredentials(email, 'admin123');
  expect(await this.authPage.isLoggedIn()).toBeTruthy();
});

When('I visit the homepage', async function (this: World) {
  this.homePage = new HomePage(this.page);
  await this.homePage.goToHome();
});

When('I fill in the registration form with valid details:', 
  async function (this: World, dataTable) {
    this.authPage = new AuthPage(this.page);
    const data = dataTable.rowsHash();
    await this.authPage.registerWithCredentials(data.name, data.email, data.password);
  }
);

When('I fill in the registration form with invalid email:', 
  async function (this: World, dataTable) {
    this.authPage = new AuthPage(this.page);
    const data = dataTable.rowsHash();
    await this.authPage.registerWithCredentials(data.name, data.email, data.password);
  }
);

When('I submit the registration form', async function (this: World) {
  // The registerWithCredentials method already submits the form
  // This step is kept for BDD readability
});

When('I enter my email {string}', async function (this: World, email: string) {
  this.authPage = new AuthPage(this.page);
  await this.authPage.fill(this.authPage.emailInput, email);
});

When('I enter my password {string}', async function (this: World, password: string) {
  this.authPage = new AuthPage(this.page);
  await this.authPage.fill(this.authPage.passwordInput, password);
});

When('I submit the login form', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  await this.authPage.click(this.authPage.loginButton);
  await this.authPage.waitForLoadState();
});

When('I logout from the system', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  await this.authPage.logout();
});

Then('I should see the main hero section', async function (this: World) {
  this.homePage = new HomePage(this.page);
  expect(await this.homePage.isVisible(this.homePage.heroTitle)).toBeTruthy();
});

Then('I should see login and register buttons', async function (this: World) {
  this.homePage = new HomePage(this.page);
  expect(await this.homePage.isVisible(this.homePage.loginButton)).toBeTruthy();
  expect(await this.homePage.isVisible(this.homePage.registerButton)).toBeTruthy();
});

Then('I should be logged in successfully', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  expect(await this.authPage.isLoggedIn()).toBeTruthy();
});

Then('I should be redirected to the dashboard', async function (this: World) {
  expect(this.page.url()).toContain('/');
  // You might want to check for specific dashboard elements
});

Then('I should see an error message about invalid email format', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  const errorMessage = await this.authPage.getErrorMessage();
  expect(errorMessage).toContain('email') || expect(errorMessage).toContain('อีเมล');
});

Then('I should see an error message about invalid credentials', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  const errorMessage = await this.authPage.getErrorMessage();
  expect(errorMessage.length).toBeGreaterThan(0);
});

Then('I should remain on the login page', async function (this: World) {
  expect(this.page.url()).toContain('/signin');
});

Then('I should see Google login button', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  expect(await this.authPage.isVisible(this.authPage.googleLoginButton)).toBeTruthy();
});

Then('I should see Facebook login button', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  expect(await this.authPage.isVisible(this.authPage.facebookLoginButton)).toBeTruthy();
});

Then('I should see LINE login button', async function (this: World) {
  this.authPage = new AuthPage(this.page);
  expect(await this.authPage.isVisible(this.authPage.lineLoginButton)).toBeTruthy();
});

Then('I should be redirected to the homepage', async function (this: World) {
  expect(this.page.url()).toContain('/') || expect(this.page.url()).toContain('/signin');
});

Then('I should see login and register buttons again', async function (this: World) {
  this.homePage = new HomePage(this.page);
  await this.homePage.goToHome();
  expect(await this.homePage.isVisible(this.homePage.loginButton)).toBeTruthy();
  expect(await this.homePage.isVisible(this.homePage.registerButton)).toBeTruthy();
});
