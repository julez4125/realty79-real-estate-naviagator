import {
  PropertyInput,
  FinancingParams,
  AssumptionParams,
  DarlehenParams,
  PurchaseCosts,
  YearProjection,
  KeyMetrics,
  CalculationResult,
  DEFAULT_FINANCING,
  DEFAULT_ASSUMPTIONS,
} from '../interfaces/calculator.interfaces.js';

/**
 * Berechnet Kaufnebenkosten und Gesamtinvestition.
 * Ref: Cockpit B13-E34
 */
export function calculatePurchaseCosts(
  property: PropertyInput,
  financing: FinancingParams = DEFAULT_FINANCING
): PurchaseCosts {
  const { kaufpreis } = property;

  const makler = financing.makler * kaufpreis;
  const notar = financing.notar * kaufpreis;
  const grundbuch = financing.grundbuch * kaufpreis;
  const grunderwerbsteuer = financing.grunderwerbsteuer * kaufpreis;
  const sonstige = financing.sonstigeKaufkosten * kaufpreis;
  const kaufnebenkosten = makler + notar + grundbuch + grunderwerbsteuer + sonstige;
  const gesamtinvestition = kaufpreis + kaufnebenkosten;

  // Darlehenssumme berechnen
  let darlehensSumme: number;
  if (financing.darlehen.length > 0 && financing.darlehen[0].darlehensSumme > 0) {
    darlehensSumme = financing.darlehen.reduce((sum: number, d: DarlehenParams) => sum + d.darlehensSumme, 0);
  } else {
    darlehensSumme = gesamtinvestition * (1 - financing.eigenkapitalQuote);
  }

  const eigenkapital = gesamtinvestition - darlehensSumme;

  return {
    kaufpreis,
    makler,
    notar,
    grundbuch,
    grunderwerbsteuer,
    sonstige,
    kaufnebenkosten,
    gesamtinvestition,
    darlehensSumme,
    eigenkapital,
  };
}

/**
 * Berechnet die Nettokaltmiete pro Monat.
 */
function getNettokaltmiete(property: PropertyInput): number {
  if (property.kaltmieteGesamt != null && property.kaltmieteGesamt > 0) {
    return property.kaltmieteGesamt;
  }
  if (property.kaltmieteProQm != null && property.kaltmieteProQm > 0) {
    return property.kaltmieteProQm * property.wohnflaeche;
  }
  return 0;
}

/**
 * Berechnet die Darlehens-Annuität, Zinsen und Tilgung pro Jahr.
 * Ref: Wert, AfA, Darlehen B32-B98
 */
function calculateLoanYear(
  darlehen: DarlehenParams,
  restschuld: number
): { zinsen: number; tilgung: number; annuitaet: number; neueRestschuld: number } {
  if (restschuld <= 0) {
    return { zinsen: 0, tilgung: 0, annuitaet: 0, neueRestschuld: 0 };
  }

  const zinsen = darlehen.zinssatz * restschuld;
  // Annuität bleibt konstant: (Zins + Anfangstilgung) × Anfangs-Darlehenssumme
  const annuitaet = (darlehen.zinssatz + darlehen.anfangsTilgung) * darlehen.darlehensSumme;
  const tilgung = Math.min(restschuld, Math.max(annuitaet - zinsen, 0));
  const neueRestschuld = Math.max(restschuld - tilgung, 0);

  return { zinsen, tilgung, annuitaet, neueRestschuld };
}

/**
 * Berechnet die AfA pro Monat.
 * Ref: Wert, AfA, Darlehen B14-B22
 */
function calculateAfa(
  kaufpreis: number,
  kaufnebenkosten: number,
  assumptions: AssumptionParams
): number {
  const basisRegular = assumptions.gebaeudeAnteil * (kaufpreis + kaufnebenkosten);
  const afaProJahr = assumptions.afaSatz * basisRegular;
  return afaProJahr / 12;
}

/**
 * Berechnet Cashflow-Projektion über N Jahre.
 * Ref: Miete, Cashflow, Steuern B50-B77
 */
