'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// cucumber.js — Cucumber-JS runner configuration
//
// Architecture notes:
//  • requireModule order matters: ts-node first (TypeScript support),
//    tsconfig-paths second (path alias resolution before any import runs).
//  • require array order matters: env.ts → world.ts → hooks.ts → steps.
//    Environment must be loaded before World is constructed; World must
//    exist before Hooks reference it.
//  • Named profiles let CI pick a targeted subset via --profile without
//    any changes to this file.
//  • publishQuiet suppresses the Cucumber Cloud publish prompt in all envs.
// ─────────────────────────────────────────────────────────────────────────────

/** @type {string[]} Files loaded for every profile, in dependency order. */
const REQUIRE = [
  'src/support/env.ts',               // 1. Load & validate environment first
  'src/support/world.ts',             // 2. Register CustomWorld before hooks
  'src/support/hooks.ts',             // 3. Register Before/After lifecycle
  'src/step-definitions/**/*.ts',     // 4. Register step definitions last
];

/** @type {string[]} CommonJS modules loaded before any test file. */
const REQUIRE_MODULE = [
  'ts-node/register',                 // TypeScript → CommonJS transpilation
];

/** @type {import('@cucumber/cucumber').IConfiguration} */
const common = {
  requireModule: REQUIRE_MODULE,
  require:       REQUIRE,
  paths:         ['features/**/*.feature'],

  // ── Formatters ───────────────────────────────────────────────────────────
  // progress-bar  → human-readable terminal output during local development
  // html          → self-contained HTML report for sharing with stakeholders
  // json          → machine-readable output consumed by multiple-cucumber-html-reporter
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
  ],

  formatOptions: {
    snippetInterface: 'async-await',  // Generate async step snippets
  },

  publishQuiet: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Profiles
// Usage: cucumber-js --profile <name>   OR   npm run test:<name>
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {

  // Default: run everything (local development, full suite)
  default: {
    ...common,
  },

  // @smoke — fast, high-confidence subset run before every merge
  smoke: {
    ...common,
    tags: '@smoke',
  },

  // @regression — full automated regression suite
  regression: {
    ...common,
    tags: '@regression',
  },

  // @security — security-specific scenarios (many are manual; document pass/fail)
  security: {
    ...common,
    tags: '@security',
  },

  // @accessibility — WCAG / ARIA scenarios
  accessibility: {
    ...common,
    tags: '@accessibility',
  },

  // @e2e — primary end-to-end assignment scenarios
  e2e: {
    ...common,
    tags: '@e2e',
  },

  // ci — optimised for pipeline: smoke + regression, parallel workers, no progress bar
  ci: {
    ...common,
    tags:     '@smoke or @regression',
    parallel: 4,                        // See: Architectural Decision #8
    format: [
      'progress',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],
  },

};
