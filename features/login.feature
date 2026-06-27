@login
Feature: User Login
  As a registered ParaBank customer
  I want to log in to my account
  So that I can view my account information and balances

  Background:
    Given the user is on the ParaBank home page

  # TC: LOG-001, LOG-002
  @smoke @regression @login
  Scenario: Successful login redirects to Accounts Overview
    Given a registered customer exists
    When the user logs in with those credentials
    Then the user is on the Accounts Overview page
    And the Account Services navigation is visible

  # TC: LOG-004, LOG-007
  @regression @login
  Scenario Outline: Login with invalid or missing credentials shows an error
    When the user logs in with username "<username>" and password "<password>"
    Then the login error message "<error_message>" is displayed

    Examples:
      | username   | password | error_message                                    |
      |            |          | Please enter a username and password.            |
      | baduser999 | badpass  | The username and password could not be verified. |

  # TC: LOG-016
  @regression @login
  Scenario: Logging out terminates the session and returns to the home page
    Given the user is logged in as a registered customer
    When the user logs out
    Then the user is returned to the home page

  # TC: LOG-017
  @regression @login @security
  Scenario: Accessing a protected page after logout shows an error
    Given the user has logged out after being logged in
    When the user navigates directly to the Accounts Overview page
    Then the protected page is not accessible
