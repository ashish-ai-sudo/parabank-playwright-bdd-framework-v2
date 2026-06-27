import { Then } from '@cucumber/cucumber';
import { expect } from '../utils/expect';
import type { ICustomWorld } from '../support/world';

// ─── Password Masking ────────────────────────────────────────────────────────

/**
 * Verify that a password-type input field is present and visible on the
 * current page. A visible input[type="password"] confirms masking is active.
 */
Then(
  'the password input field is masked',
  async function (this: ICustomWorld) {
    await expect(
      this.page.locator('input[type="password"]').first(),
    ).toBeVisible();
  },
);
