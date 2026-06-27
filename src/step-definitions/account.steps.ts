import { When, Then } from '@cucumber/cucumber';
import { expect } from '../utils/expect';
import { AccountOverviewPage } from '../pages/AccountOverviewPage';
import { createLogger } from '../utils/logger';
import type { ICustomWorld } from '../support/world';

const log = createLogger('AccountSteps');

// ─── Navigation ────────────────────────────────────────────────────────────

When(
  'the user navigates to the Accounts Overview',
  async function (this: ICustomWorld) {
    const overviewPage = new AccountOverviewPage(this.page);
    await overviewPage.open();
  },
);

// ─── Account table assertions ──────────────────────────────────────────────

Then(
  'at least one account is displayed',
  async function (this: ICustomWorld) {
    const overviewPage = new AccountOverviewPage(this.page);
    await expect(overviewPage.accountTable()).toBeVisible();
    const hasAccounts = await overviewPage.hasAccounts();
    expect(hasAccounts).toBe(true);
  },
);

Then(
  'the account table displays an account number',
  async function (this: ICustomWorld) {
    const overviewPage = new AccountOverviewPage(this.page);
    const accountNumber = await overviewPage.getFirstAccountNumber();
    // Account numbers are numeric strings.
    expect(accountNumber).toMatch(/^\d+$/);
  },
);

Then(
  'the account balance is {string}',
  async function (this: ICustomWorld, expectedBalance: string) {
    const overviewPage = new AccountOverviewPage(this.page);
    const balance = await overviewPage.getFirstAccountBalance();
    this.balance = balance;
    log.info(`Account balance captured: ${balance}`);
    expect(balance).toBe(expectedBalance);
  },
);

// ─── Dynamic balance capture ───────────────────────────────────────────────

Then(
  'the account balance is captured and logged',
  async function (this: ICustomWorld) {
    const overviewPage = new AccountOverviewPage(this.page);
    const balance = await overviewPage.getFirstAccountBalance();
    this.balance = balance;
    const username = this.userData?.username ?? 'unknown user';

    log.info(`[RESULT] ${username} — Account Balance: ${balance}`);
    this.log(`Account Balance: ${balance}`);
    // eslint-disable-next-line no-console
    console.info(`\n${'─'.repeat(50)}\n  User    : ${username}\n  Balance : ${balance}\n${'─'.repeat(50)}\n`);
  },
);

Then(
  'the displayed balance is in a valid currency format',
  async function (this: ICustomWorld) {
    const balance = this.balance ?? '';
    // Matches formats like $515.50 or $1,234.56
    expect(balance).toMatch(/^\$[\d,]+\.\d{2}$/);
  },
);

