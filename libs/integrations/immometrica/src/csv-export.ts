import type { Page } from 'playwright';

/**
 * Triggers a CSV export for the given saved search and waits for the download to complete.
 * Returns the absolute local file path of the downloaded CSV.
 *
 * TODO M2: implement — navigate to saved search, click export button,
 * handle download-started event, return resolved file path.
 */
export async function triggerExport(
  _page: Page,
  _savedSearchId: string
): Promise<string> {
  throw new Error('triggerExport not yet implemented — see M2');
}
