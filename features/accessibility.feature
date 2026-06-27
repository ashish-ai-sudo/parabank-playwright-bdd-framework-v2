@accessibility
Feature: Application Accessibility
  As a Quality Engineer following WCAG 2.1 AA guidelines
  I want to verify the application is accessible to all users
  So that customers with disabilities can use the banking application

  # TC: ACS-001
  @accessibility
  Scenario: Login form inputs have programmatically associated labels
    Given the user is on the ParaBank home page
    When the user inspects the login form
    Then the username input has an associated label or aria-label attribute
    And the password input has an associated label or aria-label attribute

  # TC: ACS-002
  @accessibility
  Scenario: Registration form inputs have programmatically associated labels
    Given the user is on the registration page
    When the user inspects the registration form
    Then every input field has an associated label element or aria-label attribute
    And the table layout does not break the accessibility tree

  # TC: ACS-003
  @accessibility
  Scenario: The registration form can be completed and submitted using keyboard only
    Given the user is on the registration page
    When the user navigates through the form using the Tab key
    Then the tab order follows a logical top-to-bottom sequence
    And every field is reachable by keyboard
    And there are no focus traps
    And the form can be submitted by pressing Enter
    And a visible focus indicator is present throughout navigation

  # TC: ACS-004
  @accessibility
  Scenario: Validation errors on the registration form are announced to screen readers
    Given the user is on the registration page
    When the user submits the form without filling any fields
    Then the validation errors are announced by a screen reader
    And the error containers use aria-live="assertive" or role="alert"

  # TC: ACS-005
  @accessibility
  Scenario: Validation error text meets WCAG 2.1 AA color contrast requirements
    Given the registration form displays validation errors
    When the color contrast of the error text against its background is measured
    Then the contrast ratio is at least 4.5:1

  # TC: ACS-006
  @accessibility @regression
  Scenario Outline: Page titles accurately reflect the current page state
    When the user navigates to the "<page>" page
    Then the browser tab title reads "<expected_title>"

    Examples:
      | page                     | expected_title                                         |
      | Home                     | ParaBank | Welcome | Online Banking                 |
      | Register                 | ParaBank | Register for Free Online Account Access        |
      | Post-registration        | ParaBank | Customer Created                               |
      | Login error              | ParaBank | Error                                          |
      | Accounts Overview        | ParaBank | Accounts Overview                              |

  # TC: ACS-007
  @accessibility
  Scenario: Keyboard focus moves to the first validation error after failed form submission
    Given the user is on the registration page
    When the user submits the form with missing required fields
    Then keyboard focus is moved to the first field containing a validation error
    And the user does not need to manually navigate back up the page to find the errors
