@registration @allure.label.parentSuite:ParaBank @allure.label.suite:Registration
Feature: User Registration
  As a prospective ParaBank customer
  I want to register for an online banking account
  So that I can access my account information and balances digitally

  Background:
    Given the user is on the registration page

  # TC: REG-001, REG-002, REG-003
  @smoke @regression @registration
  Scenario: Successful registration creates an account and auto-logs in the user
    When the user registers with valid credentials
    Then the account is created successfully
    And the user is automatically logged in

  # TC: REG-007 to REG-016
  @regression @registration
  Scenario Outline: Omitting a required field shows the corresponding validation error
    When the user submits the registration form with "<missing_field>" left blank
    Then the validation error "<error_message>" is shown

    Examples:
      | missing_field    | error_message                       |
      | First Name       | First name is required.             |
      | Last Name        | Last name is required.              |
      | Address          | Address is required.                |
      | City             | City is required.                   |
      | State            | State is required.                  |
      | Zip Code         | Zip Code is required.               |
      | SSN              | Social Security Number is required. |
      | Username         | Username is required.               |
      | Password         | Password is required.               |
      | Confirm Password | Password confirmation is required.  |

  # TC: REG-017
  @regression @registration
  Scenario: Mismatched passwords show a validation error
    When the user fills in the registration form with mismatched passwords
    Then the validation error "Passwords did not match." is shown

  # TC: REG-018
  @regression @registration
  Scenario: Registering with an already-taken username is rejected
    Given a user has already registered with a unique username
    When the user attempts to register with that same username again
    Then the validation error "This username already exists." is shown
