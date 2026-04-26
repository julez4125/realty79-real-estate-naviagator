export interface Phase1Config {
  minRendite: number;       // Bruttomietrendite in % (z.B. 5.0)
  maxFaktor: number;        // Kaufpreisfaktor (z.B. 20)
  minCashflow: number;      // Quick-Cashflow in € (z.B. -200)
  maxPreisProQm: number;    // €/m² (z.B. 4000)
  minBaujahr: number;       // z.B. 1980
  minWohnflaeche: number;   // m² (z.B. 40)
  logic: 'ALL' | 'ANY';     // Alle oder mindestens eine Bedingung
}

export interface Phase2Config {
  minCfNachSteuern: number;   // Cashflow nach Steuern €/Monat
  minEkRendite: number;       // Eigenkapitalrendite in %
  maxBreakEven: number;       // Max Jahre bis Break-Even
  minMietpotenzial: number;   // Mietpotenzial in % (Soll vs Ist)
  minNettoRendite: number;    // Nettomietrendite in %
}

export interface FinancingConfig {
  eigenkapitalQuote: number;
  zinssatz: number;
  tilgung: number;
}

export interface AssumptionsConfig {
  mietsteigerung: number;
  kostensteigerung: number;
  wertsteigerung: number;
  grenzsteuersatz: number;
  afaSatz: number;
  gebaeudeAnteil: number;
  instandhaltungProQm: number;
  mietausfall: number;
}

export interface KostenConfig {
  makler: number;
  notar: number;
  grundbuch: number;
  grunderwerbsteuer: number;
}

export interface PipelineConfigFull {
  phase1: Phase1Config;
  phase2: Phase2Config;
  financing: FinancingConfig;
  assumptions: AssumptionsConfig;
  kosten: KostenConfig;
}

export interface Phase1Result {
  passed: boolean;
  checks: {
    rendite: { value: number; threshold: number; passed: boolean };
    faktor: { value: number; threshold: number; passed: boolean };
    cashflow: { value: number; threshold: number; passed: boolean };
    preisProQm: { value: number; threshold: number; passed: boolean };
    baujahr: { value: number | null; threshold: number; passed: boolean };
    wohnflaeche: { value: number; threshold: number; passed: boolean };
  };
  score: number;
}

export interface Phase2Result {
  passed: boolean;
  checks: {
    cfNachSteuern: { value: number; threshold: number; passed: boolean };
    ekRendite: { value: number; threshold: number; passed: boolean };
    breakEven: { value: number | null; threshold: number; passed: boolean };
    mietpotenzial: { value: number; threshold: number; passed: boolean };
    nettoRendite: { value: number; threshold: number; passed: boolean };
  };
  score: number;
}

export const DEFAULT_PHASE1: Phase1Config = {
  minRendite: 5.0,
  maxFaktor: 20.0,
  minCashflow: -200,
  maxPreisProQm: 4000,
  minBaujahr: 1980,
  minWohnflaeche: 40,
  logic: 'ALL',
};

export const DEFAULT_PHASE2: Phase2Config = {
  minCfNachSteuern: 0,
  minEkRendite: 5.0,
  maxBreakEven: 10,
  minMietpotenzial: 0,
  minNettoRendite: 3.0,
};

export const DEFAULT_PIPELINE: PipelineConfigFull = {
  phase1: DEFAULT_PHASE1,
  phase2: DEFAULT_PHASE2,
  financing: { eigenkapitalQuote: 0.20, zinssatz: 0.03, tilgung: 0.02 },
  assumptions: {
    mietsteigerung: 0.03,
    kostensteigerung: 0.02,
    wertsteigerung: 0.02,
    grenzsteuersatz: 0.42,
    afaSatz: 0.02,
    gebaeudeAnteil: 0.75,
    instandhaltungProQm: 5,
    mietausfall: 0.03,
  },
  kosten: { makler: 0.0357, notar: 0.015, grundbuch: 0.005, grunderwerbsteuer: 0.05 },
};
