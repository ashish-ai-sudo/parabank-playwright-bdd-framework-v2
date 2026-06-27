/**
 * Pure utility helpers for test data generation.
 *
 * Rules:
 *  - Every function here must be pure (no side effects, no Playwright imports).
 *  - Do NOT add sleep() — it is an antipattern; use Playwright's expect().toPass().
 *  - Do NOT add application-specific generators here; put those in factory.ts.
 */

/**
 * Generate a random lowercase alphanumeric string of exactly `length` characters.
 */
export function randomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Generate a random integer in the range [min, max] inclusive.
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


