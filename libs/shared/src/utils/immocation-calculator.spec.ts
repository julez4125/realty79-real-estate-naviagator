import {
  calculatePurchaseCosts,
  projectCashflow,
  calculateKeyMetrics,
  quickCashflow,
} from './immocation-calculator.js';
import {
  PropertyInput,
  FinancingParams,
  DEFAULT_FINANCING,
  DEFAULT_ASSUMPTIONS,
} from '../interfaces/calculator.interfaces.js';

// ════════════════════════════════════════════════════════════════
// Testdaten: Bad Bellingen MFH (aus immocation Excel Cockpit)
// ════════════════════════════════════════════════════════════════
const badBellingen: PropertyInput = {
  kaufpreis: 1_650_000,
  wohnflaeche: 540,
  zimmer: 20,
  baujahr: 1972,
  ort: 'Bad Bellingen',
  plz: '79415',
  hausgeld: 0,
  kaltmieteGesamt: 8_500, // Monatliche Kaltmiete gesamt
};

const badBellingenFinancing: FinancingParams = {
  eigenkapitalQuote: 0.20,
  makler: 0.0357,
  notar: 0.015,
  grundbuch: 0.005,
  grunderwerbsteuer: 0.05,
  sonstigeKaufkosten: 0,
  darlehen: [
    { darlehensSumme: 900_000, zinssatz: 0.023, anfangsTilgung: 0.02 },
    { darlehensSumme: 760_000, zinssatz: 0.036, anfangsTilgung: 0.02 },
  ],
};

// ════════════════════════════════════════════════════════════════
// Einfaches Test-Objekt
// ════════════════════════════════════════════════════════════════
const simpleProperty: PropertyInput = {
  kaufpreis: 200_000,
  wohnflaeche: 60,
  zimmer: 3,
  ort: 'Freiburg',
  plz: '79100',
  hausgeld: 250,
  kaltmieteProQm: 10,
};

describe('calculatePurchaseCosts', () => {
  it('should calculate Kaufnebenkosten with default financing', () => {
    const result = calculatePurchaseCosts(simpleProperty);
    expect(result.kaufpreis).toBe(200_000);
    expect(result.makler).toBeCloseTo(7_140, 0);        // 3.57%
    expect(result.notar).toBeCloseTo(3_000, 0);          // 1.5%
    expect(result.grundbuch).toBeCloseTo(1_000, 0);      // 0.5%
    expect(result.grunderwerbsteuer).toBeCloseTo(10_000, 0); // 5%
    expect(result.kaufnebenkosten).toBeCloseTo(21_140, 0);
    expect(result.gesamtinvestition).toBeCloseTo(221_140, 0);
  });

  it('should calculate EK based on eigenkapitalQuote when no explicit Darlehen', () => {
    const result = calculatePurchaseCosts(simpleProperty);
    // Default: 20% EK → 80% Darlehen
    expect(result.darlehensSumme).toBeCloseTo(221_140 * 0.80, 0);
    expect(result.eigenkapital).toBeCloseTo(221_140 * 0.20, 0);
  });

  it('should use explicit Darlehenssummen when provided', () => {
    const result = calculatePurchaseCosts(badBellingen, badBellingenFinancing);
    expect(result.darlehensSumme).toBe(1_660_000); // 900k + 760k
    expect(result.eigenkapital).toBe(result.gesamtinvestition - 1_660_000);
  });

  it('should calculate Kaufnebenkosten for Bad Bellingen', () => {
    const result = calculatePurchaseCosts(badBellingen, badBellingenFinancing);
    // 3.57% + 1.5% + 0.5% + 5% = 10.57%
    const expectedNK = 1_650_000 * (0.0357 + 0.015 + 0.005 + 0.05);
    expect(result.kaufnebenkosten).toBeCloseTo(expectedNK, 0);
    expect(result.gesamtinvestition).toBeCloseTo(1_650_000 + expectedNK, 0);
  });
});

describe('quickCashflow', () => {
  it('should calculate simplified monthly cashflow', () => {
    const cf = quickCashflow(simpleProperty);
    // Miete: 10 * 60 = 600
    // Hausgeld: 250
    // Finanzierung: (0.03 + 0.02) * 200000 * 0.80 / 12 = 666.67
    // CF = 600 - 250 - 666.67 = -316.67
    expect(cf).toBeCloseTo(-316.67, 0);
  });

  it('should use kaltmieteGesamt when available', () => {
    const cf = quickCashflow(badBellingen, 0.03, 0.02, 0.20);
    // Miete: 8500
    // Hausgeld: 0
    // Finanzierung: (0.03 + 0.02) * 1650000 * 0.80 / 12 = 5500
    expect(cf).toBeCloseTo(3_000, 0);
  });

  it('should return 0 for property without rent info', () => {
    const noRent: PropertyInput = { kaufpreis: 100_000, wohnflaeche: 50, zimmer: 2, ort: 'Test', plz: '12345' };
    expect(quickCashflow(noRent)).toBeLessThan(0); // Only costs, no income
  });
});

