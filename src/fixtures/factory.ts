import { randomInt, randomString } from '../utils/helpers';
import type { AddressData, TransferData, UserData } from './types';

/**
 * Test Data Factory
 *
 * Generates realistic, structurally-valid test data with:
 *  - Per-call randomness: no two calls return identical data (safe for parallel runs).
 *  - Override pattern: pass any subset of fields to control specific values
 *    without losing the generated defaults for the rest.
 *
 * Usage:
 *   const user     = buildUser();                          // fully random
 *   const existing = buildUser({ username: 'john_doe' }); // specific username
 *   const address  = buildAddress({ state: 'NY' });
 *
 * Do NOT add domain logic here (e.g. "create user via API").
 * This factory only builds data objects — it does not interact with the app.
 */

/**
 * Build a valid user registration payload.
 * All fields are generated unless explicitly overridden.
 */
export function buildUser(overrides: Partial<UserData> = {}): UserData {
  const base = randomString(6);
  // Timestamp in base-36 keeps the username short (≤14 chars) and alphanumeric.
  // ParaBank rejects usernames that are too long or contain underscores.
  const defaultUsername = `usr${Date.now().toString(36)}`;

  const defaults: UserData = {
    firstName: `Test${base}`,
    lastName:  `User${base}`,
    address:   `${randomInt(100, 9999)} Elm Street`,
    city:      'Springfield',
    state:     'IL',
    zipCode:   String(randomInt(10000, 99999)),
    ssn:       String(randomInt(100_000_000, 999_999_999)),
    username:  defaultUsername,
    // Meets common password rules: uppercase, lowercase, digit, special char.
    password:  `Pass${randomString(4)}!1`,
  };

  // Explicit cast is safe: defaults cover every required UserData field.
  return { ...defaults, ...overrides } as UserData;
}

/**
 * Build a valid mailing address.
 */
export function buildAddress(overrides: Partial<AddressData> = {}): AddressData {
  return {
    address: `${randomInt(100, 9999)} Oak Avenue`,
    city:    'Portland',
    state:   'OR',
    zipCode: String(randomInt(10000, 99999)),
    ...overrides,
  };
}

/**
 * Build a transfer instruction between two accounts.
 * Account numbers must be supplied — they are runtime values, not generated.
 */
export function buildTransfer(
  fromAccount: string,
  toAccount: string,
  overrides: Partial<TransferData> = {},
): TransferData {
  return {
    fromAccount,
    toAccount,
    amount: randomInt(10, 500),
    ...overrides,
  };
}
