/**
 * Framework-level constants.
 *
 * Rules:
 *  - Only put values here that are genuinely shared across multiple files.
 *  - Application route paths belong in each Page Object, not here.
 *  - Environment-driven values (baseUrl, browser) belong in environment.ts.
 */

/**
 * Named timeout durations in milliseconds.
 * Use these instead of magic numbers in step definitions and Page Objects.
 */
export const TIMEOUTS = {
  /** Default element/assertion wait — matches DEFAULT_TIMEOUT env var. */
  DEFAULT:    30_000,
  /** Full page navigation — matches NAVIGATION_TIMEOUT env var. */
  NAVIGATION: 60_000,
  /** Short wait for elements that should already be present. */
  SHORT:       5_000,
  /** Brief pause for CSS transitions or debounced inputs. */
  ANIMATION:     500,
} as const;

/**
 * Common viewport presets for multi-breakpoint testing.
 * Select via VIEWPORT_WIDTH / VIEWPORT_HEIGHT env vars, or pass directly
 * to browser.newContext({ viewport: VIEWPORT.TABLET }).
 */
export const VIEWPORT = {
  DESKTOP: { width: 1280, height:  720 },
  TABLET:  { width:  768, height: 1024 },
  MOBILE:  { width:  375, height:  812 },
} as const;
