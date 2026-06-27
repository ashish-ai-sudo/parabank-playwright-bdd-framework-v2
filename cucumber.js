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
  paths: [
    'features/e2e_smoke.feature',          // 1. End-to-end happy path first
    'features/registration.feature',       // 2. Registration (positive + negative)
    'features/account_overview.feature',   // 3. Account overview (post-registration)
    'features/login.feature',              // 4. Login: positive → logout → negative
    'features/security.feature',           // 5. Security hardening
    'features/accessibility.feature',      // 6. Accessibility compliance
    'features/customer_lookup.feature',    // 7. Out-of-scope placeholder (no scenarios)
  ],

  // ── Formatters ───────────────────────────────────────────────────────────
  // progress-bar  → human-readable terminal output during local development
  // html          → self-contained HTML report for sharing with stakeholders
  // json          → machine-readable output consumed by multiple-cucumber-html-reporter
  // allure        → Allure-compatible results written to allure-results/
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
    'allure-cucumberjs/reporter',
  ],

  formatOptions: {
    snippetInterface: 'async-await',  // Generate async step snippets
    // Tell allure-cucumberjs how to convert the @allure.label.* tags in
    // each feature file into proper parentSuite / suite Allure labels.
    // The reporter strips everything up to and including the first ':' to
    // extract the value (e.g. @allure.label.suite:Login → suite = 'Login').
    labels: [
      { pattern: [/^@allure\.label\.parentSuite:/], name: 'parentSuite' },
      { pattern: [/^@allure\.label\.suite:/],       name: 'suite' },
    ],
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
      'allure-cucumberjs/reporter',
    ],
  },

};