export function projectCashflow(
  property: PropertyInput,
  financing: FinancingParams = DEFAULT_FINANCING,
  assumptions: AssumptionParams = DEFAULT_ASSUMPTIONS,
  years = 30
): { purchaseCosts: PurchaseCosts; projection: YearProjection[] } {
  const costs = calculatePurchaseCosts(property, financing);
  const nettokaltmieteStart = getNettokaltmiete(property);
  const stellplatzMiete = (property.stellplatzMiete ?? 0) * (property.stellplaetze ?? 0);
  const afaMonat = calculateAfa(costs.kaufpreis, costs.kaufnebenkosten, assumptions);

  // Darlehen vorbereiten
  const darlehen = financing.darlehen.map((d: DarlehenParams, i: number) => ({
    ...d,
    darlehensSumme: d.darlehensSumme > 0
      ? d.darlehensSumme
      : i === 0 ? costs.darlehensSumme : 0,
  }));
  const restschulden = darlehen.map((d: { darlehensSumme: number }) => d.darlehensSumme);

  // Hausgeld aufteilen (umlagefähig / nicht umlagefähig)
  const hausgeldGesamt = property.hausgeld ?? 0;
  // Annahme: ~80% umlagefähig, ~20% nicht umlagefähig (+ WEG Rücklage)
  const hausgeldUmlage = hausgeldGesamt * 0.8;
  const hausgeldNichtUmlage = hausgeldGesamt * 0.2;

  const projection: YearProjection[] = [];
  let kumulierterCashflow = 0;
  let immobilienwert = costs.kaufpreis;

  for (let jahr = 1; jahr <= years; jahr++) {
    const steigerungMiete = Math.pow(1 + assumptions.mietsteigerung, jahr - 1);
    const steigerungKosten = Math.pow(1 + assumptions.kostensteigerung, jahr - 1);

    // Miete (Ref: Miete, Cashflow, Steuern B8-B14)
    const nettokaltmiete = (nettokaltmieteStart + stellplatzMiete) * steigerungMiete;
    const umlagefaehigeKosten = hausgeldUmlage * steigerungKosten;
    const warmmiete = nettokaltmiete + umlagefaehigeKosten;

    // Bewirtschaftungskosten (Ref: B53-B57)
    const bewirtNichtUmlage = hausgeldNichtUmlage * steigerungKosten;
    const instandhaltung = (property.wohnflaeche * assumptions.instandhaltungProQm / 12) * steigerungKosten;
    const mietausfall = assumptions.mietausfall * warmmiete;
    const bewirtschaftungskosten = bewirtNichtUmlage + instandhaltung + mietausfall + umlagefaehigeKosten;

    // Darlehen (Ref: Wert, AfA, Darlehen)
    let zinsenGesamt = 0;
    let tilgungGesamt = 0;
    for (let i = 0; i < darlehen.length; i++) {
      if (restschulden[i] <= 0) continue;
      const result = calculateLoanYear(darlehen[i], restschulden[i]);
      zinsenGesamt += result.zinsen;
      tilgungGesamt += result.tilgung;
      restschulden[i] = result.neueRestschuld;
    }

    // Cashflow operativ (Ref: B60)
    const cashflowOperativ = warmmiete - bewirtschaftungskosten - zinsenGesamt / 12 - tilgungGesamt / 12;

    // Steuern (Ref: B69-B77)
    const zuVersteuern = warmmiete - (bewirtNichtUmlage + umlagefaehigeKosten) - zinsenGesamt / 12 - afaMonat;
    const steuern = Math.max(0, assumptions.grenzsteuersatz * zuVersteuern);

    // Cashflow nach Steuern (Ref: B62)
    const cashflowNachSteuern = cashflowOperativ - steuern;

    // Kumuliert
    kumulierterCashflow += cashflowNachSteuern * 12;

    // Wertentwicklung (Ref: Wert, AfA, Darlehen B6-B12)
    immobilienwert = immobilienwert * (1 + assumptions.wertsteigerung);

    const restschuld = restschulden.reduce((s: number, r: number) => s + r, 0);
    const nettovermoegen = immobilienwert - restschuld;

    projection.push({
      jahr,
      nettokaltmiete,
      warmmiete,
      bewirtschaftungskosten,
      zinsen: zinsenGesamt / 12,
      tilgung: tilgungGesamt / 12,
      cashflowOperativ,
      steuern,
      cashflowNachSteuern,
      kumulierterCashflow,
      restschuld,
      immobilienwert,
      nettovermoegen,
      afa: afaMonat,
    });
  }

  return { purchaseCosts: costs, projection };
}

