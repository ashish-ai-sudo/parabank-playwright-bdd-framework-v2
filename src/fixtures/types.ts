/**
 * TypeScript interfaces for test data shapes.
 *
 * These represent the data the application accepts, not DOM selectors.
 * Keep them in sync with the application's form contracts.
 *
 * Populated by factory.ts — not hardcoded anywhere else.
 */

/** Registration / profile data for a bank customer. */
export interface UserData {
  firstName: string;
  lastName:  string;
  address:   string;
  city:      string;
  state:     string;
  zipCode:   string;
  /** Optional: ParaBank does not require a phone number. */
  phone?:    string;
  /** Social Security Number — used for account lookup. */
  ssn:       string;
  username:  string;
  password:  string;
}

/** Standalone mailing address — used in transfer/billpay forms. */
export interface AddressData {
  address: string;
  city:    string;
  state:   string;
  zipCode: string;
}

/** A financial transfer instruction between two accounts. */
export interface TransferData {
  fromAccount: string;
  toAccount:   string;
  amount:      number;
}
