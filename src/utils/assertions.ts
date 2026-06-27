import { expect, type Locator, type Page } from './expect.js';

/**
 * Semantic assertion helpers.
 *
 * These thin wrappers exist only where they provide measurably better
 * readability than native Playwright `expect` calls. Every function here
 * delegates to `expect` internally — no custom waiting logic.
 *
 * Do NOT add helpers that simply alias a single-line expect call.
 * Only add helpers that combine two or more checks, or that add context
 * that the native expect message would not include.
 */

/**
 * Assert the page URL matches the given pattern (string fragment or RegExp).
 *
 * @example
 *   await assertUrl(page, '/overview.htm');
 *   await assertUrl(page, /login/);
 */
export async function assertUrl(
  page: Page,
  pattern: string | RegExp,
): Promise<void> {
  await expect(page).toHaveURL(
    typeof pattern === 'string' ? new RegExp(pattern) : pattern,
  );
}

/**
 * Assert the page <title> exactly matches the given text.
 *
 * @example
 *   await assertTitle(page, 'ParaBank | Login');
 */
export async function assertTitle(page: Page, title: string): Promise<void> {
  await expect(page).toHaveTitle(title);
}

/**
 * Assert that a locator matches exactly `count` elements.
 * Useful for table rows, list items, or repeated form errors.
 *
 * @example
 *   await assertElementCount(page.locator('.error'), 3);
 */
export async function assertElementCount(
  locator: Locator,
  count: number,
): Promise<void> {
  await expect(locator).toHaveCount(count);
}

/**
 * Assert that at least one element matching `selector` is visible
 * and contains `text` as its full text content.
 *
 * Combines visibility + text in one call, which is the most common
 * error-message assertion pattern in this codebase.
 *
 * @example
 *   await assertErrorVisible(page, '.error', 'First name is required.');
 */
export async function assertErrorVisible(
  page: Page,
  selector: string,
  text: string,
): Promise<void> {
  const locator = page.locator(selector);
  await expect(locator).toBeVisible();
  await expect(locator).toHaveText(text);
}
