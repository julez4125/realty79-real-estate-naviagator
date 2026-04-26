import type { Page } from 'playwright';

/**
 * Signals returned by BlockDetector.detect().
 * - 'captcha'    : a CAPTCHA challenge page was detected
 * - 'rate-limit' : HTTP 429 or equivalent rate-limit response
 * - 'cloudflare' : Cloudflare challenge / JS interstitial
 * - 'none'       : no blocking detected
 */
export type BlockSignal = 'captcha' | 'rate-limit' | 'cloudflare' | 'none';

/**
 * Detects access-denial signals on a Playwright page.
 * TODO M3: implement heuristic detection rules for each BlockSignal variant.
 */
export class BlockDetector {
  /**
   * Inspect the current page state and return the most severe blocking signal found.
   * Returns 'none' if no blocking is detected.
   */
  async detect(_page: Page): Promise<BlockSignal> {
    // TODO M3: check page URL, title, and DOM for captcha/rate-limit/cloudflare indicators.
    return 'none';
  }
}
