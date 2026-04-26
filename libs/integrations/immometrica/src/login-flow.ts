import type { Browser, Page } from 'playwright';

export interface ImmometricaCreds {
  user: string;
  pass: string;
}

/**
 * Authenticates against the Immometrica portal and returns an authenticated Page.
 *
 * TODO M2: implement full login flow — navigate to login URL, fill credentials,
 * handle 2FA if present, verify session cookie, return authenticated page.
 */
export async function loginToImmometrica(
  _browser: Browser,
  _creds: ImmometricaCreds
): Promise<Page> {
  throw new Error('loginToImmometrica not yet implemented — see M2');
}
