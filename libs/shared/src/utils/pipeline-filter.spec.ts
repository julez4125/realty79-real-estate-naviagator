import { runPhase1, runPhase2, getPhase2Passed, analyzeProperty, PipelineProperty } from './pipeline-filter';
import { PropertyInput } from '../interfaces/calculator.interfaces';
import { DEFAULT_PIPELINE } from '../interfaces/pipeline.interfaces';

const properties: PipelineProperty[] = [
  {
    property: {
      kaufpreis: 150_000, wohnflaeche: 70, zimmer: 3, baujahr: 2000,
      ort: 'Lörrach', plz: '79539', hausgeld: 200, kaltmieteGesamt: 700,
    },
    externalId: 'good-1',
    preisProQm: 2143,
  },
  {
    property: {
      kaufpreis: 120_000, wohnflaeche: 55, zimmer: 2, baujahr: 1990,
      ort: 'Freiburg', plz: '79100', hausgeld: 180, kaltmieteGesamt: 550,
    },
    externalId: 'good-2',
    preisProQm: 2182,
  },
  {
    property: {
      kaufpreis: 500_000, wohnflaeche: 30, zimmer: 1, baujahr: 1950,
      ort: 'München', plz: '80331', hausgeld: 400, kaltmieteProQm: 8,
    },
    externalId: 'bad-1',
    preisProQm: 16667,
  },
];

describe('runPhase1', () => {
  it('should filter properties through Phase 1', () => {
    const results = runPhase1(properties);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(properties.length);
    // Bad property should be filtered out
    const badIds = results.map(r => r.property.externalId);
    expect(badIds).not.toContain('bad-1');
  });

  it('should sort by score descending', () => {
    const results = runPhase1(properties);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].overallScore).toBeLessThanOrEqual(results[i - 1].overallScore);
    }
  });

  it('should set phase to 1', () => {
    const results = runPhase1(properties);
    for (const r of results) {
      expect(r.phase).toBe(1);
    }
  });

  it('should return empty array when nothing passes', () => {
    const strictConfig = { ...DEFAULT_PIPELINE, phase1: { ...DEFAULT_PIPELINE.phase1, minRendite: 50 } };
    const results = runPhase1(properties, strictConfig);
    expect(results).toHaveLength(0);
  });
});

describe('runPhase2', () => {
  it('should run Phase 2 on Phase 1 results', () => {
    const p1 = runPhase1(properties);
    const p2 = runPhase2(p1);
    expect(p2.length).toBe(p1.length);
    for (const r of p2) {
      expect(r.phase).toBe(2);
      expect(r.phase2).toBeDefined();
    }
  });

  it('should incorporate mietpotenzial', () => {
    const p1 = runPhase1(properties);
    const potenziale = new Map([['good-1', 10], ['good-2', 5]]);
    const p2 = runPhase2(p1, DEFAULT_PIPELINE, potenziale);
    const good1 = p2.find(r => r.property.externalId === 'good-1');
    expect(good1?.phase2?.checks.mietpotenzial.value).toBe(10);
  });
});

describe('getPhase2Passed', () => {
  it('should filter only Phase 2 passed results', () => {
    const p1 = runPhase1(properties);
    const p2 = runPhase2(p1);
    const passed = getPhase2Passed(p2);
    for (const r of passed) {
      expect(r.phase2?.passed).toBe(true);
    }
  });
});

describe('analyzeProperty', () => {
  it('should return complete analysis for single property', () => {
    const property: PropertyInput = {
      kaufpreis: 150_000, wohnflaeche: 70, zimmer: 3, baujahr: 2000,
      ort: 'Lörrach', plz: '79539', hausgeld: 200, kaltmieteGesamt: 700,
    };
    const analysis = analyzeProperty(property);
    expect(analysis.phase1).toBeDefined();
    expect(analysis.phase2).toBeDefined();
    expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
    expect(analysis.calculationResult.purchaseCosts).toBeDefined();
    expect(analysis.calculationResult.metrics).toBeDefined();
    expect(analysis.calculationResult.projection).toHaveLength(30);
  });

  it('should return recommendation string', () => {
    const property: PropertyInput = {
      kaufpreis: 150_000, wohnflaeche: 70, zimmer: 3,
      ort: 'Test', plz: '12345', kaltmieteGesamt: 700,
    };
    const analysis = analyzeProperty(property);
    expect(['kaufen', 'pruefen', 'beobachten', 'ablehnen']).toContain(analysis.recommendation);
  });
});
