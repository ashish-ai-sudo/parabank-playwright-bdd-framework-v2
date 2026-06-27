import { When, Then } from '@cucumber/cucumber';
import { expect } from '../utils/expect';
import { runAxeScan } from '../utils/axeScanner';
import type { ICustomWorld } from '../support/world';

// ─── Page Navigation (for accessibility tests) ───────────────────────────────

const PAGE_URLS: Record<string, string> = {
  home:     '/parabank/index.htm',
  register: '/parabank/register.htm',
};

When(
  'the user navigates to the {string} page',
  async function (this: ICustomWorld, pageName: string) {
    const url = PAGE_URLS[pageName];
    if (!url) throw new Error(`Unknown page name: "${pageName}"`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  },
);

// ─── Page Title Check ────────────────────────────────────────────────────────

Then(
  'the browser tab title is {string}',
  async function (this: ICustomWorld, expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle);
  },
);

// ─── WCAG Accessibility Check (axe-core) ─────────────────────────────────────
//
// Runs a WCAG 2.0/2.1 AA axe scan on the current page and integrates with
// the existing Allure reporting pipeline.
//
// Attachments (always):
//   1. Full-page screenshot — visual reference of the scanned state.
//   2. Markdown summary    — human-readable violation list or "Passed" confirmation.
//
// Attachments (violations present only):
//   3. JSON payload        — complete violation objects for deep inspection.
//
// Failure threshold: only 'critical' impact violations fail the scenario.
// 'serious', 'moderate', and 'minor' violations are attached as warnings.

Then(
  'the page passes WCAG accessibility checks',
  async function (this: ICustomWorld) {
    // 1. Screenshot — capture the visual state before running the scan.
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
    } catch { /* non-critical — proceed with scan even if screenshot fails */ }

    // 2. Run the axe scan.
    const report = await runAxeScan(this.page);

    // 3. Attach human-readable markdown summary (pass or fail).
    this.attach(report.toMarkdown(), 'text/plain');

    // 4. Attach full JSON payload only when there are violations (avoids
    //    unnecessary noise on clean pages).
    if (report.violations.length > 0) {
      this.attach(report.toJSON(), 'application/json');
    }

    // 5. Fail the scenario if critical violations were found.
    if (report.hasBlockingViolations) {
      const criticalCount = report.violations.filter(
        (v) => v.impact === 'critical',
      ).length;
      throw new Error(
        `Accessibility scan failed: ${criticalCount} critical violation(s) on ${this.page.url()}. ` +
          'See attached Allure report for rule IDs, affected elements, and remediation guidance.',
      );
    }
  },
);
