# ParaBank BDD Automation

Enterprise-grade end-to-end test automation for [ParaBank](https://parabank.parasoft.com) — a Spring MVC banking demo application.

**Stack:** Playwright · TypeScript · Cucumber BDD · Allure Reports

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |

---

## Installation

```bash
# Install all dependencies
npm install

# Install Playwright browser binaries
npm run playwright:install
```

---

## Running Tests

### All tests (default profile)
```bash
npm test
```

### By profile
```bash
npm run test:smoke          # @smoke — fast confidence check before merge
npm run test:regression     # @regression — full regression suite
npm run test:security       # @security — security-focused scenarios
npm run test:accessibility  # @accessibility — WCAG / ARIA scenarios
npm run test:e2e            # @e2e — primary end-to-end scenarios
npm run test:ci             # CI profile: smoke + regression, 4 parallel workers
```

### By feature area
```bash
npm run test:registration
npm run test:login
npm run test:account
```

### Browser and environment options
```bash
npm run test:headed         # Run with visible browser window
npm run test:firefox        # Run in Firefox
npm run test:safari         # Run in WebKit / Safari
npm run test:staging        # Run against the staging environment
```

---

## Generating and Viewing the Allure Report

The Allure report is **generated automatically after every test run** — passing or failing. No extra step needed. The report is written to `allure-report/`.

### Open the latest report
```bash
npm run report:open
```

### Manually regenerate from existing results
```bash
npm run report:generate
```

### What the report includes

| Section | Content |
|---|---|
| **Overview** | Pass/fail counts, trend graphs, environment panel |
| **Environment** | Browser, environment name, base URL, Node version, Playwright version |
| **Suites** | Tests grouped by feature file and scenario |
| **Tags** | Tests filterable by `@smoke`, `@regression`, `@login`, etc. |
| **Attachments (failed tests)** | Full-page screenshot, current URL, browser console errors |

---

## Example Report Screenshot

> _Place a screenshot of the generated report here after your first run._

---

## Project Structure

```
.
├── features/                    # Gherkin feature files
│   ├── login.feature
│   ├── registration.feature
│   ├── account_overview.feature
│   ├── security.feature
│   ├── accessibility.feature
│   └── e2e_smoke.feature
├── src/
│   ├── config/
│   │   └── environment.ts       # Typed runtime configuration (baseURL, browser, etc.)
│   ├── fixtures/
│   │   ├── factory.ts           # Test data builders
│   │   └── types.ts             # TypeScript interfaces for test data
│   ├── pages/                   # Page Object Model
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── RegistrationPage.ts
│   │   └── AccountOverviewPage.ts
│   ├── step-definitions/        # Cucumber step implementations
│   │   ├── common.steps.ts
│   │   ├── login.steps.ts
│   │   ├── registration.steps.ts
│   │   ├── account.steps.ts
│   │   ├── security.steps.ts
│   │   └── accessibility.steps.ts
│   ├── support/
│   │   ├── world.ts             # Cucumber World — Playwright context per scenario
│   │   ├── hooks.ts             # Before/After lifecycle, Allure diagnostics
│   │   ├── env.ts               # Environment bootstrap
│   │   └── errors.ts            # Custom error types
│   └── utils/
│       ├── expect.ts            # Pre-configured Playwright expect (30 s timeout)
│       ├── helpers.ts           # Pure utility functions
│       ├── logger.ts            # Structured logger
│       └── constants.ts        # Shared constants
├── allure-results/              # Allure raw results (gitignored, created at runtime)
├── allure-report/               # Generated HTML report (gitignored)
├── reports/                     # Cucumber HTML/JSON reports (gitignored)
├── cucumber.js                  # Cucumber runner configuration and profiles
├── tsconfig.json
├── .eslintrc.json
└── .prettierrc
```

---

## Code Quality

```bash
npm run typecheck       # TypeScript type-check (zero errors expected)
npm run lint            # ESLint
npm run lint:fix        # ESLint with auto-fix
npm run format          # Prettier format
npm run format:check    # Prettier check (CI-friendly)
npm run test:dryrun     # Verify all steps are defined without executing tests
```

---

## Environment Configuration

Copy `.env.example` to `.env` and adjust values for local development.

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `https://parabank.parasoft.com` | Application under test |
| `BROWSER` | `chromium` | `chromium`, `firefox`, or `webkit` |
| `HEADLESS` | `true` | Run browser headlessly |
| `DEFAULT_TIMEOUT` | `30000` | Step timeout in ms |
| `TEST_ENV` | _(unset = local)_ | Selects `.env.<TEST_ENV>` file |

---

## Notes on the Shared Demo Server

Tests run against the public ParaBank demo at `https://parabank.parasoft.com`.
This is a shared instance — registration data persists across all users worldwide.
All test users are generated with unique timestamp-based usernames to avoid collisions.
For stable CI results, deploy a dedicated ParaBank instance.
