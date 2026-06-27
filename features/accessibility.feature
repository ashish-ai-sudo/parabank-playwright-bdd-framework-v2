@accessibility @allure.label.parentSuite:ParaBank @allure.label.suite:Accessibility
Feature: Application Accessibility

  # ── Functional Accessibility ──────────────────────────────────────────────
  # These scenarios verify observable accessibility behaviour without automated
  # tooling — they complement axe-core scans rather than replacing them.

  # TC: ACS-006
  @accessibility @regression
  Scenario Outline: Page titles accurately reflect the current page state
    When the user navigates to the "<page>" page
    Then the browser tab title is "<expected_title>"

    Examples:
      | page     | expected_title                                      |
      | home     | ParaBank \| Welcome \| Online Banking               |
      | register | ParaBank \| Register for Free Online Account Access |

  # ── Automated WCAG Scans (axe-core) ──────────────────────────────────────
  # axe-core evaluates WCAG 2.0 A, 2.0 AA, and 2.1 AA rules on each page.
  # Only 'critical' impact violations fail the scenario.
  # 'serious', 'moderate', and 'minor' violations are attached to Allure as
  # warnings so engineers can review them without blocking the pipeline.
  # Screenshots and violation details are always attached for every scenario.

  # TC: ACS-010
  @accessibility @regression
  Scenario Outline: "<page>" page has no critical WCAG violations
    When the user navigates to the "<page>" page
    Then the page passes WCAG accessibility checks

    Examples:
      | page     |
      | home     |
      | register |

  # TC: ACS-011
  # Accounts Overview is an authenticated page — register a fresh user first
  # so the session is active when the WCAG scan runs.
  @accessibility @regression
  Scenario: Accounts Overview page has no critical WCAG violations
    Given the user is logged in as a registered customer
    When the user navigates to the Accounts Overview
    Then the page passes WCAG accessibility checks
