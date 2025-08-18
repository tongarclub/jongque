Feature: User Authentication
  As a user
  I want to be able to register and login to the queue booking system
  So that I can access my bookings and manage my account

  Background:
    Given I am on the homepage

  Scenario: User can access the homepage
    When I visit the homepage
    Then I should see the main hero section
    And I should see login and register buttons

  Scenario: User can register with valid credentials
    Given I am on the registration page
    When I fill in the registration form with valid details:
      | name     | John Doe           |
      | email    | john@example.com   |
      | password | SecurePassword123! |
    And I submit the registration form
    Then I should be logged in successfully
    And I should be redirected to the dashboard

  Scenario: User cannot register with invalid email
    Given I am on the registration page
    When I fill in the registration form with invalid email:
      | name     | John Doe        |
      | email    | invalid-email   |
      | password | SecurePassword123! |
    And I submit the registration form
    Then I should see an error message about invalid email format

  Scenario: User can login with valid credentials
    Given I have a registered account with email "admin@jongque.com" and password "admin123"
    And I am on the login page
    When I enter my email "admin@jongque.com"
    And I enter my password "admin123"
    And I submit the login form
    Then I should be logged in successfully
    And I should be redirected to the dashboard

  Scenario: User cannot login with invalid credentials
    Given I am on the login page
    When I enter my email "wrong@example.com"
    And I enter my password "wrongpassword"
    And I submit the login form
    Then I should see an error message about invalid credentials
    And I should remain on the login page

  Scenario: User can access OAuth login options
    Given I am on the login page
    Then I should see Google login button
    And I should see Facebook login button
    And I should see LINE login button

  Scenario: User can logout
    Given I am logged in as "admin@jongque.com"
    When I logout from the system
    Then I should be redirected to the homepage
    And I should see login and register buttons again
