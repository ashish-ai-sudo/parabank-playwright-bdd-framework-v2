@security
Feature: Application Security Posture
  As a security-conscious Quality Engineer
  I want to verify the application's security controls
  So that customer data and sessions are protected from common attacks

  # TC: SEC-001
  @security
  Scenario: All application pages are served over HTTPS
    When the user navigates to any page within the ParaBank application
    Then all network requests use the HTTPS protocol
    And HTTP requests are redirected to HTTPS

  # TC: SEC-002
  @security
  Scenario: Session identifier is not exposed in URL parameters
    Given the user logs in successfully
    When the user navigates between application pages
    Then the session identifier does not appear in any URL as a query or path parameter

  # TC: SEC-003
  @security @negative
  Scenario: Reflected XSS via URL parameters is blocked
    When a script injection payload is appended as a URL parameter to any application page
    Then the script is not executed in the browser
    And the parameter value is HTML-escaped in the server response

  # TC: SEC-004
  @security
  Scenario: Application error pages do not expose internal system information
    When an error condition is triggered in the application
    Then the error message shown to the user is generic and user-friendly
    And no stack traces, file paths, database details, framework versions, or server information are visible
