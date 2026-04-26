/**
 * A single real-estate listing as parsed from an Immometrica CSV export.
 */
export interface ImmometricaListing {
  sourceUrl: string;
  title: string;
  kaufpreis: number | null;
  kaltmiete: number | null;
  baujahr: number | null;
  m2: number | null;
  plz: string;
  ort: string;
  bundesland: string;
  zimmer: number | null;
  etage: number | null;
  objektart: string;
  vermarktungsart: 'kauf' | 'miete' | 'unknown';
  exportedAt: string;
}

/**
 * Represents a downloaded CSV export file from the Immometrica portal.
 */
export interface ExportFile {
  path: string;
  fetchedAt: string;
  listings: ImmometricaListing[];
}
