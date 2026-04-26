import type { Browser } from 'playwright';

/**
 * Launches a stealth browser session wired with playwright-extra and the stealth plugin
 * to evade bot-detection fingerprinting.
 *
 * TODO M2: wire up proxy injection via @org/integrations-proxy.
 * TODO M3: add full fingerprint randomisation options and session persistence.
 */
export async function launchStealthBrowser(): Promise<Browser> {
  // Dynamic imports keep the heavy playwright-extra deps out of the module graph
  // until actually needed at runtime.
  const { chromium } = await import('playwright-extra');
  const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;

  chromium.use(StealthPlugin());

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  return browser as unknown as Browser;
}
