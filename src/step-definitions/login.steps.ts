import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '../utils/expect';
import { RegistrationPage } from '../pages/RegistrationPage';
import { LoginPage } from '../pages/LoginPage';
import { buildUser } from '../fixtures/factory';
import { createLogger } from '../utils/logger';
import type { ICustomWorld } from '../support/world';

const log = createLogger('LoginSteps');

// ─── State Setup ─────────────────────────────────────────────────────────────

/**
 * Register a fresh user (auto-login happens), then log out immediately.
 * After this step: session is cleared, this.userData holds the credentials,
 * and the browser is on the home page — ready to test the login form.
 */
Given(
  'a registered customer exists',
  async function (this: ICustomWorld) {
    const user = buildUser();
    this.userData = user;
    log.info(`Creating customer for login test — username: ${user.username}`);
    const regPage = new RegistrationPage(this.page);
    await regPage.open();
    await regPage.register(user);
    // Log out so the login form is reachable on the home page.
    const loginPage = new LoginPage(this.page);
    await loginPage.logout();
  },
);

/**
 * Register a fresh user (auto-login), then immediately log out.
 * After this step: logged-out session, browser on home page.
 * Used to set up "access protected page after logout" scenarios.
 */
Given(
  'the user has logged out after being logged in',
  async function (this: ICustomWorld) {
    const user = buildUser();
    this.userData = user;
    log.info(`Registering and logging out — username: ${user.username}`);
    const regPage = new RegistrationPage(this.page);
    await regPage.open();
    await regPage.register(user);
    const loginPage = new LoginPage(this.page);
    await loginPage.logout();
  },
);

// ─── Login Actions ────────────────────────────────────────────────────────────

When(
  'the user logs in with username {string} and password {string}',
  async function (this: ICustomWorld, username: string, password: string) {
    const loginPage = new LoginPage(this.page);
    await loginPage.login(username, password);
  },
);

When(
  'the user logs in with those credentials',
  async function (this: ICustomWorld) {
    const { username, password } = this.userData!;
    log.info(`Logging in — username: ${username}`);
    const loginPage = new LoginPage(this.page);
    await loginPage.login(username, password);
  },
);

When('the user logs out', async function (this: ICustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.logout();
});

When(
  'the user navigates directly to the Accounts Overview page',
  async function (this: ICustomWorld) {
    // Navigate to the protected URL without going through Page Object open()
    // so that any HTTP error check is bypassed (ParaBank returns a soft 200
    // error page when unauthenticated, not an HTTP 4xx/5xx).
    await this.page.goto('/parabank/overview.htm', { waitUntil: 'domcontentloaded' });
  },
);

// ─── Login Assertions ─────────────────────────────────────────────────────────

Then(
  'the login error message {string} is displayed',
  async function (this: ICustomWorld, expectedMsg: string) {
    await expect(this.page.locator('.error')).toContainText(expectedMsg);
  },
);

Then(
  'the user is on the Accounts Overview page',
  async function (this: ICustomWorld) {
    await expect(this.page).toHaveTitle('ParaBank | Accounts Overview');
  },
);

Then(
  'the Account Services navigation is visible',
  async function (this: ICustomWorld) {
    await expect(
      this.page.getByRole('heading', { name: 'Account Services' }),
    ).toBeVisible();
  },
);

Then(
  'the user is returned to the home page',
  async function (this: ICustomWorld) {
    await expect(this.page).toHaveTitle(/Welcome.*Online Banking/);
  },
);

Then(
  'the protected page is not accessible',
  async function (this: ICustomWorld) {
    // Accessing /overview.htm without auth shows a soft error page (HTTP 200
    // but with error content). Verify the accounts data is NOT shown.
    await expect(this.page).not.toHaveTitle('ParaBank | Accounts Overview');
    // The login panel remains visible — confirming the user is unauthenticated.
    await expect(this.page.locator('#loginPanel')).toBeVisible();
  },
);
