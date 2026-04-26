/**
 * Shared mock/demo property data used across Triage, List, and Comparison views.
 * Single source of truth so all views show the same properties.
 */

export interface MockTriageProperty {
  id: string
  adresse: string
  plz: string
  ort: string
  kaufpreis: number
  wohnflaeche: number
  zimmer: number
  baujahr: number
  rendite?: number
  score?: number
  bildUrl?: string
}

export interface MockComparisonProperty {
  id: string
  strasse?: string
  adresse?: string
  plz: string
  ort: string
  phase?: number
  kaufpreis: number
  wohnflaeche: number
  preisProQm: number
  zimmer: number
  baujahr: number
  kaltmiete: number
  bruttorendite: number
  nebenkosten: number
  cashflowMonat: number
  score?: number
}

/** Core mock properties — used by Triage and List views */
export const mockProperties: MockTriageProperty[] = [
  {
    id: 'mock-1',
    adresse: 'Mozartstrasse 12',
    plz: '04109',
    ort: 'Leipzig',
    kaufpreis: 285000,
    wohnflaeche: 78,
    zimmer: 3,
    baujahr: 1925,
    rendite: 6.2,
    score: 87,
  },
  {
    id: 'mock-2',
    adresse: 'Schillerstr. 8',
    plz: '01069',
    ort: 'Dresden',
    kaufpreis: 195000,
    wohnflaeche: 55,
    zimmer: 2,
    baujahr: 1960,
    rendite: 5.8,
    score: 72,
  },
  {
    id: 'mock-3',
    adresse: 'Goetheweg 23',
    plz: '06108',
    ort: 'Halle (Saale)',
    kaufpreis: 149000,
    wohnflaeche: 62,
    zimmer: 3,
    baujahr: 1935,
    rendite: 7.1,
    score: 91,
  },
  {
    id: 'mock-4',
    adresse: 'Lutherstr. 5',
    plz: '09111',
    ort: 'Chemnitz',
    kaufpreis: 89000,
    wohnflaeche: 48,
    zimmer: 2,
    baujahr: 1910,
    rendite: 8.4,
    score: 65,
  },
  {
    id: 'mock-5',
    adresse: 'Am Markt 17',
    plz: '04105',
    ort: 'Leipzig',
    kaufpreis: 425000,
    wohnflaeche: 105,
    zimmer: 4,
    baujahr: 1898,
    rendite: 4.9,
    score: 78,
  },
  {
    id: 'mock-6',
    adresse: 'Bergstr. 3a',
    plz: '01067',
    ort: 'Dresden',
    kaufpreis: 220000,
    wohnflaeche: 70,
    zimmer: 3,
    baujahr: 1975,
    rendite: 6.5,
    score: 83,
  },
  {
    id: 'mock-7',
    adresse: 'Kantstr. 41',
    plz: '04275',
    ort: 'Leipzig',
    kaufpreis: 175000,
    wohnflaeche: 58,
    zimmer: 2,
    baujahr: 1952,
    rendite: 7.8,
    score: 44,
  },
]

/**
 * Enriched mock properties for the Comparison view.
 * Uses the same 5 most varied properties (mock-1 through mock-5) with additional financial fields.
 */
export const mockComparisonProperties: MockComparisonProperty[] = [
  {
    id: 'mock-1',
    strasse: 'Mozartstrasse 12',
    plz: '04109',
    ort: 'Leipzig',
    phase: 2,
    kaufpreis: 285000,
    wohnflaeche: 78,
    preisProQm: 3654,
    zimmer: 3,
    baujahr: 1925,
    kaltmiete: 620,
    bruttorendite: 0.062,
    nebenkosten: 38500,
    cashflowMonat: 142,
    score: 87,
  },
  {
    id: 'mock-2',
    strasse: 'Schillerstr. 8',
    plz: '01069',
    ort: 'Dresden',
    phase: 1,
    kaufpreis: 195000,
    wohnflaeche: 55,
    preisProQm: 3545,
    zimmer: 2,
    baujahr: 1960,
    kaltmiete: 480,
    bruttorendite: 0.058,
    nebenkosten: 26300,
    cashflowMonat: 85,
    score: 72,
  },
  {
    id: 'mock-3',
    strasse: 'Goetheweg 23',
    plz: '06108',
    ort: 'Halle (Saale)',
    phase: 3,
    kaufpreis: 149000,
    wohnflaeche: 62,
    preisProQm: 2403,
    zimmer: 3,
    baujahr: 1935,
    kaltmiete: 440,
    bruttorendite: 0.071,
    nebenkosten: 20100,
    cashflowMonat: 198,
    score: 91,
  },
  {
    id: 'mock-4',
    strasse: 'Lutherstr. 5',
    plz: '09111',
    ort: 'Chemnitz',
    phase: 1,
    kaufpreis: 89000,
    wohnflaeche: 48,
    preisProQm: 1854,
    zimmer: 2,
    baujahr: 1910,
    kaltmiete: 310,
    bruttorendite: 0.084,
    nebenkosten: 12000,
    cashflowMonat: 215,
    score: 65,
  },
  {
    id: 'mock-5',
    strasse: 'Am Markt 17',
    plz: '04105',
    ort: 'Leipzig',
    phase: 2,
    kaufpreis: 425000,
    wohnflaeche: 105,
    preisProQm: 4048,
    zimmer: 4,
    baujahr: 1898,
    kaltmiete: 870,
    bruttorendite: 0.049,
    nebenkosten: 57400,
    cashflowMonat: -45,
    score: 78,
  },
]

