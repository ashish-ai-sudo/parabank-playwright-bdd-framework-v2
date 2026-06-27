@smoke @e2e @regression
Feature: End-to-End Smoke Test — Register, Login, and View Balance
  As a Quality Engineer
  I want to verify the three primary business scenarios work end-to-end
  So that I have confidence in the core banking registration and account viewing flow

  # TC: E2E-001
  @smoke @critical
  Scenario: Register a new customer, log in, and capture the account balance
    Given the test environment is accessible and clean
    And no prior account exists with the test username

    When the user navigates to the registration page
    And fills in all required registration fields with unique valid test data
    And submits the registration form

    Then the registration is successful
    And the page title reads "ParaBank | Customer Created"
    And the success message "Your account was created successfully. You are now logged in." is displayed
    And the user is automatically logged in without a separate login step
    And the Account Services navigation menu is visible

    When the user navigates to the Accounts Overview page
    Then the accounts table is displayed with at least one account
    And the account balance is captured from the Balance column
    And the captured balance is printed to the test output
    And the available amount equals the balance

  # TC: E2E-001 (data-driven variant)
  @smoke @regression
  Scenario Outline: Register multiple unique customers and verify their account balances
    Given the test environment is accessible and clean
    When the user registers with first name "<first_name>", last name "<last_name>", and username "<username>"
    Then the registration is successful and the user is automatically logged in
    And the Accounts Overview displays a balance of "$515.50"
    And the balance is printed to the test output as "<username> balance: $515.50"

    Examples:
      | first_name | last_name | username              |
      | Alice      | Smith     | alice_smith_qe_001    |
      | Bob        | Jones     | bob_jones_qe_002      |
      | Carol      | Taylor    | carol_taylor_qe_003   |
