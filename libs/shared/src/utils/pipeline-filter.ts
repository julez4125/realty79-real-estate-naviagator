import { PropertyInput } from '../interfaces/calculator.interfaces.js';
import { PipelineConfigFull, Phase1Result, Phase2Result, DEFAULT_PIPELINE } from '../interfaces/pipeline.interfaces.js';
import { evaluatePhase1, evaluatePhase2, calculateOverallScore } from './scoring-engine.js';
import { calculateKeyMetrics } from './immocation-calculator.js';

export interface PipelineProperty {
  property: PropertyInput;
  externalId?: string;
  source?: string;
  sourceUrl?: string;
  preisProQm: number;
}

export interface PipelineResult {
  property: PipelineProperty;
  phase: 1 | 2 | 3;
  phase1: Phase1Result;
  phase2?: Phase2Result;
  overallScore: number;
  recommendation: 'kaufen' | 'pruefen' | 'beobachten' | 'ablehnen';
}

/**
 * Führt Phase 1 für eine Liste von Objekten durch.
 * Gibt nur die Objekte zurück, die Phase 1 bestehen.
 */
export function runPhase1(
  properties: PipelineProperty[],
  config: PipelineConfigFull = DEFAULT_PIPELINE
): PipelineResult[] {
  return properties
    .map(p => {
      const phase1 = evaluatePhase1(p.property, config.phase1, config);
      return {
        property: p,
        phase: 1 as const,
        phase1,
        overallScore: calculateOverallScore(phase1.score, null),
        recommendation: getRecommendation(phase1.score, null),
      };
    })
    .filter(r => r.phase1.passed)
    .sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Führt Phase 2 für bereits Phase-1-qualifizierte Objekte durch.
 */
export function runPhase2(
  phase1Results: PipelineResult[],
  config: PipelineConfigFull = DEFAULT_PIPELINE,
  mietpotenziale: Map<string, number> = new Map()
): PipelineResult[] {
  return phase1Results
    .map(r => {
      const mietpotenzial = mietpotenziale.get(r.property.externalId ?? '') ?? 0;
      const phase2 = evaluatePhase2(r.property.property, config.phase2, config, mietpotenzial);
      const overallScore = calculateOverallScore(r.phase1.score, phase2.score);
      return {
        ...r,
        phase: 2 as const,
        phase2,
        overallScore,
        recommendation: getRecommendation(r.phase1.score, phase2.score),
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Filtert Phase-2-Ergebnisse: Gibt nur bestandene zurück.
 */
export function getPhase2Passed(results: PipelineResult[]): PipelineResult[] {
  return results.filter(r => r.phase2?.passed);
}

/**
 * Empfehlung basierend auf Score.
 */
function getRecommendation(
  phase1Score: number,
  phase2Score: number | null
): 'kaufen' | 'pruefen' | 'beobachten' | 'ablehnen' {
  const overall = calculateOverallScore(phase1Score, phase2Score);
  if (overall >= 80) return 'kaufen';
  if (overall >= 60) return 'pruefen';
  if (overall >= 40) return 'beobachten';
  return 'ablehnen';
}

/**
 * Erstellt eine zusammenfassende Analyse für ein einzelnes Objekt.
 */
export function analyzeProperty(
  property: PropertyInput,
  config: PipelineConfigFull = DEFAULT_PIPELINE,
  mietpotenzial = 0
): {
  phase1: Phase1Result;
  phase2: Phase2Result;
  overallScore: number;
  recommendation: string;
  calculationResult: ReturnType<typeof calculateKeyMetrics>;
} {
  const financing = {
    eigenkapitalQuote: config.financing.eigenkapitalQuote,
    makler: config.kosten.makler,
    notar: config.kosten.notar,
    grundbuch: config.kosten.grundbuch,
    grunderwerbsteuer: config.kosten.grunderwerbsteuer,
    sonstigeKaufkosten: 0,
    darlehen: [
      { darlehensSumme: 0, zinssatz: config.financing.zinssatz, anfangsTilgung: config.financing.tilgung },
    ],
  };

  const phase1 = evaluatePhase1(property, config.phase1, config);
  const phase2 = evaluatePhase2(property, config.phase2, config, mietpotenzial);
  const overallScore = calculateOverallScore(phase1.score, phase2.score);
  const calculationResult = calculateKeyMetrics(property, financing, config.assumptions);

  return {
    phase1,
    phase2,
    overallScore,
    recommendation: getRecommendation(phase1.score, phase2.score),
    calculationResult,
  };
}
