@account_overview
Feature: Account Overview and Balance Display
  As a logged-in ParaBank customer
  I want to view my account overview
  So that I can see my current balance and account information

  Background:
    Given the user is logged in as a registered customer

  # ─── HAPPY PATH ───────────────────────────────────────────────────────────

  # TC: ACC-001
  @smoke @regression @positive
  Scenario: Account balance is displayed correctly on the Accounts Overview page
    When the user navigates to the Accounts Overview page
    Then the account table displays an account number
    And the account balance shows "$515.50"
    And the available amount shows "$515.50"
    And the total row shows "$515.50"

  # TC: ACC-002
  @regression @positive
  Scenario: Clicking the account number navigates to the account activity page
    When the user navigates to the Accounts Overview page
    And clicks on the account number link
    Then the user is navigated to the account activity page for that account

  # TC: ACC-003
  @regression @positive
  Scenario: The total balance row equals the sum of all individual account balances
    When the user navigates to the Accounts Overview page
    Then the total balance displayed equals the arithmetic sum of all individual account balances

  # TC: ACC-004
  @regression @positive
  Scenario: The balance disclaimer footnote is displayed on the Accounts Overview page
    When the user navigates to the Accounts Overview page
    Then the footnote "*Balance includes deposits that may be subject to holds" is visible

  # ─── SECURITY / ACCESS CONTROL ────────────────────────────────────────────

  # TC: ACC-005
  @security @regression
  Scenario: Unauthenticated access to the Accounts Overview page is blocked
    Given the user is not logged in
    When the user navigates directly to the Accounts Overview page
    Then access is denied
    And the user is redirected to the login page or shown a clear authentication-required message

  # TC: ACC-006
  @security @regression
  Scenario: A logged-in user cannot access another customer's account via URL manipulation
    Given two registered customers "User Alpha" and "User Beta" each with their own account
    And "User Alpha" is logged in
    When "User Alpha" navigates to "User Beta"'s account activity URL directly
    Then "User Alpha" is denied access to "User Beta"'s account information
