import { When, Then } from '@cucumber/cucumber';
import { expect } from '../utils/expect';
import type { ICustomWorld } from '../support/world';

// ─── Page Navigation (for accessibility tests) ───────────────────────────────

const PAGE_URLS: Record<string, string> = {
  home:     '/parabank/index.htm',
  register: '/parabank/register.htm',
};

When(
  'the user navigates to the {string} page',
  async function (this: ICustomWorld, pageName: string) {
    const url = PAGE_URLS[pageName];
    if (!url) throw new Error(`Unknown page name: "${pageName}"`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  },
);

// ─── Page Title Check ────────────────────────────────────────────────────────

Then(
  'the browser tab title is {string}',
  async function (this: ICustomWorld, expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle);
  },
);
