import {
  After,
  Before,
  setDefaultTimeout,
  Status,
} from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';
import { getEnvironmentConfig } from '../config/environment';
import type { ICustomWorld } from './world';

// ─────────────────────────────────────────────────────────────────────────────
// hooks.ts — Playwright browser lifecycle management
//
// Architecture:
//  • BeforeAll / AfterAll run ONCE per worker process, not per scenario.
//    Used for global setup (e.g. seeding a test DB, starting a mock server).
//    Currently left as documented stubs — implement when needed.
//
//  • Before / After run ONCE per SCENARIO (per Cucumber World instance).
//    Each scenario gets its own browser → context → page chain.
//    This is the correct isolation boundary for web UI tests.
//
//  • New context per scenario (not new browser per scenario): launching a
//    full browser is expensive (~300 ms). Reusing the browser but creating
//    a fresh context is fast (~5 ms) and still provides complete cookie,
//    localStorage, and session isolation.
//
//  • Screenshots on failure are attached to the Cucumber HTML report via
//    this.attach(). They appear inline in the scenario's report row.
//
//  • Video recording is opt-in via RECORD_VIDEO=true. Videos are saved to
//    test-results/videos/ and are only useful during local debugging.
//
//  • setDefaultTimeout applies to every Cucumber step. Individual steps can
//    override this with { timeout: N } in their step definition options.
// ─────────────────────────────────────────────────────────────────────────────

const env = getEnvironmentConfig();

/** Map browser name strings to Playwright launcher functions. */
const BROWSER_MAP = {
  chromium,
  firefox,
  webkit,
} as const;

// Apply the configured default timeout to all Cucumber steps globally.
setDefaultTimeout(env.defaultTimeout);

// ── Per-Scenario Setup ──────────────────────────────────────────────────────

Before(async function (this: ICustomWorld) {
  const browserType = BROWSER_MAP[env.browser];

  // Launch browser — reused for the context below.
  this.browser = await browserType.launch({
    headless: env.headless,
    slowMo:   env.slowMo,
  });

  // Create an isolated context — this is the true test boundary.
  // baseURL is set here so step definitions can use page.goto('/register.htm')
  // with relative paths rather than full URLs.
  this.context = await this.browser.newContext({
    baseURL:           env.baseUrl,
    viewport:          env.viewport,
    ignoreHTTPSErrors: env.ignoreHttpsErrors,
    ...(env.recordVideo && {
      recordVideo: { dir: 'test-results/videos/' },
    }),
  });

  // Set a per-context default timeout for all page interactions.
  this.context.setDefaultTimeout(env.defaultTimeout);
  this.context.setDefaultNavigationTimeout(env.navigationTimeout);

  // Open the first (and usually only) page for this scenario.
  this.page = await this.context.newPage();
});

// ── Per-Scenario Teardown ───────────────────────────────────────────────────

After(async function (this: ICustomWorld, scenario) {
  // Capture a full-page screenshot on failure and embed it in the HTML report.
  if (scenario.result?.status === Status.FAILED) {
    try {
      if (this.page) {
        const screenshot = await this.page.screenshot({ fullPage: true });
        this.attach(screenshot, 'image/png');
      }
    } catch {
      this.log('[hooks] Screenshot capture failed after scenario failure.');
    }
  }

  // Teardown in reverse order of creation.
  // Null-guards instead of optional chaining: avoids awaiting `undefined`,
  // which ESLint's await-thenable rule correctly flags as suspicious.
  if (this.page)    await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});
