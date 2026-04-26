import { ref, computed, onMounted } from 'vue'
import { getPortfolios, getPortfolioKpis } from '@/services/api'
import { formatCurrency } from '@/utils/formatters'
import { mockPortfolioProperties } from '@/data/mockProperties'

export function usePortfolio() {
  const loading = ref(true)
  const kpis = ref<any>(null)
  const properties = ref<any[]>([])

  const CHART_COLORS = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
  ]

  const totals = computed(() => {
    const kaufpreis = properties.value.reduce((s, p) => s + (p.kaufpreis || 0), 0)
    const kaltmiete = properties.value.reduce((s, p) => s + (p.kaltmiete || 0), 0)
    const cashflow = properties.value.reduce((s, p) => s + (p.cashflowMonat || 0), 0)
    return { kaufpreis, kaltmiete, cashflow }
  })

  const allocationData = computed(() => {
    if (!properties.value.length) return null
    const cityMap = new Map<string, number>()
    for (const p of properties.value) {
      const city = p.ort || p.city || 'Sonstige'
      cityMap.set(city, (cityMap.get(city) || 0) + (p.kaufpreis || 0))
    }
    const entries = [...cityMap.entries()].sort((a, b) => b[1] - a[1])
    return {
      labels: entries.map(([city]) => city),
      datasets: [{
        data: entries.map(([, val]) => val),
        backgroundColor: entries.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 2,
        borderColor: 'var(--va-background-secondary)',
      }],
    }
  })

  const cashflowData = computed(() => {
    if (!properties.value.length) return null
    const sorted = [...properties.value].sort((a, b) => (b.cashflowMonat || 0) - (a.cashflowMonat || 0))
    return {
      labels: sorted.map(p => p.ort || p.adresse || p.strasse || 'Objekt'),
      datasets: [{
        label: 'Cashflow/Mo',
        data: sorted.map(p => p.cashflowMonat || 0),
        backgroundColor: sorted.map(p => (p.cashflowMonat || 0) >= 0 ? '#10b981' : '#ef4444'),
        borderRadius: 4,
        barThickness: 20,
      }],
    }
  })

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const total = ctx.dataset.data.reduce((s: number, v: number) => s + v, 0)
            const pct = total ? ((ctx.raw / total) * 100).toFixed(1) : '0'
            return `${ctx.label}: ${formatCurrency(ctx.raw)} (${pct}%)`
          },
        },
      },
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Cashflow: ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: {
          callback: (v: any) => formatCurrency(v),
          font: { size: 11 },
        },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  }

  function buildMockPortfolioData() {
    const props = mockPortfolioProperties.map(p => ({
      id: p.id,
      adresse: p.adresse,
      strasse: p.adresse,
      ort: p.ort,
      plz: p.plz,
      kaufpreis: p.kaufpreis,
      kaltmiete: p.kaltmiete,
      cashflowMonat: p.cashflowMonat,
      bruttoRendite: p.bruttoRendite,
      phase: p.phase,
      score: p.score,
    }))

    const totalKaufpreis = mockPortfolioProperties.reduce((s, p) => s + p.kaufpreis, 0)
    const totalMarktwert = mockPortfolioProperties.reduce((s, p) => s + p.marktwert, 0)
    const totalKaltmiete = mockPortfolioProperties.reduce((s, p) => s + p.kaltmiete, 0)
    const totalCashflow = mockPortfolioProperties.reduce((s, p) => s + p.cashflowMonat, 0)
    const totalDarlehen = mockPortfolioProperties.reduce((s, p) => s + p.darlehen, 0)
    const avgRendite = totalKaltmiete * 12 / totalKaufpreis

    return {
      kpis: {
        objekteCount: mockPortfolioProperties.length,
        portfolioWert: totalMarktwert,
        monatsCashflow: totalCashflow,
        bruttoRendite: avgRendite,
        beleihung: totalDarlehen / totalMarktwert,
        jahresmiete: totalKaltmiete * 12,
      },
      properties: props,
    }
  }

  async function loadData() {
    loading.value = true
    try {
      const portfolios = await getPortfolios()
      if (portfolios?.length > 0) {
        const portfolio = portfolios[0]
        const kpiData = await getPortfolioKpis(portfolio.id)
        kpis.value = kpiData
        properties.value = kpiData?.properties || portfolio?.properties || []
      } else {
        // No portfolios from API — use mock data
        const mock = buildMockPortfolioData()
        kpis.value = mock.kpis
        properties.value = mock.properties
      }
    } catch {
      // API unavailable — use mock data
      const mock = buildMockPortfolioData()
      kpis.value = mock.kpis
      properties.value = mock.properties
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)

  return {
    loading,
    kpis,
    properties,
    totals,
    allocationData,
    cashflowData,
    doughnutOptions,
    barOptions,
    loadData,
  }
}
