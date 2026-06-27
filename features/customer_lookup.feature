@customer_lookup
Feature: Customer Lookup (Forgot Login Info)
  As a ParaBank customer who has forgotten their login credentials
  I want to look up my account using my personal details
  So that I can recover access to my account

  Background:
    Given the user is on the Customer Lookup page

  # TC: LKP-001
  @positive
  Scenario: Valid customer details return the login information
    When the user fills in all lookup fields with details matching an existing account
    And submits the customer lookup form
    Then the customer login information is retrieved successfully
    And no "not found" error is displayed

  # TC: LKP-002
  @regression @negative
  Scenario: Submitting empty customer lookup form shows validation errors
    When the user submits the customer lookup form without filling any fields
    Then required field validation errors are displayed for all mandatory fields

  # TC: LKP-003
  @regression @negative
  Scenario: Customer lookup with incorrect SSN returns a not-found error
    When the user fills in correct personal details except for an incorrect SSN
    And submits the customer lookup form
    Then the message "The customer information provided could not be found." is displayed
    And no account information is revealed

  # TC: LKP-004
  @security @negative
  Scenario: Repeated customer lookup submissions trigger a rate-limiting protection mechanism
    When the user submits the lookup form with the same name but different SSN values repeatedly
    Then the system applies rate-limiting or CAPTCHA after a threshold of failed attempts
    And the SSN brute-force attack vector is mitigated

  # TC: LKP-005
  @security
  Scenario: A successful customer lookup does not expose the plain-text password
    When the user submits a successful customer lookup
    Then the response does not contain a plain-text password
    And only the username or a secure recovery link is returned
