// Property DTOs — plain interfaces mirroring the Prisma Property model fields used by the UI

export interface PropertyDto {
  id: string;
  source: string;
  sourceUrl?: string | null;
  ort: string;
  plz: string;
  kaufpreis: number;
  kaltmieteIst?: number | null;
  baujahr?: number | null;
  wohnflaeche: number;
  zimmer: number;
  preisProQm: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioOverviewDto {
  propertyCount: number;
  kaufpreisSum: number;
  kaltmieteSum: number;
  avgPreisProQm: number;
  plzList: string[];
}