/**
 * Berechnet alle Kennzahlen.
 * Ref: Cockpit P6-W39
 */
export function calculateKeyMetrics(
  property: PropertyInput,
  financing: FinancingParams = DEFAULT_FINANCING,
  assumptions: AssumptionParams = DEFAULT_ASSUMPTIONS,
  years = 30
): CalculationResult {
  const { purchaseCosts, projection } = projectCashflow(property, financing, assumptions, years);
  const nettokaltmiete = getNettokaltmiete(property);
  const jahreskaltmiete = nettokaltmiete * 12;

  // Bruttomietrendite (Ref: Cockpit Q14)
  const bruttomietrendite = purchaseCosts.kaufpreis > 0
    ? jahreskaltmiete / purchaseCosts.kaufpreis
    : 0;

  // Nettomietrendite (Ref: Cockpit Q16)
  const hausgeldNichtUmlage = (property.hausgeld ?? 0) * 0.2;
  const nettomietrendite = purchaseCosts.gesamtinvestition > 0
    ? (jahreskaltmiete - 12 * hausgeldNichtUmlage) / purchaseCosts.gesamtinvestition
    : 0;

  // Kaufpreisfaktor (Ref: Cockpit Q15)
  const kaufpreisfaktor = jahreskaltmiete > 0
    ? purchaseCosts.kaufpreis / jahreskaltmiete
    : Infinity;

  // Cashflow Jahr 1
  const jahr1 = projection[0];
  const cashflowOperativ = jahr1?.cashflowOperativ ?? 0;
  const cashflowNachSteuern = jahr1?.cashflowNachSteuern ?? 0;

  // Break-Even CF nach Steuern (Ref: Cockpit W9)
  const breakEvenJahr = projection.find(p => p.cashflowNachSteuern > 0)?.jahr ?? null;

  // Break-Even kumulierter CF (Ref: Cockpit W11)
  const breakEvenKumCf = projection.find(p => p.kumulierterCashflow > 0)?.jahr ?? null;

  // Volltilgung (Ref: Cockpit N21)
  const volltilgungJahr = projection.find(p => p.restschuld <= 0)?.jahr ?? null;

  // Vermögenszuwachs p.a. (Ref: Cockpit Q9)
  const vermoegenszuwachs = purchaseCosts.eigenkapital > 0 && jahr1
    ? 12 * (-jahr1.tilgung + cashflowNachSteuern) +
      (projection[0]?.immobilienwert ?? 0) - purchaseCosts.kaufpreis
    : 0;

  // Eigenkapitalrendite (Ref: Cockpit Q37)
  const eigenkapitalrendite = purchaseCosts.eigenkapital > 0
    ? vermoegenszuwachs / purchaseCosts.eigenkapital
    : 0;

  // Beleihungsreserve (Ref: Cockpit W34)
  const jahr10 = projection[9]; // Jahr 10
  const beleihungsreserve = jahr10
    ? jahr10.immobilienwert + jahr10.restschuld * -1
    : 0;

  const metrics: KeyMetrics = {
    bruttomietrendite,
    nettomietrendite,
    kaufpreisfaktor,
    eigenkapitalrendite,
    cashflowOperativ,
    cashflowNachSteuern,
    breakEvenJahr,
    breakEvenKumCf,
    volltilgungJahr,
    vermoegenszuwachs,
    beleihungsreserve,
  };

  return { purchaseCosts, metrics, projection };
}

/**
 * Quick-Cashflow für Phase 1 Screening (vereinfacht, ohne volle Projektion).
 */
export function quickCashflow(
  property: PropertyInput,
  zinssatz = 0.03,
  tilgung = 0.02,
  eigenkapitalQuote = 0.20
): number {
  const nettokaltmiete = getNettokaltmiete(property);
  const hausgeld = property.hausgeld ?? 0;
  const finanzierung = (zinssatz + tilgung) * property.kaufpreis * (1 - eigenkapitalQuote) / 12;
  return nettokaltmiete - hausgeld - finanzierung;
}