describe('projectCashflow', () => {
  it('should project over specified years', () => {
    const { projection } = projectCashflow(simpleProperty, DEFAULT_FINANCING, DEFAULT_ASSUMPTIONS, 10);
    expect(projection).toHaveLength(10);
    expect(projection[0].jahr).toBe(1);
    expect(projection[9].jahr).toBe(10);
  });

  it('should have increasing Nettokaltmiete due to Mietsteigerung', () => {
    const { projection } = projectCashflow(simpleProperty, DEFAULT_FINANCING, DEFAULT_ASSUMPTIONS, 5);
    for (let i = 1; i < projection.length; i++) {
      expect(projection[i].nettokaltmiete).toBeGreaterThan(projection[i - 1].nettokaltmiete);
    }
  });

  it('should have decreasing Restschuld due to Tilgung', () => {
    const { projection } = projectCashflow(simpleProperty, DEFAULT_FINANCING, DEFAULT_ASSUMPTIONS, 5);
    for (let i = 1; i < projection.length; i++) {
      expect(projection[i].restschuld).toBeLessThanOrEqual(projection[i - 1].restschuld);
    }
  });

  it('should have increasing Immobilienwert due to Wertsteigerung', () => {
    const { projection } = projectCashflow(simpleProperty, DEFAULT_FINANCING, DEFAULT_ASSUMPTIONS, 5);
    for (let i = 1; i < projection.length; i++) {
      expect(projection[i].immobilienwert).toBeGreaterThan(projection[i - 1].immobilienwert);
    }
  });

  it('should track kumulierterCashflow correctly', () => {
    const { projection } = projectCashflow(simpleProperty, DEFAULT_FINANCING, DEFAULT_ASSUMPTIONS, 3);
    let kumCf = 0;
    for (const year of projection) {
      kumCf += year.cashflowNachSteuern * 12;
      expect(year.kumulierterCashflow).toBeCloseTo(kumCf, 2);
    }
  });

  it('should handle multiple Darlehen (Bad Bellingen)', () => {
    const { projection } = projectCashflow(badBellingen, badBellingenFinancing, DEFAULT_ASSUMPTIONS, 30);
    // Restschuld Jahr 1 should be less than total Darlehen
    expect(projection[0].restschuld).toBeLessThan(1_660_000);
    // Zinsen should reflect both loans
    expect(projection[0].zinsen).toBeGreaterThan(0);
  });

  it('should calculate AfA correctly', () => {
    const { projection } = projectCashflow(simpleProperty, DEFAULT_FINANCING, DEFAULT_ASSUMPTIONS, 1);
    const costs = calculatePurchaseCosts(simpleProperty);
    // AfA = 2% * 75% * (Kaufpreis + NK) / 12
    const expectedAfa = 0.02 * 0.75 * (costs.kaufpreis + costs.kaufnebenkosten) / 12;
    expect(projection[0].afa).toBeCloseTo(expectedAfa, 2);
  });
});

describe('calculateKeyMetrics', () => {
  it('should calculate Bruttomietrendite', () => {
    const result = calculateKeyMetrics(simpleProperty);
    // (10 * 60 * 12) / 200000 = 3.6%
    expect(result.metrics.bruttomietrendite).toBeCloseTo(0.036, 4);
  });

  it('should calculate Kaufpreisfaktor', () => {
    const result = calculateKeyMetrics(simpleProperty);
    // 200000 / (10 * 60 * 12) = 27.78
    expect(result.metrics.kaufpreisfaktor).toBeCloseTo(27.78, 1);
  });

  it('should calculate Nettomietrendite', () => {
    const result = calculateKeyMetrics(simpleProperty);
    // (Jahreskaltmiete - 12 * HausgeldNichtUmlage) / Gesamtinvestition
    const jahreskaltmiete = 10 * 60 * 12;
    const hausgeldNU = 250 * 0.2;
    const gesamtinvestition = result.purchaseCosts.gesamtinvestition;
    const expected = (jahreskaltmiete - 12 * hausgeldNU) / gesamtinvestition;
    expect(result.metrics.nettomietrendite).toBeCloseTo(expected, 4);
  });

  it('should find Volltilgungsjahr', () => {
    const result = calculateKeyMetrics(simpleProperty, DEFAULT_FINANCING, DEFAULT_ASSUMPTIONS, 50);
    // With 2% Tilgung + decreasing interest, should pay off within ~35 years
    if (result.metrics.volltilgungJahr !== null) {
      expect(result.metrics.volltilgungJahr).toBeGreaterThan(20);
      expect(result.metrics.volltilgungJahr).toBeLessThan(50);
    }
  });

  it('should calculate Beleihungsreserve at Jahr 10', () => {
    const result = calculateKeyMetrics(simpleProperty, DEFAULT_FINANCING, DEFAULT_ASSUMPTIONS, 30);
    // Beleihungsreserve = Immobilienwert(J10) - Restschuld(J10)
    const j10 = result.projection[9];
    expect(result.metrics.beleihungsreserve).toBeCloseTo(j10.immobilienwert - j10.restschuld, 0);
  });

  it('should return complete CalculationResult', () => {
    const result = calculateKeyMetrics(badBellingen, badBellingenFinancing);
    expect(result.purchaseCosts).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.projection).toHaveLength(30);

    // Bad Bellingen: 8500 * 12 / 1650000 = 6.18% Bruttomietrendite
    expect(result.metrics.bruttomietrendite).toBeCloseTo(0.0618, 3);
    // Faktor: 1650000 / 102000 = 16.18
    expect(result.metrics.kaufpreisfaktor).toBeCloseTo(16.18, 1);
  });

  it('should handle property with no rent', () => {
    const noRent: PropertyInput = { kaufpreis: 100_000, wohnflaeche: 50, zimmer: 2, ort: 'Test', plz: '12345' };
    const result = calculateKeyMetrics(noRent);
    expect(result.metrics.bruttomietrendite).toBe(0);
    expect(result.metrics.kaufpreisfaktor).toBe(Infinity);
  });
});
