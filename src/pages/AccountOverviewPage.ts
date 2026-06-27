import { BasePage } from './BasePage';
import { createLogger } from '../utils/logger';

const log = createLogger('AccountOverviewPage');

/**
 * Page Object for the ParaBank Accounts Overview page.
 * Path: /parabank/overview.htm
 *
 * Table structure:
 *   <table id="accountTable">
 *     <thead>  — column headers (Account, Balance*, Available Amount)
 *     <tbody>  — data rows (one per account) + one "Total" summary row
 *     <tfoot>  — footnote row
 *   </table>
 *
 * Data rows are distinguished from the Total row by the presence of an
 * <a> element (account number link) in the first cell.
 */
export class AccountOverviewPage extends BasePage {
  protected readonly path = '/parabank/overview.htm';

  // ── Locators ──────────────────────────────────────────────────────────────

  /** The full accounts table. Use for visibility assertions. */
  readonly accountTable  = () => this.locate('#accountTable');

  /** Account data rows only — excludes the "Total" summary row. */
  private readonly dataRows     = () => this.locate('#accountTable tbody tr:has(a)');

  // ── Queries ───────────────────────────────────────────────────────────────

  /** Whether at least one account data row is present (waits for AJAX load). */
  async hasAccounts(): Promise<boolean> {
    try {
      await this.dataRows().first().waitFor({ state: 'visible', timeout: 15_000 });
    } catch {
      return false;
    }
    return (await this.dataRows().count()) > 0;
  }

  /**
   * Balance of the first account in the table (e.g. "$515.50").
   * Returns the trimmed text of the Balance* column for the first data row.
   */
  async getFirstAccountBalance(): Promise<string> {
    const firstRow = this.dataRows().first();
    const balanceCell = firstRow.locator('td').nth(1);
    const text = await balanceCell.textContent();
    log.debug(`First account balance: ${text?.trim() ?? 'n/a'}`);
    return text?.trim() ?? '';
  }

  /**
   * Account number displayed as the link text in the first account row.
   * Returns a numeric string, e.g. "16230".
   */
  async getFirstAccountNumber(): Promise<string> {
    const link = this.dataRows().first().locator('a');
    const text = await link.textContent();
    return text?.trim() ?? '';
  }
}
