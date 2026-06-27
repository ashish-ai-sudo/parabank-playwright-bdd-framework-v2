import { type Locator, type Page } from '@playwright/test';
import { createLogger } from '../utils/logger';
import { FrameworkError } from '../support/errors';

/**
 * BasePage — abstract foundation for all Page Objects.
 *
 * Design decisions:
 *  - Abstract class (not interface) so Page Objects get navigation helpers
 *    for free without duplicating them.
 *  - `path` is abstract: every subclass MUST declare its route. This is
 *    enforced at compile time, not at runtime.
 *  - Internal helpers (`textOf`, `isVisible`, `locate`) are `protected` so
 *    they are accessible in subclasses but invisible to step definitions.
 *    Step definitions interact only with Page Object methods, never BasePage.
 *  - No wrapping of every Playwright method. Only methods that provide
 *    genuine value (navigation, text extraction, visibility check) are here.
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

  /**
   * Navigate to a URL that is not this page's own `path`.
   * Use sparingly — most navigation should go through Page Object `open()`.
   */
  protected async goTo(
    url: string,
    waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded',
  ): Promise<void> {
    this.log.debug(`goTo(${url})`);
    await this.page.goto(url, { waitUntil });
  }

  // ── Page State ─────────────────────────────────────────────────────────────

  /** Current page <title>. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Current full URL (including query string). */
  currentUrl(): string {
    return this.page.url();
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

  /**
   * Non-asserting visibility check. Use Playwright `expect` for assertions.
   * This is for conditional logic only (e.g. "if error banner is visible...").
   */
  protected async isVisible(selector: string): Promise<boolean> {
    return this.page.locator(selector).isVisible();
  }
}
