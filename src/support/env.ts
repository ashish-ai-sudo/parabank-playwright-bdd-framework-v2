// ─────────────────────────────────────────────────────────────────────────────
// env.ts — Runtime environment validation and startup banner
//
// Architecture:
//  • This file is the FIRST entry in cucumber.js `require` array.
//    It ensures dotenv is loaded and critical variables are present before
//    any World, Hook, or Step file is imported.
//
//  • It calls getEnvironmentConfig() eagerly so any misconfiguration throws
//    immediately at startup (fail-fast) rather than mid-suite.
//
//  • The startup banner logs the resolved configuration to the console
//    so engineers can confirm which environment they are testing against
//    without having to inspect .env files.
//
//  • This file intentionally has no exports. It is a pure side-effect module
//    whose purpose is validation and logging.
// ─────────────────────────────────────────────────────────────────────────────

import { getEnvironmentConfig } from '../config/environment';

const config = getEnvironmentConfig();

// Startup banner — appears once per worker process
const divider = '─'.repeat(60);
console.info(divider);
console.info('  ParaBank BDD Automation Suite');
console.info(divider);
console.info(`  Environment  : ${process.env['TEST_ENV'] ?? 'local'}`);
console.info(`  Base URL     : ${config.baseUrl}`);
console.info(`  Browser      : ${config.browser}`);
console.info(`  Headless     : ${config.headless}`);
console.info(`  Timeout      : ${config.defaultTimeout}ms`);
console.info(`  Record video : ${config.recordVideo}`);
console.info(divider);
