import type { ImmometricaListing } from '../types.js';

/**
 * Parses a CSV file downloaded from Immometrica into typed listing objects.
 * Uses csv-parse for robust RFC 4180 handling.
 *
 * TODO M2: implement full column mapping, numeric coercion, and null-handling
 * for all ImmometricaListing fields. Validate required fields.
 */
export async function parseCsvFile(
  _filePath: string
): Promise<ImmometricaListing[]> {
  throw new Error('parseCsvFile not yet implemented — see M2');
}
