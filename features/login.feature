@login
Feature: User Login
  As a registered ParaBank customer
  I want to log in to my account
  So that I can view my account information and balances

  Background:
    Given the user is on the ParaBank home page

  # ─── HAPPY PATH ───────────────────────────────────────────────────────────

  # TC: LOG-001, LOG-002
  @smoke @regression @positive
  Scenario: Successful login with valid credentials redirects to Accounts Overview
    When the user enters a valid username
    And enters the correct password
    And clicks the Log In button
    Then the user is redirected to the Accounts Overview page
    And the page title is "ParaBank | Accounts Overview"
    And the Account Services navigation menu is visible

  # TC: LOG-003
  @regression @positive
  Scenario: Post-login welcome message shows the customer full name
    Given a registered customer with first name "John" and last name "Doe"
    When the customer logs in with valid credentials
    Then the sidebar greeting reads "Welcome John Doe"

  # TC: LOG-015
  @security @smoke
  Scenario: Password field on the login form is masked
    When the user views the login form
    Then the password input field type is "password"
    And typed characters are not visible in plain text

  # ─── VALIDATION ───────────────────────────────────────────────────────────

  # TC: LOG-004, LOG-005, LOG-006
  @regression @negative
  Scenario Outline: Login with incomplete credentials shows a validation message
    When the user enters "<username_input>" as the username
    And enters "<password_input>" as the password
    And clicks the Log In button
    Then the error message "Please enter a username and password." is displayed

    Examples:
      | username_input  | password_input |
      |                 |                |
      | validuser       |                |
      |                 | somepassword   |

  # TC: LOG-007, LOG-008, LOG-009
  @regression @negative
  Scenario Outline: Login with invalid credentials shows a generic error message
    When the user enters "<username_input>" as the username
    And enters "<password_input>" as the password
    And clicks the Log In button
    Then the error message "The username and password could not be verified." is displayed
    And the user remains on the login page

    Examples:
      | username_input             | password_input    |
      | testuser_qe_2026           | WrongPassword99   |
      | nonexistent_xyz_99999      | AnyPassword123    |
      | wrongusername_xyz          | Test@12345        |

  # TC: LOG-020
  @regression @usability
  Scenario: Login form remains accessible on the error page for retry
    When the user submits invalid login credentials
    Then the error page is displayed
    And the login form is still visible in the left sidebar
    And the user can enter new credentials without navigating back

  # ─── BOUNDARY & EDGE CASES ────────────────────────────────────────────────

  # TC: LOG-012
  @boundary @regression
  Scenario: Username case sensitivity behaviour is consistent and documented
    Given a registered customer with username "testuser_lower"
    When the user attempts to log in with username "TestUser_Lower"
    Then the system either consistently accepts or consistently rejects the login
    And the case sensitivity policy is clearly defined

  # TC: LOG-013
  @boundary @regression
  Scenario: Password with leading or trailing spaces does not silently succeed
    When the user enters a valid username
    And enters the correct password with a leading space
    And clicks the Log In button
    Then the login fails
    And the error message "The username and password could not be verified." is displayed

  # ─── SECURITY ─────────────────────────────────────────────────────────────

  # TC: LOG-010
  @security @negative
  Scenario: SQL injection payload in the login username field does not bypass authentication
    When the user enters an SQL injection payload as the username
    And enters any value as the password
    And clicks the Log In button
    Then authentication is not bypassed
    And no SQL error details are exposed in the response

  # TC: LOG-011
  @security @negative
  Scenario: XSS payload entered in the login username field is sanitised in the error response
    When the user enters a script injection payload as the username
    And enters any value as the password
    And clicks the Log In button
    Then no script is executed on the error page
    And the input is not reflected unsanitised in the response

  # TC: LOG-014
  @security @negative
  Scenario: Repeated failed login attempts trigger a brute force protection mechanism
    When the user submits incorrect credentials 10 consecutive times for the same account
    Then the system applies a protective measure such as account lockout, CAPTCHA, or rate-limiting
    And subsequent login attempts are blocked or slowed

  # TC: LOG-016
  @security @regression
  Scenario: Session is invalidated after the user logs out
    Given the user is logged in
    When the user logs out
    And navigates directly to the Accounts Overview URL
    Then the user is not shown any protected account data
    And the session is no longer valid

  # TC: LOG-017
  @security @regression
  Scenario: Accessing a protected page without authentication shows an appropriate response
    Given the user is not logged in
    When the user navigates directly to the Accounts Overview page
    Then access is denied
    And the user is redirected to the login page or shown a clear authentication-required message

  # TC: LOG-018
  @security
  Scenario: Session cookie has required security attributes
    Given the user logs in successfully
    When the session cookie is inspected
    Then the JSESSIONID cookie has the HttpOnly flag set
    And the JSESSIONID cookie has the Secure flag set
    And the session identifier does not appear in the URL

  # TC: LOG-019
  @security @exploratory
  Scenario: Concurrent sessions with the same credentials are handled predictably
    Given the user is logged in on Browser One
    When the same user logs in again on Browser Two
    Then the system handles both sessions without data corruption
    And either both sessions remain valid or the older session is gracefully invalidated
