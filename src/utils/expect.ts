/**
 * Pre-configured Playwright expect.
 *
 * WHY THIS FILE EXISTS
 * ────────────────────
 * In a @playwright/test project, expect timeout is set in playwright.config.ts
 * under `use.expect.timeout`. That config is read by the @playwright/test
 * runner — which we do NOT use. Our runner is cucumber-js, which ignores
 * playwright.config.ts entirely.
 *
 * expect.configure() creates a NEW expect instance with the given timeout
 * (verified: it does not mutate the global). By importing `expect` from
 * THIS file instead of from '@playwright/test', every assertion in the
 * framework uses the same timeout that controls browser actions, keeping
 * behaviour consistent and predictable.
 *
 * USAGE (in step definitions and assertion helpers)
 * ─────────────────────────────────────────────────
 *   // ✅ correct — uses framework timeout
 *   import { expect } from '../utils/expect';
 *
 *   // ❌ avoid — uses Playwright's hardcoded 5 000 ms default
 *   import { expect } from '@playwright/test';
 */

import { expect as _expect } from '@playwright/test';
import { getEnvironmentConfig } from '../config/environment';

const { defaultTimeout } = getEnvironmentConfig();

/**
 * Playwright `expect` configured with the framework's DEFAULT_TIMEOUT.
 * Drop-in replacement for the `expect` export from '@playwright/test'.
 */
export const expect = _expect.configure({ timeout: defaultTimeout });

// Re-export Playwright types that consumers commonly need alongside expect,
// so they have a single import point for assertion work.
export type { Locator, Page } from '@playwright/test';
