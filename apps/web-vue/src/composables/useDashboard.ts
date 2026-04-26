import { ref, computed, onMounted } from 'vue'
import {
  getPropertyStats,
  getPipelineFunnel,
  getPortfolios,
  getPortfolioKpis as fetchPortfolioKpis,
  getProperties,
  runPhase1,
  runPhase2,
} from '@/services/api'
import { mockProperties, mockPortfolioProperties, mockToListProperty } from '@/data/mockProperties'

export function useDashboard() {
  const onboardingDone = ref(localStorage.getItem('r79_onboarding_done') === '1')
  const loading = ref(true)
  const actionLoading = ref(false)

  const stats = ref<any>(null)
  const funnel = ref<any>(null)
  const portfolioKpis = ref<any>(null)
  const recentProperties = ref<any[]>([])

  const pipelineQuote = computed(() => {
    if (!funnel.value?.phase1?.total) return null
    return (funnel.value.phase2.passed / funnel.value.phase1.total) * 100
  })

  const funnelPhases = computed(() => {
    if (!funnel.value) return []
    const p1Total = funnel.value.phase1.total || 1
    return [
      { label: 'Vorfilter', ...funnel.value.phase1, width: 100 },
      { label: 'Analyse', ...funnel.value.phase2, width: Math.max(8, (funnel.value.phase2.total / p1Total) * 100) },
      { label: 'Kauf', ...funnel.value.phase3, width: Math.max(8, (funnel.value.phase3.total / p1Total) * 100) },
    ]
  })

  function buildMockDashboardData() {
    // Stats from mock acquisition properties
    const totalAkquise = mockProperties.length
    const mockStats = { total: totalAkquise, new: 3, phase1: totalAkquise, phase2: 4, phase3: 1 }

    // Funnel from mock pipeline
    const mockFunnel = {
      phase1: { total: totalAkquise, passed: 5 },
      phase2: { total: 5, passed: 3 },
      phase3: { total: 3, passed: 1 },
    }

    // Portfolio KPIs from Bestand properties
    const totalMarktwert = mockPortfolioProperties.reduce((s, p) => s + p.marktwert, 0)
    const totalCashflow = mockPortfolioProperties.reduce((s, p) => s + p.cashflowMonat, 0)
    const mockPortKpis = { portfolioWert: totalMarktwert, monatsCashflow: totalCashflow }

    // Recent properties (first 5 mock acquisition)
    const mockRecent = mockProperties.slice(0, 5).map((m) => {
      const p = mockToListProperty(m)
      return {
        id: p.id,
        ort: p.ort,
        kaufpreis: p.kaufpreis,
        bruttoRendite: p.analysis.bruttomietrendite,
        score: p.score,
        phase: p.phase,
        empfehlung: p.recommendation === 'Kaufen' ? 'Kaufen' : p.recommendation === 'Pruefen' ? 'Prüfen' : 'Beobachten',
      }
    })

    return { stats: mockStats, funnel: mockFunnel, portfolioKpis: mockPortKpis, recent: mockRecent }
  }

  async function loadData() {
    loading.value = true
    try {
      const [s, f, portfolios, recent] = await Promise.all([
        getPropertyStats(),
        getPipelineFunnel(),
        getPortfolios(),
        getProperties({ limit: 5, sort: 'createdAt', order: 'desc' }),
      ])
      stats.value = s
      funnel.value = f
      recentProperties.value = recent?.items || []

      if (portfolios?.length > 0) {
        portfolioKpis.value = await fetchPortfolioKpis(portfolios[0].id)
      }
    } catch {
      // API unavailable — use mock data
      const mock = buildMockDashboardData()
      stats.value = mock.stats
      funnel.value = mock.funnel
      portfolioKpis.value = mock.portfolioKpis
      recentProperties.value = mock.recent
    } finally {
      loading.value = false
    }
  }

  async function doRunPhase1() {
    actionLoading.value = true
    try {
      await runPhase1()
      await loadData()
    } finally {
      actionLoading.value = false
    }
  }

  async function doRunPhase2() {
    actionLoading.value = true
    try {
      await runPhase2()
      await loadData()
    } finally {
      actionLoading.value = false
    }
  }

  function empfehlungColor(empfehlung: string): string {
    const lower = empfehlung.toLowerCase()
    if (lower === 'kaufen') return 'success'
    if (lower === 'beobachten' || lower === 'pruefen' || lower === 'prüfen') return 'warning'
    if (lower === 'ablehnen' || lower === 'storniert') return 'danger'
    return 'info'
  }

  const tableColumns = [
    { key: 'standort', label: 'Standort', sortable: false },
    { key: 'preis', label: 'Preis', sortable: false, thAlign: 'right' as const, tdAlign: 'right' as const },
    { key: 'rendite', label: 'Rendite', sortable: false, thAlign: 'right' as const, tdAlign: 'right' as const },
    { key: 'score', label: 'Score', sortable: false, thAlign: 'center' as const, tdAlign: 'center' as const },
    { key: 'phase', label: 'Phase', sortable: false, thAlign: 'center' as const, tdAlign: 'center' as const },
    { key: 'empfehlung', label: 'Empfehlung', sortable: false },
  ]

  const phaseBarColors = [
    'bg-gradient-to-r from-blue-700 to-blue-500',
    'bg-gradient-to-r from-violet-700 to-violet-400',
    'bg-gradient-to-r from-emerald-700 to-emerald-400',
  ]

  onMounted(loadData)

  return {
    onboardingDone,
    loading,
    actionLoading,
    stats,
    funnel,
    portfolioKpis,
    recentProperties,
    pipelineQuote,
    funnelPhases,
    tableColumns,
    phaseBarColors,
    empfehlungColor,
    loadData,
    doRunPhase1,
    doRunPhase2,
  }
}
