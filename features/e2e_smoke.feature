@smoke @e2e @regression @allure.label.parentSuite:ParaBank @allure.label.suite:E2E-Smoke
Feature: New customer registration and account balance verification
  As a new ParaBank customer
  I want to register for an account and view my initial balance
  So that I can confirm my account was created successfully

  # TC: E2E-001
  # Covers: REG-001/REG-002/REG-003 (happy path + auto-login), ACC-001 (balance display), REG-005 (initial balance)
  @smoke @critical
  Scenario: Newly registered customer is auto-logged in and can view their account balance
    When a new user registers with unique generated credentials
    Then the page title is "ParaBank | Customer Created"
    And the message "Your account was created successfully. You are now logged in." is displayed
    And Account Services is visible confirming the user is logged in

    When the user navigates to the Accounts Overview
    Then at least one account is displayed
    And the account balance is captured and logged

  # TC: E2E-002
  # Covers: REG-001 (registration), LOG-001 (explicit login with registered credentials), ACC-001 (balance display)
  # Key difference from E2E-001: this scenario proves the registered account PERSISTS and the credentials
  # work for a subsequent manual login — not just the auto-login session that follows registration.
  # This is the direct translation of the original task:
  #   "Automate creating an account and signing in with that account.
  #    After signing in, log/print the amount displayed on the page post-login."
  @regression @e2e
  Scenario: Registered customer can log back in manually and view their account balance
    When a new user registers with unique generated credentials
    And the user logs out
    When the user logs in with those credentials
    Then the user is on the Accounts Overview page
    And at least one account is displayed
    And the account balance is captured and logged
    And the displayed balance is in a valid currency format
