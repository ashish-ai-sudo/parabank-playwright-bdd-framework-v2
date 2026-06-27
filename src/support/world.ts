import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import type { UserData } from '../fixtures/types';

// ─────────────────────────────────────────────────────────────────────────────
// CustomWorld — the bridge between Cucumber scenarios and Playwright
//
// Architecture:
//  • Cucumber instantiates a NEW World object for EVERY scenario. This is
//    what guarantees test isolation — no shared state between scenarios.
//  • The three Playwright objects are declared with the definite-assignment
//    assertion (!) because they are initialised in the Before hook, not here.
//    Accessing them before the Before hook runs is a programming error and
//    TypeScript will catch unsafe access at the call site.
//  • The exported interface (ICustomWorld) allows hooks and step definitions
//    to type `this` without importing the concrete class, keeping coupling low.
//  • setWorldConstructor registers this class as the World factory.
//    It MUST be called in a file that is required before any hooks or steps.
// ─────────────────────────────────────────────────────────────────────────────

/** Public contract — import this interface in hooks and step definitions. */
export interface ICustomWorld {
  /** Playwright Browser instance. Lifecycle managed by hooks.ts. */
  browser: Browser;
  /** Isolated browser context — one per scenario. */
  context: BrowserContext;
  /** The active page. Step definitions interact with this object. */
  page: Page;

  /**
   * Attach arbitrary data (screenshots, logs, JSON) to the Cucumber report.
   * Provided by the base World class; re-declared here for discoverability.
   */
  attach: World['attach'];
  /** Log a string to the Cucumber report output. */
  log: World['log'];
  /** User data created during the current scenario (registration flow). */
  userData?: UserData;
  /** Account balance captured during the current scenario. */
  balance?: string;
  /** Browser console errors collected during the scenario. Populated by hooks.ts. */
  consoleErrors: string[];
}

/** Concrete implementation registered as the Cucumber World factory. */
export class CustomWorld extends World implements ICustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  userData?: UserData;
  balance?: string;
  consoleErrors: string[] = [];

  constructor(options: IWorldOptions) {
    super(options);
  }
}

// Register CustomWorld BEFORE any hooks or step definitions are loaded.
setWorldConstructor(CustomWorld);
