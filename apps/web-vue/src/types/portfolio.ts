export interface Portfolio {
  id: string
  name: string
  properties: string[]
  totalValue: number
  monthlyIncome: number
  yield: number
}

export interface PortfolioKpis {
  objekteCount: number
  portfolioWert: number
  monatsCashflow: number
  durchschnittsRendite: number
  leerstandsquote: number
  instandhaltungsReserve: number
}
