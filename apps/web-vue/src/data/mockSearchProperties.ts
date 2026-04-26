// ─── Interfaces ───

export interface MockSearchProperty {
  id: string
  adresse: string
  plz: string
  ort: string
  kaufpreis: number
  wohnflaeche: number
  zimmer: number
  baujahr: number
  objekttyp: 'Wohnung' | 'Mehrfamilienhaus' | 'Gewerbe' | 'Grundstück'
  kaltmieteProQm: number
  kaltmieteGesamt: number
  rendite: number // brutto %
  faktor: number
  cashflowMonat: number
  preisProQm: number
  score: number
  lat: number
  lng: number
  bildUrl?: string
}

export interface SearchFilters {
  stadtPlz: string
  preisMin: number | null
  preisMax: number | null
  flaecheMin: number | null
  flaecheMax: number | null
  zimmerMin: number | null
  baujahrMin: number | null
  renditeMin: number | null
  objekttyp: string | null
}

export interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  createdAt: string
  resultCount: number
  newResultCount: number
}

export const DEFAULT_FILTERS: SearchFilters = {
  stadtPlz: '',
  preisMin: null,
  preisMax: null,
  flaecheMin: null,
  flaecheMax: null,
  zimmerMin: null,
  baujahrMin: null,
  renditeMin: null,
  objekttyp: null,
}

// ─── Helper ───

function derive(kaufpreis: number, kaltmieteGesamt: number) {
  const rendite = +((kaltmieteGesamt * 12 / kaufpreis) * 100).toFixed(1)
  const faktor = +(kaufpreis / (kaltmieteGesamt * 12)).toFixed(1)
  // Simplified cashflow: rent minus ~55% costs minus 0.3% monthly of price
  const cashflowMonat = +(kaltmieteGesamt * 0.55 - kaufpreis * 0.003).toFixed(0)
  return { rendite, faktor, cashflowMonat }
}

function score(rendite: number, faktor: number, cashflow: number, baujahr: number): number {
  let s = 0
  // Rendite contribution (max 30)
  s += Math.min(30, rendite * 4)
  // Faktor contribution (max 25, lower is better)
  s += Math.max(0, 25 - Math.max(0, faktor - 12) * 2)
  // Cashflow contribution (max 25)
  s += Math.min(25, Math.max(0, (cashflow + 200) / 16))
  // Baujahr contribution (max 20)
  s += Math.min(20, Math.max(0, (baujahr - 1900) / 6))
  return Math.round(Math.min(100, Math.max(0, s)))
}

// ─── Mock Properties (25 across Germany) ───

function p(
  id: string,
  ort: string,
  plz: string,
  adresse: string,
  kaufpreis: number,
  wohnflaeche: number,
  zimmer: number,
  baujahr: number,
  objekttyp: MockSearchProperty['objekttyp'],
  kaltmieteGesamt: number,
  lat: number,
  lng: number,
): MockSearchProperty {
  const kpis = derive(kaufpreis, kaltmieteGesamt)
  const preisProQm = +(kaufpreis / wohnflaeche).toFixed(0)
  const kaltmieteProQm = +(kaltmieteGesamt / wohnflaeche).toFixed(2)
  return {
    id,
    ort,
    plz,
    adresse,
    kaufpreis,
    wohnflaeche,
    zimmer,
    baujahr,
    objekttyp,
    kaltmieteProQm,
    kaltmieteGesamt,
    preisProQm,
    ...kpis,
    score: score(kpis.rendite, kpis.faktor, kpis.cashflowMonat, baujahr),
    lat,
    lng,
  }
}

