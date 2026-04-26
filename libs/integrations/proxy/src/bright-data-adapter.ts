/**
 * Generic proxy adapter interface.
 * Implementations return the credentials needed to configure a browser proxy session.
 */
export interface ProxyAdapter {
  getProxy(): { server: string; username: string; password: string };
}

/**
 * BrightData residential proxy adapter.
 * Reads BRIGHTDATA_SERVER, BRIGHTDATA_USERNAME, BRIGHTDATA_PASSWORD from env vars.
 *
 * TODO M3: add zone selection, session pinning, and health-check rotation logic.
 */
export class BrightDataAdapter implements ProxyAdapter {
  getProxy(): { server: string; username: string; password: string } {
    const server = process.env['BRIGHTDATA_SERVER'];
    const username = process.env['BRIGHTDATA_USERNAME'];
    const password = process.env['BRIGHTDATA_PASSWORD'];

    if (!server || !username || !password) {
      throw new Error(
        'BrightDataAdapter: missing env vars BRIGHTDATA_SERVER, BRIGHTDATA_USERNAME, BRIGHTDATA_PASSWORD'
      );
    }

    return { server, username, password };
  }
}
