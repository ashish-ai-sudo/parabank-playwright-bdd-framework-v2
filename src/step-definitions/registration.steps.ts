import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '../utils/expect';
import { RegistrationPage } from '../pages/RegistrationPage';
import { buildUser } from '../fixtures/factory';
import { createLogger } from '../utils/logger';
import type { ICustomWorld } from '../support/world';

const log = createLogger('RegistrationSteps');

// ─── E2E smoke steps (used by e2e_smoke.feature) ──────────────────────────

When(
  'a new user registers with unique generated credentials',
  async function (this: ICustomWorld) {
    const user = buildUser();
    this.userData = user;
    log.info(`Registering new user — username: ${user.username}`);

    const registrationPage = new RegistrationPage(this.page);
    await registrationPage.open();
    await registrationPage.register(user);
  },
);

Then(
  'the page title is {string}',
  async function (this: ICustomWorld, expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle);
  },
);

Then(
  'the message {string} is displayed',
  async function (this: ICustomWorld, expectedMsg: string) {
    const registrationPage = new RegistrationPage(this.page);
    const msg = await registrationPage.getSuccessMessage();
    expect(msg).toContain(expectedMsg);
  },
);

Then(
  'Account Services is visible confirming the user is logged in',
  async function (this: ICustomWorld) {
    await expect(
      this.page.getByRole('heading', { name: 'Account Services' }),
    ).toBeVisible();
  },
);

// ─── Registration feature steps ───────────────────────────────────────────

When(
  'the user registers with valid credentials',
  async function (this: ICustomWorld) {
    const user = buildUser();
    this.userData = user;
    log.info(`Registering — username: ${user.username}`);
    const regPage = new RegistrationPage(this.page);
    await regPage.register(user);
  },
);

Then(
  'the account is created successfully',
  async function (this: ICustomWorld) {
    await expect(this.page).toHaveTitle('ParaBank | Customer Created');
  },
);

Then(
  'the user is automatically logged in',
  async function (this: ICustomWorld) {
    await expect(
      this.page.getByRole('heading', { name: 'Account Services' }),
    ).toBeVisible();
  },
);

// ─── Required field validation ────────────────────────────────────────────

When(
  'the user submits the registration form with {string} left blank',
  async function (this: ICustomWorld, fieldLabel: string) {
    const user = buildUser();
    this.userData = user;
    const regPage = new RegistrationPage(this.page);
    await regPage.fillForm(user);
    await regPage.clearField(fieldLabel);
    await regPage.submit();
  },
);

Then(
  'the validation error {string} is shown',
  async function (this: ICustomWorld, expectedError: string) {
    await expect(
      this.page.locator('.error', { hasText: expectedError }),
    ).toBeVisible();
  },
);

// ─── Password mismatch ────────────────────────────────────────────────────

When(
  'the user fills in the registration form with mismatched passwords',
  async function (this: ICustomWorld) {
    const user = buildUser();
    this.userData = user;
    const regPage = new RegistrationPage(this.page);
    await regPage.fillForm(user);
    // Override confirmPw with a value that does not match the password.
    await this.page.fill('#repeatedPassword', 'MISMATCH_PASS99!');
    await regPage.submit();
  },
);

// ─── Duplicate username ───────────────────────────────────────────────────

/**
 * Register a first user. The form is already on screen (Background navigated
 * there). After submit the user is auto-logged in; we navigate back to the
 * registration page so the subsequent When step has a clean form to fill.
 */
Given(
  'a user has already registered with a unique username',
  async function (this: ICustomWorld) {
    const user = buildUser();
    this.userData = user;
    log.info(`Pre-registering for dup-username test — username: ${user.username}`);
    const regPage = new RegistrationPage(this.page);
    await regPage.fillForm(user);
    await regPage.submit();
    // Auto-logged in — navigate back to the registration page.
    await regPage.open();
  },
);

When(
  'the user attempts to register with that same username again',
  async function (this: ICustomWorld) {
    const dupUser = buildUser({ username: this.userData!.username });
    const regPage = new RegistrationPage(this.page);
    await regPage.fillForm(dupUser);
    await regPage.submit();
  },
);

