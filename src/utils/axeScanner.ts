import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { Result as AxeViolation } from 'axe-core';

// ─────────────────────────────────────────────────────────────────────────────
// axeScanner — reusable accessibility scan utility
//
// Wraps @axe-core/playwright with:
//  • WCAG 2.0/2.1 AA tag filtering
//  • Optional element exclusions
//  • Readable markdown + JSON output for Allure attachments
//  • A single blocking threshold: only 'critical' impact violations fail
//    the scenario. 'serious', 'moderate', and 'minor' violations are
//    reported but treated as warnings, allowing tests against a shared
//    demo server whose accessibility baseline we cannot control.
//
// Usage in step definitions:
//   const report = await runAxeScan(this.page);
//   this.attach(report.toMarkdown(), 'text/plain');
//   if (report.violations.length > 0) this.attach(report.toJSON(), 'application/json');
//   if (report.hasBlockingViolations) throw new Error('...');
// ─────────────────────────────────────────────────────────────────────────────

export interface ScanOptions {
  /**
   * CSS selectors for elements to exclude from the scan.
   * Use this for third-party widgets or known false-positives with a
   * tracking comment referencing the relevant issue.
   */
  exclude?: string[];
}

export interface AccessibilityScanReport {
  /** All violations found, regardless of impact level. */
  violations: AxeViolation[];
  /** Number of rules that passed. */
  passCount: number;
  /**
   * True when at least one violation has impact === 'critical'.
   * This is the threshold that fails the scenario.
   * 'serious' / 'moderate' / 'minor' violations are reported, not blocked.
   */
  hasBlockingViolations: boolean;
  /** Human-readable markdown summary suitable for Allure text attachment. */
  toMarkdown(): string;
  /** Full JSON payload for Allure JSON attachment. */
  toJSON(): string;
}

/** Only 'critical' impact violations are considered blocking. */
const BLOCKING_IMPACT = 'critical' as const;

/**
 * Run a WCAG 2.0/2.1 AA axe-core scan on the provided Playwright page.
 *
 * @param page     - Playwright Page instance (must be navigated before calling).
 * @param options  - Optional scan configuration (see ScanOptions).
 * @returns        An AccessibilityScanReport with results and attachment helpers.
 */
export async function runAxeScan(
  page: Page,
  options: ScanOptions = {},
): Promise<AccessibilityScanReport> {
  let builder = new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21aa',
  ]);

  for (const selector of options.exclude ?? []) {
    builder = builder.exclude(selector);
  }

  const results = await builder.analyze();
  const { violations, passes } = results;
  const hasBlockingViolations = violations.some(
    (v) => v.impact === BLOCKING_IMPACT,
  );

  return {
    violations,
    passCount: passes.length,
    hasBlockingViolations,
    toMarkdown: () => buildMarkdown(violations, passes.length),
    toJSON: () =>
      JSON.stringify({ violations, passCount: passes.length }, null, 2),
  };
}

// ── Private helpers ──────────────────────────────────────────────────────────

function buildMarkdown(
  violations: AxeViolation[],
  passCount: number,
): string {
  if (violations.length === 0) {
    return [
      '## ✅ Accessibility Scan Passed',
      '',
      `- WCAG rules checked : ${passCount}`,
      '- Violations          : 0',
    ].join('\n');
  }

  const byImpact = (level: string): AxeViolation[] =>
    violations.filter((v) => v.impact === level);

  const critical = byImpact('critical');
  const serious  = byImpact('serious');
  const moderate = byImpact('moderate');
  const minor    = byImpact('minor');

  const lines: string[] = [
    '## ❌ Accessibility Violations Found',
    '',
    `> ℹ️  Only **critical** impact violations fail the scenario.`,
    `> Serious / moderate / minor violations are reported as warnings.`,
    '',
    '| Impact   | Count |',
    '|----------|-------|',
    `| Critical  | ${critical.length} |`,
    `| Serious   | ${serious.length} |`,
    `| Moderate  | ${moderate.length} |`,
    `| Minor     | ${minor.length} |`,
    `| **Total** | **${violations.length}** |`,
    '',
    `> WCAG rules checked: ${passCount}`,
    '',
  ];

  for (const v of violations) {
    const impact = (v.impact ?? 'unknown').toUpperCase();
    lines.push(`### [${impact}] ${v.id}`);
    lines.push(`**${v.description}**`);
    lines.push(`📖 Help: ${v.helpUrl}`);
    lines.push('');
    lines.push('**Affected elements:**');
    for (const node of v.nodes) {
      const selector = node.target.join(' > ');
      lines.push(`- \`${selector}\``);
      if (node.failureSummary) {
        // Flatten multi-line summaries to a single readable line.
        const summary = node.failureSummary.replace(/\n/g, ' ').trim();
        lines.push(`  - ${summary}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}
