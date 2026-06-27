import { Given } from '@cucumber/cucumber';
import { RegistrationPage } from '../pages/RegistrationPage';
import { LoginPage } from '../pages/LoginPage';
import { buildUser } from '../fixtures/factory';
import { createLogger } from '../utils/logger';
import type { ICustomWorld } from '../support/world';

const log = createLogger('CommonSteps');

// ─── Page Navigation ────────────────────────────────────────────────────────

Given('the user is on the ParaBank home page', async function (this: ICustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.open();
});

Given('the user is on the registration page', async function (this: ICustomWorld) {
  const regPage = new RegistrationPage(this.page);
  await regPage.open();
});

// ─── Authenticated State Setup ───────────────────────────────────────────────

/**
 * Register a fresh user via UI. ParaBank auto-logs in after registration,
 * so after this step the world has an authenticated session and this.userData
 * is populated with the credentials that were used.
 */
Given(
  'the user is logged in as a registered customer',
  async function (this: ICustomWorld) {
    const user = buildUser();
    this.userData = user;
    log.info(`Setting up authenticated session — username: ${user.username}`);
    const regPage = new RegistrationPage(this.page);
    await regPage.open();
    await regPage.register(user);
    // Registration auto-logs in — session is now active.
  },
);