export const mockSearchProperties: MockSearchProperty[] = [
  // Leipzig
  p('s-1', 'Leipzig', '04109', 'Mozartstr. 12', 285000, 78, 3, 1998, 'Wohnung', 720, 51.3397, 12.3731),
  p('s-2', 'Leipzig', '04229', 'Karl-Heine-Str. 84', 195000, 55, 2, 1910, 'Wohnung', 520, 51.3328, 12.3421),
  p('s-3', 'Leipzig', '04177', 'Lindenauer Markt 6', 680000, 240, 8, 1905, 'Mehrfamilienhaus', 3200, 51.3405, 12.3318),

  // Dresden
  p('s-4', 'Dresden', '01069', 'Schillerstr. 8', 195000, 55, 2, 1992, 'Wohnung', 470, 51.0459, 13.7381),
  p('s-5', 'Dresden', '01309', 'Blasewitzer Str. 22', 310000, 85, 3, 2005, 'Wohnung', 850, 51.0511, 13.7789),

  // Berlin
  p('s-6', 'Berlin', '10115', 'Chausseestr. 45', 420000, 72, 3, 1910, 'Wohnung', 780, 52.5316, 13.3839),
  p('s-7', 'Berlin', '12049', 'Hermannstr. 120', 285000, 65, 2, 1925, 'Wohnung', 680, 52.4754, 13.4244),
  p('s-8', 'Berlin', '13357', 'Osloer Str. 88', 175000, 48, 2, 1960, 'Wohnung', 480, 52.5579, 13.3838),

  // Hamburg
  p('s-9', 'Hamburg', '20095', 'Steinstr. 14', 550000, 90, 4, 2010, 'Wohnung', 1050, 53.5511, 10.0000),
  p('s-10', 'Hamburg', '22765', 'Große Elbstr. 200', 380000, 68, 3, 1985, 'Wohnung', 850, 53.5444, 9.9355),

  // München
  p('s-11', 'München', '80331', 'Sendlinger Str. 5', 780000, 85, 3, 1965, 'Wohnung', 1200, 48.1351, 11.5737),
  p('s-12', 'München', '80939', 'Ingolstädter Str. 74', 450000, 70, 3, 1975, 'Wohnung', 980, 48.1930, 11.5897),

  // Köln
  p('s-13', 'Köln', '50667', 'Hohe Str. 12', 395000, 75, 3, 1955, 'Wohnung', 820, 50.9375, 6.9603),
  p('s-14', 'Köln', '50823', 'Venloer Str. 240', 240000, 58, 2, 1930, 'Wohnung', 600, 50.9508, 6.9189),

  // Dortmund
  p('s-15', 'Dortmund', '44135', 'Westenhellweg 55', 185000, 72, 3, 1965, 'Wohnung', 540, 51.5136, 7.4653),
  p('s-16', 'Dortmund', '44147', 'Nordstr. 130', 420000, 180, 6, 1920, 'Mehrfamilienhaus', 2100, 51.5250, 7.4544),

  // Essen
  p('s-17', 'Essen', '45127', 'Kettwiger Str. 30', 210000, 68, 3, 1958, 'Wohnung', 560, 51.4556, 7.0116),
  p('s-18', 'Essen', '45131', 'Rüttenscheider Str. 180', 295000, 80, 3, 1970, 'Wohnung', 720, 51.4379, 7.0026),

  // Nürnberg
  p('s-19', 'Nürnberg', '90402', 'Königstr. 44', 265000, 65, 3, 1975, 'Wohnung', 650, 49.4521, 11.0767),

  // Magdeburg
  p('s-20', 'Magdeburg', '39104', 'Breiter Weg 200', 125000, 60, 3, 1995, 'Wohnung', 420, 52.1205, 11.6276),
  p('s-21', 'Magdeburg', '39112', 'Leipziger Str. 44', 340000, 200, 7, 1912, 'Mehrfamilienhaus', 1800, 52.1121, 11.6171),

  // Erfurt
  p('s-22', 'Erfurt', '99084', 'Anger 50', 175000, 58, 2, 1990, 'Wohnung', 450, 50.9787, 11.0328),

  // Rostock
  p('s-23', 'Rostock', '18055', 'Kröpeliner Str. 70', 165000, 55, 2, 1998, 'Wohnung', 430, 54.0887, 12.1407),

  // Chemnitz
  p('s-24', 'Chemnitz', '09111', 'Straße der Nationen 12', 95000, 52, 2, 1960, 'Wohnung', 340, 50.8322, 12.9252),

  // Halle
  p('s-25', 'Halle', '06108', 'Große Ulrichstr. 18', 135000, 62, 3, 1985, 'Wohnung', 410, 51.4828, 11.9689),
]

// ─── Recommendation helper ───

export function getRecommendation(s: number): string {
  if (s >= 85) return 'Kaufen'
  if (s >= 65) return 'Prüfen'
  if (s >= 40) return 'Beobachten'
  return 'Ablehnen'
}

// ─── Objekttyp options ───

export const OBJEKTTYP_OPTIONS = [
  { label: 'Alle', value: null },
  { label: 'Wohnung', value: 'Wohnung' },
  { label: 'Mehrfamilienhaus', value: 'Mehrfamilienhaus' },
  { label: 'Gewerbe', value: 'Gewerbe' },
  { label: 'Grundstück', value: 'Grundstück' },
]

export const SORT_OPTIONS = [
  { label: 'Score', value: 'score' },
  { label: 'Preis', value: 'kaufpreis' },
  { label: 'Rendite', value: 'rendite' },
  { label: 'Cashflow', value: 'cashflowMonat' },
  { label: 'Fläche', value: 'wohnflaeche' },
]
