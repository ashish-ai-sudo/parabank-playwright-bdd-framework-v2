import { type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { createLogger } from '../utils/logger';
import type { UserData } from '../fixtures/types';

const log = createLogger('RegistrationPage');

/**
 * Page Object for the ParaBank customer registration form.
 * Path: /parabank/register.htm
 *
 * The form uses Spring MVC dot-notation IDs (e.g. "customer.firstName").
 * Attribute selectors [id="..."] are used instead of CSS #customer\.firstName
 * escaping — they are equivalent and easier to read.
 */
export class RegistrationPage extends BasePage {
  protected readonly path = '/parabank/register.htm';

  // ── Locators ──────────────────────────────────────────────────────────────

  private readonly firstName    = () => this.locate('[id="customer.firstName"]');
  private readonly lastName     = () => this.locate('[id="customer.lastName"]');
  private readonly address      = () => this.locate('[id="customer.address.street"]');
  private readonly city         = () => this.locate('[id="customer.address.city"]');
  private readonly state        = () => this.locate('[id="customer.address.state"]');
  private readonly zipCode      = () => this.locate('[id="customer.address.zipCode"]');
  private readonly phone        = () => this.locate('[id="customer.phoneNumber"]');
  private readonly ssn          = () => this.locate('[id="customer.ssn"]');
  private readonly username     = () => this.locate('[id="customer.username"]');
  private readonly password     = () => this.locate('[id="customer.password"]');
  private readonly confirmPw    = () => this.locate('#repeatedPassword');
  private readonly registerBtn  = () => this.page.getByRole('button', { name: 'Register' });

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Fill every field in the registration form from a UserData object. */
  async fillForm(user: UserData): Promise<void> {
    log.debug(`Filling registration form — username: ${user.username}`);
    await this.firstName().fill(user.firstName);
    await this.lastName().fill(user.lastName);
    await this.address().fill(user.address);
    await this.city().fill(user.city);
    await this.state().fill(user.state);
    await this.zipCode().fill(user.zipCode);
    if (user.phone) await this.phone().fill(user.phone);
    await this.ssn().fill(user.ssn);
    await this.username().fill(user.username);
    await this.password().fill(user.password);
    await this.confirmPw().fill(user.password);
  }

  /** Click the Register button and wait for the response. */
  async submit(): Promise<void> {
    await this.registerBtn().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Convenience: fill form and submit in one call. */
  async register(user: UserData): Promise<void> {
    await this.fillForm(user);
    await this.submit();
  }

  /**
   * Clear a single form field by its display label.
   * Used by the required-field validation Scenario Outline: fill all fields
   * with valid data, clear one, then submit to trigger that field's error.
   */
  async clearField(fieldLabel: string): Promise<void> {
    await this.fieldByLabel(fieldLabel).fill('');
  }

  /**
   * Override the confirm-password field with an explicit value.
   * Use this to set up a password-mismatch scenario without re-filling the whole form.
   */
  async setConfirmPassword(value: string): Promise<void> {
    await this.confirmPw().fill(value);
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /** Text of the success paragraph shown after a successful registration. */
  async getSuccessMessage(): Promise<string> {
    return this.textOf('#rightPanel p');
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private fieldByLabel(fieldLabel: string): Locator {
    const fields: Partial<Record<string, Locator>> = {
      'First Name':       this.firstName(),
      'Last Name':        this.lastName(),
      'Address':          this.address(),
      'City':             this.city(),
      'State':            this.state(),
      'Zip Code':         this.zipCode(),
      'SSN':              this.ssn(),
      'Username':         this.username(),
      'Password':         this.password(),
      'Confirm Password': this.confirmPw(),
    };
    const locator = fields[fieldLabel];
    if (!locator) throw new Error(`Unknown registration field label: "${fieldLabel}"`);
    return locator;
  }
}
