@registration
Feature: User Registration
  As a prospective ParaBank customer
  I want to register for an online banking account
  So that I can access my account information and balances digitally

  Background:
    Given the user is on the registration page

  # ─── HAPPY PATH ───────────────────────────────────────────────────────────

  # TC: REG-001
  @smoke @regression @positive
  Scenario: Successful registration with mandatory fields only
    When the user fills in all required registration fields with valid data
    And leaves the phone number field blank
    And submits the registration form
    Then the account is created successfully
    And the user is automatically logged in
    And the message "Your account was created successfully. You are now logged in." is displayed

  # TC: REG-002
  @regression @positive
  Scenario: Successful registration with all fields including optional phone
    When the user fills in all registration fields including the optional phone number
    And submits the registration form
    Then the account is created successfully
    And the user is automatically logged in

  # TC: REG-003
  @smoke @regression @positive
  Scenario: User is automatically logged in after successful registration
    When the user fills in all required registration fields with valid data
    And submits the registration form
    Then the account services sidebar is visible
    And the user does not need to perform a separate login step

  # TC: REG-004
  @regression @positive
  Scenario: Success page heading displays the registered username
    When the user registers with username "testuser_qe"
    Then the page heading reads "Welcome testuser_qe"

  # TC: REG-005
  @regression @positive
  Scenario: A new bank account with default balance is created on registration
    When the user registers successfully with valid unique data
    And navigates to the Accounts Overview page
    Then the account table shows a balance of "$515.50"
    And the available amount shows "$515.50"

  # ─── VALIDATION ───────────────────────────────────────────────────────────

  # TC: REG-006
  @regression @negative
  Scenario: Submitting empty registration form displays all required field errors simultaneously
    When the user submits the registration form without filling any fields
    Then the following validation errors are all displayed:
      | First name is required.                 |
      | Last name is required.                  |
      | Address is required.                    |
      | City is required.                       |
      | State is required.                      |
      | Zip Code is required.                   |
      | Social Security Number is required.     |
      | Username is required.                   |
      | Password is required.                   |
      | Password confirmation is required.      |

  # TC: REG-007 to REG-016
  @regression @negative
  Scenario Outline: Required field validation fires when a single field is omitted
    When the user fills all required registration fields except "<missing_field>"
    And submits the registration form
    Then the validation message "<error_message>" is displayed
    And the form is not submitted

    Examples:
      | missing_field    | error_message                          |
      | First Name       | First name is required.                |
      | Last Name        | Last name is required.                 |
      | Address          | Address is required.                   |
      | City             | City is required.                      |
      | State            | State is required.                     |
      | Zip Code         | Zip Code is required.                  |
      | SSN              | Social Security Number is required.    |
      | Username         | Username is required.                  |
      | Password         | Password is required.                  |
      | Confirm Password | Password confirmation is required.     |

  # TC: REG-017
  @regression @negative
  Scenario: Mismatched passwords show a password mismatch validation error
    When the user fills all required registration fields
    And enters "Password123" in the password field
    And enters "WrongPass99" in the confirm password field
    And submits the registration form
    Then the validation message "Passwords did not match." is displayed on the confirm password field
    And the form is not submitted

  # TC: REG-018
  @regression @negative
  Scenario: Registering with an already-taken username is rejected
    Given a customer account already exists with username "existing_user_parabank"
    When the user attempts to register with username "existing_user_parabank"
    And submits the registration form
    Then the validation message "This username already exists." is displayed
    And the form is not submitted

  # TC: REG-029
  @regression @negative
  Scenario: Whitespace-only input in required fields is treated as empty
    When the user enters only whitespace characters in all required registration fields
    And submits the registration form
    Then required field validation errors are displayed as if all fields were empty

  # ─── BOUNDARY VALUES ──────────────────────────────────────────────────────

  # TC: REG-019, REG-020
  @boundary
  Scenario Outline: Registration handles boundary-length name inputs gracefully
    When the user enters a first name of <character_count> characters
    And fills all other required registration fields normally
    And submits the registration form
    Then the system does not crash
    And the response is "<expected_outcome>"

    Examples:
      | character_count | expected_outcome                                                    |
      | 1               | Registration succeeds or a clear minimum-length error is shown      |
      | 300             | Field is truncated or a clear maximum-length validation error shown  |

  # TC: REG-021, REG-022
  @boundary @negative
  Scenario Outline: Registration handles unusual username formats
    When the user enters "<username_value>" as the username
    And fills all other required registration fields normally
    And submits the registration form
    Then the system "<expected_behaviour>"

    Examples:
      | username_value    | expected_behaviour                                              |
      | john doe          | rejects the username or reports a format validation error       |
      | john@doe#2026!    | accepts with documented policy or shows a clear format error    |

  # TC: REG-023, REG-024
  @boundary
  Scenario Outline: Registration handles unusual format inputs in specific fields
    When the user enters "<input_value>" in the "<field_name>" field
    And fills all other required registration fields normally
    And submits the registration form
    Then the system handles the input gracefully without crashing

    Examples:
      | field_name | input_value |
      | Zip Code   | ABCDE       |
      | Phone      | ABC-DEF-GH  |

  # ─── SECURITY ─────────────────────────────────────────────────────────────

  # TC: REG-025
  @security @negative
  Scenario: XSS input in a registration field is sanitised and not executed
    When the user enters a script injection payload in the first name field
    And fills all other required registration fields normally
    And submits the registration form
    Then no script is executed on any resulting page
    And the input is rendered as escaped plain text

  # TC: REG-026
  @security @negative
  Scenario: SQL injection payload in the username field does not compromise the system
    When the user enters an SQL injection payload as the username
    And fills all other required registration fields normally
    And submits the registration form
    Then the registration fails with a validation or error message
    And no SQL error details are exposed in the response

  # TC: REG-027
  @security @smoke
  Scenario: Password fields on the registration form are masked
    When the user views the registration form
    Then the password input field type is "password"
    And the confirm password input field type is "password"
    And typed characters are not visible in plain text

  # ─── USABILITY ────────────────────────────────────────────────────────────

  # TC: REG-028
  @regression @usability
  Scenario: Non-sensitive field values are retained after a validation error
    When the user fills in first name, last name, address, city, state, zip code, SSN, and username
    And leaves the password fields empty
    And submits the registration form
    Then the validation error "Password is required." is displayed
    And all non-password field values are still populated in the form

  # TC: REG-030
  @regression @usability
  Scenario: Authenticated user navigating to the registration page is handled appropriately
    Given the user is already logged in as a registered customer
    When the user navigates directly to the registration page
    Then the user is not presented with an active registration form
    And is redirected to the accounts overview or shown an appropriate message
