import * as dotenv from 'dotenv';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// environment.ts — Single source of truth for all test configuration
//
// Architecture:
//  • dotenv is loaded here, not at the top of cucumber.js. This keeps the
//    JS config file free of side effects and makes the TS layer responsible
//    for environment management.
//
//  • The TEST_ENV variable selects which .env file to load:
//      (unset)         → .env           (local development)
//      TEST_ENV=staging    → .env.staging
//      TEST_ENV=production → .env.production
//    All .env.* files are gitignored. Only .env.example is committed.
//
//  • getEnvironmentConfig() returns a fully-typed EnvironmentConfig object.
//    Every consumer receives typed values — no raw process.env strings.
//
//  • The function is memoised so dotenv.config() is only called once
//    regardless of how many times the function is imported.
//
//  • Validation throws at startup for genuinely missing required values,
//    keeping the fail-fast principle consistent.
// ─────────────────────────────────────────────────────────────────────────────

/** Supported browser names. Must match Playwright launcher names exactly. */
export type SupportedBrowser = 'chromium' | 'firefox' | 'webkit';

/** Complete, typed runtime configuration. */
export interface EnvironmentConfig {
  /** Application base URL — used as Playwright context baseURL. */
  baseUrl: string;
  /** Browser to launch. */
  browser: SupportedBrowser;
  /** Run browser in headless mode. */
  headless: boolean;
  /** Milliseconds to wait between Playwright actions. 0 = disabled. */
  slowMo: number;
  /** Default element interaction timeout in milliseconds. */
  defaultTimeout: number;
  /** Page navigation timeout in milliseconds. */
  navigationTimeout: number;
  /** Record a video of each scenario. Saved to test-results/videos/. */
  recordVideo: boolean;
  /** Ignore HTTPS certificate errors. Useful for staging environments. */
  ignoreHttpsErrors: boolean;
  /** Browser viewport dimensions. */
  viewport: { width: number; height: number };
}

let _config: EnvironmentConfig | null = null;

/**
 * Returns the resolved, memoised environment configuration.
 * Safe to call multiple times — dotenv is only loaded on first invocation.
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (_config !== null) return _config;

  // Resolve the correct .env file based on TEST_ENV.
  const testEnv  = process.env['TEST_ENV'];
  const envFile  = testEnv ? `.env.${testEnv}` : '.env';
  const envPath  = path.resolve(process.cwd(), envFile);

  dotenv.config({ path: envPath });

  _config = {
    baseUrl:           requireString('BASE_URL', 'https://parabank.parasoft.com'),
    browser:           parseBrowser(process.env['BROWSER']),
    headless:          parseBoolean('HEADLESS', true),
    slowMo:            parseNumber('SLOW_MO', 0),
    defaultTimeout:    parseNumber('DEFAULT_TIMEOUT', 30_000),
    navigationTimeout: parseNumber('NAVIGATION_TIMEOUT', 60_000),
    recordVideo:       parseBoolean('RECORD_VIDEO', false),
    ignoreHttpsErrors: parseBoolean('IGNORE_HTTPS_ERRORS', false),
    viewport: {
      width:  parseNumber('VIEWPORT_WIDTH', 1280),
      height: parseNumber('VIEWPORT_HEIGHT', 720),
    },
  };

  return _config;
}

// ── Private parsing helpers ──────────────────────────────────────────────────

function requireString(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function parseBoolean(key: string, defaultValue: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined) return defaultValue;
  return raw.toLowerCase() !== 'false';
}

function parseNumber(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (raw === undefined) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`[config] ${key} must be a number, got: "${raw}"`);
  }
  return parsed;
}

function parseBrowser(raw: string | undefined): SupportedBrowser {
  const valid: SupportedBrowser[] = ['chromium', 'firefox', 'webkit'];
  const value = (raw ?? 'chromium').toLowerCase() as SupportedBrowser;
  if (!valid.includes(value)) {
    throw new Error(
      `[config] BROWSER must be one of ${valid.join(' | ')}, got: "${raw}"`,
    );
  }
  return value;
}
