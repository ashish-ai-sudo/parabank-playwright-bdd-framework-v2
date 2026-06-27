import { BasePage } from './BasePage';
import { createLogger } from '../utils/logger';

const log = createLogger('LoginPage');

/**
 * Page Object for the ParaBank login panel on the home page.
 * Path: /parabank/index.htm
 *
 * The login form lives in the left sidebar (#loginPanel) and is present
 * on every unauthenticated page. Labels are <p> tags (not <label>),
 * so inputs are located by their name attributes via the scoped #loginPanel.
 */
export class LoginPage extends BasePage {
  protected readonly path = '/parabank/index.htm';

  // ── Locators ──────────────────────────────────────────────────────────────

  // Scope to #loginPanel to avoid matching other potential textboxes on the page.
  private readonly panel        = () => this.locate('#loginPanel');
  private readonly usernameIn   = () => this.panel().locator('input[name="username"]');
  private readonly passwordIn   = () => this.panel().locator('input[name="password"]');
  private readonly loginBtn     = () => this.page.getByRole('button', { name: 'Log In' });
  private readonly accountSvc   = () => this.page.getByRole('heading', { name: 'Account Services' });

  // ── Actions ───────────────────────────────────────────────────────────────

  async login(username: string, password: string): Promise<void> {
    log.debug(`Logging in — username: ${username}`);
    await this.usernameIn().fill(username);
    await this.passwordIn().fill(password);
    await this.loginBtn().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /** True when Account Services sidebar is visible (reliable logged-in signal). */
  async isLoggedIn(): Promise<boolean> {
    return this.accountSvc().isVisible();
  }

  /** Text of the login error message element. */
  async getErrorMessage(): Promise<string> {
    return this.textOf('.error');
  }

  /** Click the Log Out link and wait for navigation back to the home page. */
  async logout(): Promise<void> {
    log.debug('Logging out');
    await this.page.locator('a').filter({ hasText: 'Log Out' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
