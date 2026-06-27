@security @allure.label.parentSuite:ParaBank @allure.label.suite:Security
Feature: Application Security

  # TC: REG-027, LOG-015
  @security @smoke @regression
  Scenario Outline: Password input fields are masked on authentication forms
    Given the user is on the <form_page>
    Then the password input field is masked

    Examples:
      | form_page           |
      | registration page   |
      | ParaBank home page  |
