import { type Locator, type Page } from '@playwright/test';
import { createLogger } from '../utils/logger';
import { FrameworkError } from '../support/errors';

/**
 * BasePage — abstract foundation for all Page Objects.
 *
 * Design decisions:
 *  - Abstract class (not interface) so Page Objects get the `open()` navigation
 *    helper and the `locate` / `textOf` utilities for free.
 *  - `path` is abstract: every subclass MUST declare its route. This is
 *    enforced at compile time, not at runtime.
 *  - Protected helpers (`textOf`, `locate`) are accessible in subclasses
 *    but invisible to step definitions.
 *    Step definitions interact only with Page Object methods, never BasePage.
 *  - No wrapping of every Playwright method. Only methods that provide
 *    genuine value (navigation, text extraction) are here.
 *    For everything else, Page Objects use `this.page` directly.
 *
 * Usage:
 *   class LoginPage extends BasePage {
 *     protected readonly path = '/login.htm';
 *     async submitForm() { ... }
 *   }
 */
export abstract class BasePage {
  protected readonly page: Page;

  private readonly log = createLogger(this.constructor.name);

  /**
   * URL path relative to baseURL (e.g. '/login.htm').
   * Set in every concrete Page Object.
   */
  protected abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /**
   * Navigate to this page's `path` and wait for DOM content to load.
   * This is the primary method Page Objects expose for navigation.
   */
  async open(): Promise<void> {
    this.log.debug(`open() → ${this.path}`);
    const response = await this.page.goto(this.path, {
      waitUntil: 'domcontentloaded',
    });
    if (response && !response.ok() && response.status() !== 304) {
      throw FrameworkError.navigation(
        this.path,
        `server returned HTTP ${response.status()}`,
      );
    }
  }

  // ── Protected Helpers for Subclasses ──────────────────────────────────────

  /**
   * Return a Playwright Locator. Use this in Page Object methods instead
   * of calling `this.page.locator()` directly, so the log context is correct.
   */
  protected locate(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get trimmed text content from the first matching element.
   * Returns an empty string if the element has no text content.
   */
  protected async textOf(selector: string): Promise<string> {
    const text = await this.page.locator(selector).textContent();
    return text?.trim() ?? '';
  }
}