/**
 * Portfolio / Bestandswohnungen — properties the user already owns.
 * These match the renters in RentersPage (Berlin, München, Frankfurt).
 */
export interface MockPortfolioProperty {
  id: string
  adresse: string
  ort: string
  plz: string
  kaufpreis: number
  wohnflaeche: number
  zimmer: number
  baujahr: number
  kaltmiete: number
  cashflowMonat: number
  bruttoRendite: number
  phase: number
  score: number
  einheiten: number
  darlehen: number
  marktwert: number
}

export const mockPortfolioProperties: MockPortfolioProperty[] = [
  {
    id: 'bestand-1',
    adresse: 'Berliner Str. 42',
    ort: 'Berlin',
    plz: '10115',
    kaufpreis: 520000,
    wohnflaeche: 185,
    zimmer: 6,
    baujahr: 1928,
    kaltmiete: 2650,
    cashflowMonat: 485,
    bruttoRendite: 0.061,
    phase: 3,
    score: 82,
    einheiten: 3,
    darlehen: 364000,
    marktwert: 620000,
  },
  {
    id: 'bestand-2',
    adresse: 'Hauptstr. 15',
    ort: 'München',
    plz: '80331',
    kaufpreis: 890000,
    wohnflaeche: 240,
    zimmer: 8,
    baujahr: 1965,
    kaltmiete: 4200,
    cashflowMonat: 320,
    bruttoRendite: 0.057,
    phase: 3,
    score: 88,
    einheiten: 4,
    darlehen: 623000,
    marktwert: 1050000,
  },
  {
    id: 'bestand-3',
    adresse: 'Schillerstr. 8',
    ort: 'Frankfurt',
    plz: '60313',
    kaufpreis: 380000,
    wohnflaeche: 142,
    zimmer: 5,
    baujahr: 1972,
    kaltmiete: 1980,
    cashflowMonat: -65,
    bruttoRendite: 0.063,
    phase: 3,
    score: 75,
    einheiten: 2,
    darlehen: 304000,
    marktwert: 430000,
  },
]

/**
 * Convert a triage mock property to the list view format expected by property cards.
 * Generates realistic analysis data from the base property fields.
 */
export function mockToListProperty(m: MockTriageProperty) {
  const preisProQm = Math.round(m.kaufpreis / m.wohnflaeche)
  const bruttorendite = m.rendite ? m.rendite / 100 : 0.05
  const kaltmiete = Math.round((m.kaufpreis * bruttorendite) / 12)
  const cashflow = Math.round(kaltmiete * 0.55 - m.kaufpreis * 0.003 / 12)

  return {
    id: m.id,
    ort: m.ort,
    plz: m.plz,
    strasse: m.adresse,
    kaufpreis: m.kaufpreis,
    wohnflaeche: m.wohnflaeche,
    zimmer: m.zimmer,
    preisProQm,
    phase: m.score && m.score >= 80 ? 2 : m.score && m.score >= 60 ? 1 : 3,
    score: m.score,
    recommendation: m.score && m.score >= 85 ? 'Kaufen' : m.score && m.score >= 65 ? 'Pruefen' : 'Beobachten',
    isFavorite: false,
    analysis: {
      bruttomietrendite: bruttorendite,
      cashflowNachSteuern: cashflow,
      kaufpreisfaktor: Math.round(m.kaufpreis / (kaltmiete * 12) * 10) / 10,
      eigenkapitalrendite: bruttorendite * 2.5,
    },
  }
}
