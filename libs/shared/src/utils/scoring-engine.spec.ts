import { evaluatePhase1, evaluatePhase2, calculateOverallScore } from './scoring-engine';
import { PropertyInput } from '../interfaces/calculator.interfaces';
import { DEFAULT_PIPELINE, DEFAULT_PHASE1, DEFAULT_PHASE2 } from '../interfaces/pipeline.interfaces';

const goodProperty: PropertyInput = {
  kaufpreis: 150_000,
  wohnflaeche: 70,
  zimmer: 3,
  baujahr: 2000,
  ort: 'Lörrach',
  plz: '79539',
  hausgeld: 200,
  kaltmieteGesamt: 700,
};

const badProperty: PropertyInput = {
  kaufpreis: 500_000,
  wohnflaeche: 30,
  zimmer: 1,
  baujahr: 1950,
  ort: 'München',
  plz: '80331',
  hausgeld: 400,
  kaltmieteProQm: 8,
};

describe('evaluatePhase1', () => {
  it('should pass a good property', () => {
    const result = evaluatePhase1(goodProperty);
    // Rendite: 700*12/150000 = 5.6% → pass (>5%)
    expect(result.checks.rendite.passed).toBe(true);
    // Faktor: 150000/8400 = 17.86 → pass (<20)
    expect(result.checks.faktor.passed).toBe(true);
    // Wohnfläche: 70 → pass (>40)
    expect(result.checks.wohnflaeche.passed).toBe(true);
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should fail a bad property (ALL logic)', () => {
    const result = evaluatePhase1(badProperty);
    // Rendite: 8*30*12/500000 = 5.76% → pass
    // Faktor: 500000/2880 = 173.6 → fail (>20)
    expect(result.checks.faktor.passed).toBe(false);
    // PreisProQm: 500000/30 = 16666 → fail (>4000)
    expect(result.checks.preisProQm.passed).toBe(false);
    // Baujahr: 1950 → fail (<1980)
    expect(result.checks.baujahr.passed).toBe(false);
    // Wohnfläche: 30 → fail (<40)
    expect(result.checks.wohnflaeche.passed).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('should pass with ANY logic when at least one check passes', () => {
    // Property where some checks pass and some fail
    const mixedProperty: PropertyInput = {
      kaufpreis: 100_000, wohnflaeche: 80, zimmer: 3, baujahr: 1960,
      ort: 'Test', plz: '12345', kaltmieteGesamt: 500,
    };
    // Rendite: 500*12/100000 = 6% → pass. Baujahr: 1960 → fail.
    const anyConfig = { ...DEFAULT_PHASE1, logic: 'ANY' as const };
    const result = evaluatePhase1(mixedProperty, anyConfig);
    expect(result.passed).toBe(true);

    // Same property with ALL logic should fail
    const allConfig = { ...DEFAULT_PHASE1, logic: 'ALL' as const };
    const resultAll = evaluatePhase1(mixedProperty, allConfig);
    expect(resultAll.passed).toBe(false);
  });

  it('should handle missing baujahr gracefully', () => {
    const noBaujahr: PropertyInput = { ...goodProperty, baujahr: undefined };
    const result = evaluatePhase1(noBaujahr);
    expect(result.checks.baujahr.passed).toBe(true); // null baujahr passes
  });

  it('should return score between 0-100', () => {
    const good = evaluatePhase1(goodProperty);
    const bad = evaluatePhase1(badProperty);
    expect(good.score).toBeGreaterThanOrEqual(0);
    expect(good.score).toBeLessThanOrEqual(100);
    expect(bad.score).toBeGreaterThanOrEqual(0);
    expect(bad.score).toBeLessThanOrEqual(100);
    expect(good.score).toBeGreaterThan(bad.score);
  });

  it('should respect custom thresholds', () => {
    const strictConfig = { ...DEFAULT_PHASE1, minRendite: 10 }; // 10% min
    const result = evaluatePhase1(goodProperty, strictConfig);
    expect(result.checks.rendite.passed).toBe(false); // 5.6% < 10%
  });
});

describe('evaluatePhase2', () => {
  it('should evaluate with full immocation model', () => {
    const result = evaluatePhase2(goodProperty);
    expect(result.checks.cfNachSteuern).toBeDefined();
    expect(result.checks.ekRendite).toBeDefined();
    expect(result.checks.breakEven).toBeDefined();
    expect(result.checks.nettoRendite).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should include mietpotenzial check', () => {
    const withPotenzial = evaluatePhase2(goodProperty, DEFAULT_PHASE2, DEFAULT_PIPELINE, 15);
    expect(withPotenzial.checks.mietpotenzial.value).toBe(15);
    expect(withPotenzial.checks.mietpotenzial.passed).toBe(true);
  });

  it('should fail mietpotenzial when below threshold', () => {
    const strictConfig = { ...DEFAULT_PHASE2, minMietpotenzial: 20 };
    const result = evaluatePhase2(goodProperty, strictConfig, DEFAULT_PIPELINE, 5);
    expect(result.checks.mietpotenzial.passed).toBe(false);
  });
});

describe('calculateOverallScore', () => {
  it('should weight Phase 1 at 40% when Phase 2 is null', () => {
    expect(calculateOverallScore(100, null)).toBe(40);
    expect(calculateOverallScore(50, null)).toBe(20);
  });

  it('should weight Phase 1 at 30% and Phase 2 at 70% when both present', () => {
    expect(calculateOverallScore(100, 100)).toBe(100);
    expect(calculateOverallScore(0, 0)).toBe(0);
    expect(calculateOverallScore(100, 0)).toBe(30);
    expect(calculateOverallScore(0, 100)).toBe(70);
  });
});
