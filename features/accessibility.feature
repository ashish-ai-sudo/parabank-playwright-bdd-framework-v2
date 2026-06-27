@accessibility @allure.label.parentSuite:ParaBank @allure.label.suite:Accessibility
Feature: Application Accessibility

  # TC: ACS-006
  @accessibility @regression
  Scenario Outline: Page titles accurately reflect the current page state
    When the user navigates to the "<page>" page
    Then the browser tab title is "<expected_title>"

    Examples:
      | page     | expected_title                                      |
      | home     | ParaBank \| Welcome \| Online Banking               |
      | register | ParaBank \| Register for Free Online Account Access |
