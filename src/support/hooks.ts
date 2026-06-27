import {
  After,
  Before,
  BeforeAll,
  setDefaultTimeout,
  Status,
} from '@cucumber/cucumber';
import * as fs from 'node:fs';
import * as path from 'node:path';
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

// ── Suite-level Setup ───────────────────────────────────────────────────────

/**
 * Write allure-results/environment.properties once per worker process.
 * Allure reads this file to populate the "Environment" panel in the report.
 * Writing it multiple times (parallel workers) is safe — content is identical.
 */
BeforeAll(function () {
  const resultsDir = 'allure-results';
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  let playwrightVersion = 'unknown';
  try {
    const pkgPath = path.join('node_modules', '@playwright', 'test', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version: string };
    playwrightVersion = pkg.version;
  } catch { /* non-critical — version stays "unknown" */ }

  const testEnv = process.env['TEST_ENV'] ?? 'local';

  const props = [
    `Browser=${env.browser}`,
    `Environment=${testEnv}`,
    `BaseURL=${env.baseUrl}`,
    `Node=${process.version}`,
    `Playwright=${playwrightVersion}`,
  ].join('\n');

  fs.writeFileSync(path.join(resultsDir, 'environment.properties'), props, 'utf-8');
});

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

  // Collect browser console errors during the scenario.
  // Attached to the Allure report on failure via the After hook.
  this.consoleErrors = [];
  this.page.on('console', (msg) => {
    if (msg.type() === 'error') this.consoleErrors.push(msg.text());
  });
});

// ── Per-Scenario Teardown ───────────────────────────────────────────────────

After(async function (this: ICustomWorld, scenario) {
  // ── Failure diagnostics ────────────────────────────────────────────────────
  // Capture rich diagnostics ONLY on failure to keep passing-test reports clean.
  // All three attachments flow through Cucumber's this.attach(), which
  // allure-cucumberjs automatically converts to named Allure attachments.
  if (scenario.result?.status === Status.FAILED) {
    if (this.page) {
      // 1. Full-page screenshot — visually shows the failure state.
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        this.attach(screenshot, 'image/png');
      } catch {
        this.log('[hooks] Screenshot capture failed after scenario failure.');
      }

      // 2. Current URL — confirms which page the failure occurred on.
      try {
        this.attach(`Current URL: ${this.page.url()}`, 'text/plain');
      } catch { /* non-critical */ }

      // 3. Browser console errors — surfaced when JS errors contributed to failure.
      if (this.consoleErrors.length > 0) {
        try {
          this.attach(
            `Browser console errors:\n${this.consoleErrors.join('\n')}`,
            'text/plain',
          );
        } catch { /* non-critical */ }
      }
    }
  }

  // Teardown in reverse order of creation.
  // Null-guards instead of optional chaining: avoids awaiting `undefined`,
  // which ESLint's await-thenable rule correctly flags as suspicious.
  if (this.page)    await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});
