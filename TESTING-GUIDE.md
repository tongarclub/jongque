# Testing Guide - JongQue Automated Testing with Playwright BDD

This guide covers the automated testing setup for the JongQue queue booking system using Playwright and Behavior Driven Development (BDD) with Cucumber.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Setup and Installation](#setup-and-installation)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Overview

Our testing strategy includes:

- **End-to-End (E2E) Testing**: Full user journey testing with Playwright
- **BDD Testing**: Business-readable scenarios using Cucumber
- **Cross-browser Testing**: Chrome, Firefox, Safari, and mobile browsers
- **PWA Testing**: Progressive Web App functionality testing
- **API Testing**: REST API endpoint testing
- **Performance Testing**: Page load and database performance

## Test Structure

```
tests/
├── features/                 # BDD feature files (Gherkin syntax)
│   ├── authentication.feature
│   ├── pwa.feature
│   └── booking.feature
├── step-definitions/         # Cucumber step implementations
│   ├── auth-steps.ts
│   ├── pwa-steps.ts
│   └── booking-steps.ts
├── page-objects/            # Page Object Model classes
│   ├── BasePage.ts
│   ├── AuthPage.ts
│   ├── HomePage.ts
│   └── BookingPage.ts
├── support/                 # Test utilities and configuration
│   ├── world.ts
│   ├── hooks.ts
│   └── helpers.ts
└── *.spec.ts               # Regular Playwright tests
```

## Setup and Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL database running
- Redis server running

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Setup test database
npm run db:migrate
npm run db:seed
```

### Environment Variables

Create `.env.test` file for test environment:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key
DATABASE_URL=postgresql://jongque_user:jongque_pass@localhost:5432/jongque_db_test
REDIS_URL=redis://localhost:6379
```

## Running Tests

### Basic Playwright Tests

```bash
# Run all tests
npm run test

# Run tests with UI mode
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Debug specific test
npm run test:debug

# Generate test report
npm run test:report
```

### BDD Tests (Cucumber)

```bash
# Run BDD tests
npm run test:bdd

# Run BDD tests in parallel
npm run test:bdd:parallel

# Run specific feature
npx cucumber-js tests/features/authentication.feature
```

### Cross-browser Testing

```bash
# Run on all browsers
npm run test

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Mobile Testing

```bash
# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Writing Tests

### Regular Playwright Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can login with valid credentials', async ({ page }) => {
  await page.goto('/signin');
  
  await page.fill('input[name="email"]', 'admin@jongque.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### BDD Feature Files

```gherkin
Feature: User Authentication
  As a user
  I want to be able to login to the system
  So that I can access my bookings

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter email "admin@jongque.com"
    And I enter password "admin123"
    And I submit the login form
    Then I should be logged in successfully
    And I should be redirected to the dashboard
```

### Step Definitions

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { World } from '../support/world';

Given('I am on the login page', async function (this: World) {
  await this.page.goto('/signin');
});

When('I enter email {string}', async function (this: World, email: string) {
  await this.page.fill('input[name="email"]', email);
});

Then('I should be logged in successfully', async function (this: World) {
  await expect(this.page).toHaveURL('/dashboard');
});
```

### Page Object Model

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
  }

  async login(email: string, password: string) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
```

## Test Scenarios Coverage

### Authentication Testing
- User registration with email/password
- User login with credentials
- OAuth login flows (Google, Facebook, LINE)
- Password reset functionality
- Role-based access control
- Session management

### PWA Testing
- PWA installability detection
- Service Worker registration
- Offline functionality
- Cache strategies
- App manifest validation
- Install prompt behavior

### Booking System Testing
- Queue booking flow
- Service selection
- Time slot booking
- Booking modification/cancellation
- Real-time updates
- Notification delivery

### API Testing
- Authentication endpoints
- Booking CRUD operations
- Business management APIs
- Payment processing
- Third-party integrations

### Performance Testing
- Page load times
- Database query performance
- Memory usage monitoring
- Concurrent user simulation

## CI/CD Integration

### GitHub Actions

Our CI/CD pipeline automatically runs tests on:
- Push to main/develop branches
- Pull requests
- Daily scheduled runs

The pipeline includes:
- Database setup (PostgreSQL, Redis)
- Dependency installation
- Browser installation
- Application build
- Test execution
- Report generation

### Test Reports

Test results are automatically:
- Generated in HTML format
- Uploaded as GitHub Actions artifacts
- Integrated with pull request checks
- Sent to team notifications

## Best Practices

### Test Organization
- Keep tests atomic and independent
- Use descriptive test names
- Group related tests in describe blocks
- Maintain clean test data

### Page Object Model
- Encapsulate page interactions
- Reuse common functionality
- Keep locators in page objects
- Use meaningful method names

### Test Data Management
- Use factory functions for test data
- Clean up after tests
- Use separate test database
- Mock external services when needed

### Error Handling
- Take screenshots on failures
- Log meaningful error messages
- Set appropriate timeouts
- Handle flaky tests properly

### BDD Guidelines
- Write user-focused scenarios
- Use business language
- Keep scenarios focused
- Avoid technical implementation details

## Debugging Tests

### Local Debugging
```bash
# Run in debug mode
npm run test:debug

# Run with browser visible
npm run test:headed

# Enable verbose logging
DEBUG_TESTS=true npm run test
```

### CI Debugging
- Check GitHub Actions logs
- Download test artifacts
- Review screenshots and videos
- Examine test reports

## Performance Monitoring

### Metrics Tracked
- Page load times
- First contentful paint
- Time to interactive
- Database query duration
- Memory usage

### Performance Tests
```typescript
test('page loads within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

## Troubleshooting

### Common Issues

1. **Browser not found**
   ```bash
   npx playwright install
   ```

2. **Database connection error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL
   - Run database migrations

3. **Test timeouts**
   - Increase timeout in playwright.config.ts
   - Check for network issues
   - Optimize slow operations

4. **Flaky tests**
   - Add proper waits
   - Use retry mechanisms
   - Check for race conditions

### Support

For testing issues:
1. Check this guide first
2. Review test logs and reports
3. Ask team for help
4. Create GitHub issue if needed

---

*This guide is updated regularly. Please keep tests up to date with application changes.*
