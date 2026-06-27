@account
Feature: Account Overview
  As a logged-in ParaBank customer
  I want to view my accounts overview
  So that I can see my balance information

  Background:
    Given the user is logged in as a registered customer

  # TC: ACC-001, ACC-003
  @smoke @regression @account
  Scenario: Account overview loads with a valid account balance
    When the user navigates to the Accounts Overview
    Then at least one account is displayed
    And the account table displays an account number
    And the account balance is captured and logged
    And the displayed balance is in a valid currency format
