'use strict';
/**
 * run-tests.js — thin wrapper used by every npm test:* script.
 *
 * 1. Wipes allure-results/ so each run produces a clean, standalone report.
 * 2. Runs cucumber-js (forwarding all CLI arguments).
 * 3. Always generates an Allure report — even when tests fail.
 * 4. Re-exits with cucumber's original exit code so CI still turns red on failures.
 *
 * Why a wrapper instead of npm post* hooks?
 * npm does NOT run postX hooks when the main script exits non-zero, so
 * the report would never be generated on a failing run.
 */

const { spawnSync } = require('node:child_process');
const fs   = require('node:fs');
const path = require('node:path');

/** Resolve a binary from the local node_modules/.bin directory. */
const bin = (name) => path.join('node_modules', '.bin', name);

// ── 1. Wipe previous allure-results so only this run's data appears ──────────
if (fs.existsSync('allure-results')) {
  fs.rmSync('allure-results', { recursive: true, force: true });
}

// ── 2. Run cucumber-js, passing all CLI arguments from the npm script ────────
const cucumberResult = spawnSync(bin('cucumber-js'), process.argv.slice(2), {
  stdio: 'inherit',
});

// ── 3. Always generate the Allure report ─────────────────────────────────────
spawnSync(
  bin('allure'),
  ['generate', 'allure-results', '-o', 'allure-report', '--clean'],
  { stdio: 'inherit' },
);

// ── 4. Exit with cucumber's original code (non-zero = failed tests) ──────────
process.exit(cucumberResult.status ?? 1);
