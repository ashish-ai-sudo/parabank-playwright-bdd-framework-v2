'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// scripts/generate-report.js
//
// Converts the Cucumber JSON output into a rich HTML report.
// Run via:  npm run report:html
// Requires: cucumber-js to have run first (produces reports/cucumber-report.json)
// ─────────────────────────────────────────────────────────────────────────────

const reporter = require('multiple-cucumber-html-reporter');
const { execSync } = require('child_process');

// Read git metadata for the report header (fails gracefully if not in a repo)
function safeExec(cmd) {
  try { return execSync(cmd).toString().trim(); }
  catch { return 'unknown'; }
}

reporter.generate({
  jsonDir:    './reports',
  reportPath: './reports/html',
  pageTitle:  'ParaBank BDD Test Report',
  reportName: 'ParaBank Automation Results',

  metadata: {
    browser:  { name: process.env.BROWSER ?? 'chromium', version: 'latest' },
    device:   process.env.CI ? 'CI Runner' : 'Local',
    platform: { name: process.platform },
  },

  customData: {
    title: 'Run Information',
    data: [
      { label: 'Project',     value: 'ParaBank BDD Automation' },
      { label: 'Branch',      value: safeExec('git rev-parse --abbrev-ref HEAD') },
      { label: 'Commit',      value: safeExec('git rev-parse --short HEAD') },
      { label: 'Environment', value: process.env.TEST_ENV ?? 'local' },
      { label: 'Base URL',    value: process.env.BASE_URL ?? 'https://parabank.parasoft.com' },
      { label: 'Executed',    value: new Date().toISOString() },
    ],
  },
});

console.info('[report] HTML report generated at reports/html/index.html');
