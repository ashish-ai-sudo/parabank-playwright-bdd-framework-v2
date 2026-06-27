/**
 * FrameworkError — a typed error class for infrastructure-level failures.
 *
 * Use this (instead of plain `new Error()`) when throwing from BasePage,
 * utilities, or hooks. The `context` field carries structured metadata that
 * CI reporters can display without parsing error message strings.
 *
 * Application-level failures (assertion failures, unexpected page state)
 * should be left as Playwright's native errors — they are already excellent.
 */
export class FrameworkError extends Error {
  /** Structured metadata for CI debugging. */
  readonly context: Readonly<Record<string, unknown>>;

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name    = 'FrameworkError';
    this.context = Object.freeze(context);
    // Required for correct instanceof checks when compiling to ES5/CJS.
    Object.setPrototypeOf(this, FrameworkError.prototype);
  }

  /**
   * Convenience factory for navigation failures.
   * @example
   *   throw FrameworkError.navigation('/login.htm', 'Page did not reach domcontentloaded');
   */
  static navigation(path: string, reason: string): FrameworkError {
    return new FrameworkError(`Navigation failed: ${reason}`, { path });
  }

  /**
   * Convenience factory for element interaction failures.
   * @example
   *   throw FrameworkError.interaction('click', '#submit-btn', originalError.message);
   */
  static interaction(
    action: string,
    selector: string,
    reason: string,
  ): FrameworkError {
    return new FrameworkError(`Interaction failed: ${action} on "${selector}" — ${reason}`, {
      action,
      selector,
    });
  }

  /** Human-readable string including context for log output. */
  override toString(): string {
    const ctx = JSON.stringify(this.context);
    return `${this.name}: ${this.message} ${ctx}`;
  }
}
