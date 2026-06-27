@smoke @e2e @regression
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
