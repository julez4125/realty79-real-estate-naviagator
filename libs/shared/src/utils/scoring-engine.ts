import { PropertyInput } from '../interfaces/calculator.interfaces.js';
import {
  Phase1Config,
  Phase2Config,
  Phase1Result,
  Phase2Result,
  PipelineConfigFull,
  DEFAULT_PIPELINE,
} from '../interfaces/pipeline.interfaces.js';
import { quickCashflow, calculateKeyMetrics } from './immocation-calculator.js';
import { FinancingParams, AssumptionParams } from '../interfaces/calculator.interfaces.js';

/**
 * Konvertiert PipelineConfig in FinancingParams für den Calculator.
 */
function toFinancingParams(config: PipelineConfigFull): FinancingParams {
  return {
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
}

function toAssumptionParams(config: PipelineConfigFull): AssumptionParams {
  return config.assumptions;
}

/**
 * Phase 1: Quick-Screen basierend auf ImmoMetrica KPIs.
 * Schnelle Berechnung ohne vollständige Cashflow-Projektion.
 */
export function evaluatePhase1(
  property: PropertyInput,
  config: Phase1Config = DEFAULT_PIPELINE.phase1,
  pipelineConfig: PipelineConfigFull = DEFAULT_PIPELINE
): Phase1Result {
  const nettokaltmiete = (property.kaltmieteGesamt ?? (property.kaltmieteProQm ?? 0) * property.wohnflaeche);
  const jahreskaltmiete = nettokaltmiete * 12;

  const rendite = property.kaufpreis > 0 ? (jahreskaltmiete / property.kaufpreis) * 100 : 0;
  const faktor = jahreskaltmiete > 0 ? property.kaufpreis / jahreskaltmiete : Infinity;
  const preisProQm = property.wohnflaeche > 0 ? property.kaufpreis / property.wohnflaeche : Infinity;
  const cashflow = quickCashflow(
    property,
    pipelineConfig.financing.zinssatz,
    pipelineConfig.financing.tilgung,
    pipelineConfig.financing.eigenkapitalQuote
  );

  const checks = {
    rendite: { value: rendite, threshold: config.minRendite, passed: rendite >= config.minRendite },
    faktor: { value: faktor, threshold: config.maxFaktor, passed: faktor <= config.maxFaktor },
    cashflow: { value: cashflow, threshold: config.minCashflow, passed: cashflow >= config.minCashflow },
    preisProQm: { value: preisProQm, threshold: config.maxPreisProQm, passed: preisProQm <= config.maxPreisProQm },
    baujahr: {
      value: property.baujahr ?? null,
      threshold: config.minBaujahr,
      passed: property.baujahr == null || property.baujahr >= config.minBaujahr,
    },
    wohnflaeche: { value: property.wohnflaeche, threshold: config.minWohnflaeche, passed: property.wohnflaeche >= config.minWohnflaeche },
  };

  const checkResults = Object.values(checks).map(c => c.passed);
  const passed = config.logic === 'ALL'
    ? checkResults.every(Boolean)
    : checkResults.some(Boolean);

  // Score: 0-100, gewichtet nach Relevanz
  const weights = { rendite: 25, faktor: 20, cashflow: 25, preisProQm: 15, baujahr: 5, wohnflaeche: 10 };
  let score = 0;
  if (checks.rendite.passed) score += weights.rendite;
  if (checks.faktor.passed) score += weights.faktor;
  if (checks.cashflow.passed) score += weights.cashflow;
  if (checks.preisProQm.passed) score += weights.preisProQm;
  if (checks.baujahr.passed) score += weights.baujahr;
  if (checks.wohnflaeche.passed) score += weights.wohnflaeche;

  return { passed, checks, score };
}

/**
 * Phase 2: Detaillierte Analyse mit vollem immocation-Kalkulationsmodell.
 */
export function evaluatePhase2(
  property: PropertyInput,
  config: Phase2Config = DEFAULT_PIPELINE.phase2,
  pipelineConfig: PipelineConfigFull = DEFAULT_PIPELINE,
  mietpotenzial = 0
): Phase2Result {
  const financing = toFinancingParams(pipelineConfig);
  const assumptions = toAssumptionParams(pipelineConfig);
  const result = calculateKeyMetrics(property, financing, assumptions);

  const cfNachSteuern = result.metrics.cashflowNachSteuern;
  const ekRendite = result.metrics.eigenkapitalrendite * 100;
  const breakEven = result.metrics.breakEvenJahr;
  const nettoRendite = result.metrics.nettomietrendite * 100;

  const checks = {
    cfNachSteuern: { value: cfNachSteuern, threshold: config.minCfNachSteuern, passed: cfNachSteuern >= config.minCfNachSteuern },
    ekRendite: { value: ekRendite, threshold: config.minEkRendite, passed: ekRendite >= config.minEkRendite },
    breakEven: {
      value: breakEven,
      threshold: config.maxBreakEven,
      passed: breakEven != null && breakEven <= config.maxBreakEven,
    },
    mietpotenzial: { value: mietpotenzial, threshold: config.minMietpotenzial, passed: mietpotenzial >= config.minMietpotenzial },
    nettoRendite: { value: nettoRendite, threshold: config.minNettoRendite, passed: nettoRendite >= config.minNettoRendite },
  };

  const checkResults = Object.values(checks).map(c => c.passed);
  const passed = checkResults.every(Boolean);

  const weights = { cfNachSteuern: 25, ekRendite: 25, breakEven: 20, mietpotenzial: 15, nettoRendite: 15 };
  let score = 0;
  if (checks.cfNachSteuern.passed) score += weights.cfNachSteuern;
  if (checks.ekRendite.passed) score += weights.ekRendite;
  if (checks.breakEven.passed) score += weights.breakEven;
  if (checks.mietpotenzial.passed) score += weights.mietpotenzial;
  if (checks.nettoRendite.passed) score += weights.nettoRendite;

  return { passed, checks, score };
}

/**
 * Berechnet einen Gesamt-Score (0-100) über alle Phasen.
 */
export function calculateOverallScore(phase1Score: number, phase2Score: number | null): number {
  if (phase2Score == null) return phase1Score * 0.4; // Nur Phase 1 abgeschlossen
  return phase1Score * 0.3 + phase2Score * 0.7;
}
