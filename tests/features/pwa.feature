Feature: Progressive Web App (PWA) Functionality
  As a user
  I want to be able to install and use the app as a PWA
  So that I can access the queue booking system offline and with native app experience

  Background:
    Given I am using a PWA-compatible browser

  Scenario: PWA install button is visible when installable
    Given I am on the homepage
    When the page loads completely
    Then I should see the PWA install button
    And the install button should be enabled

  Scenario: PWA manifest is properly configured
    Given I am on the homepage
    When I check the PWA manifest
    Then the manifest should have proper app name "JongQue"
    And the manifest should have app icons
    And the manifest should have start URL
    And the manifest should have display mode "standalone"

  Scenario: Service Worker is registered successfully
    Given I am on the homepage
    When the page loads completely
    Then the service worker should be registered
    And the service worker should be active

  Scenario: App works offline after initial load
    Given I am on the homepage
    And the page has loaded completely
    And the service worker is active
    When I go offline
    And I refresh the page
    Then the page should load from cache
    And I should see the main content

  Scenario: PWA screenshots are displayed in install dialog
    Given I am on the homepage
    When I trigger the PWA install prompt
    Then I should see app screenshots in the install dialog
    And the screenshots should show mobile and desktop views

  Scenario: PWA can be installed on mobile device
    Given I am using a mobile browser
    And I am on the homepage
    When I click the PWA install button
    And I confirm the installation
    Then the app should be installed on the device
    And I should be able to launch it from the home screen
