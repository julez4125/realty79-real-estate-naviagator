export interface PropertyInput {
  kaufpreis: number;
  wohnflaeche: number;
  zimmer: number;
  baujahr?: number;
  ort: string;
  plz: string;
  hausgeld?: number;
  kaltmieteProQm?: number;
  kaltmieteGesamt?: number;
  stellplaetze?: number;
  stellplatzMiete?: number;
}

export interface DarlehenParams {
  darlehensSumme: number;
  zinssatz: number;
  anfangsTilgung: number;
}

export interface FinancingParams {
  eigenkapitalQuote: number;
  makler: number;
  notar: number;
  grundbuch: number;
  grunderwerbsteuer: number;
  sonstigeKaufkosten: number;
  darlehen: DarlehenParams[];
}

export interface AssumptionParams {
  mietsteigerung: number;
  kostensteigerung: number;
  wertsteigerung: number;
  afaSatz: number;
  gebaeudeAnteil: number;
  instandhaltungProQm: number;
  mietausfall: number;
  grenzsteuersatz: number;
}

export interface PurchaseCosts {
  kaufpreis: number;
  makler: number;
  notar: number;
  grundbuch: number;
  grunderwerbsteuer: number;
  sonstige: number;
  kaufnebenkosten: number;
  gesamtinvestition: number;
  darlehensSumme: number;
  eigenkapital: number;
}

export interface YearProjection {
  jahr: number;
  nettokaltmiete: number;
  warmmiete: number;
  bewirtschaftungskosten: number;
  zinsen: number;
  tilgung: number;
  cashflowOperativ: number;
  steuern: number;
  cashflowNachSteuern: number;
  kumulierterCashflow: number;
  restschuld: number;
  immobilienwert: number;
  nettovermoegen: number;
  afa: number;
}

export interface KeyMetrics {
  bruttomietrendite: number;
  nettomietrendite: number;
  kaufpreisfaktor: number;
  eigenkapitalrendite: number;
  cashflowOperativ: number;
  cashflowNachSteuern: number;
  breakEvenJahr: number | null;
  breakEvenKumCf: number | null;
  volltilgungJahr: number | null;
  vermoegenszuwachs: number;
  beleihungsreserve: number;
}

export interface CalculationResult {
  purchaseCosts: PurchaseCosts;
  metrics: KeyMetrics;
  projection: YearProjection[];
}

export const DEFAULT_FINANCING: FinancingParams = {
  eigenkapitalQuote: 0.20,
  makler: 0.0357,
  notar: 0.015,
  grundbuch: 0.005,
  grunderwerbsteuer: 0.05,
  sonstigeKaufkosten: 0,
  darlehen: [
    { darlehensSumme: 0, zinssatz: 0.03, anfangsTilgung: 0.02 },
  ],
};

export const DEFAULT_ASSUMPTIONS: AssumptionParams = {
  mietsteigerung: 0.03,
  kostensteigerung: 0.02,
  wertsteigerung: 0.02,
  afaSatz: 0.02,
  gebaeudeAnteil: 0.75,
  instandhaltungProQm: 5,
  mietausfall: 0.03,
  grenzsteuersatz: 0.42,
};
