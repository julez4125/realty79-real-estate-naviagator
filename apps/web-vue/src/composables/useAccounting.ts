import { ref, computed, onMounted } from 'vue'
import {
  getPaymentStats,
  getOverduePayments,
  getExpenses,
  getSteuerDaten,
  getPortfolios,
} from '@/services/api'
import { formatCurrency, formatNumber } from '@/utils/formatters'

export function useAccounting() {
  const fmtCur = formatCurrency
  const fmtNum = formatNumber

  const loading = ref(true)
  const steuerLoading = ref(false)
  const activeTab = ref('zahlungen')

  const payStats = ref<any>(null)
  const overduePayments = ref<any[]>([])
  const expenses = ref<any[]>([])
  const steuerDaten = ref<any>(null)
  const steuerJahr = ref(new Date().getFullYear())
  const portfolioPropertyId = ref<string | null>(null)

  const deductionItems = [
    { key: 'zinsen', label: 'Zinsen', icon: 'mdi-bank-outline' },
    { key: 'afa', label: 'AfA', icon: 'mdi-home-minus-outline' },
    { key: 'instandhaltung', label: 'Instandhaltung', icon: 'mdi-wrench-outline' },
    { key: 'versicherung', label: 'Versicherung', icon: 'mdi-shield-check-outline' },
    { key: 'grundsteuer', label: 'Grundsteuer', icon: 'mdi-file-document-outline' },
    { key: 'hausgeld', label: 'Hausgeld', icon: 'mdi-home-city-outline' },
    { key: 'sonstige', label: 'Sonstige', icon: 'mdi-dots-horizontal-circle-outline' },
  ]

  const totalDeductions = computed(() => {
    if (!steuerDaten.value) return 0
    return deductionItems.reduce((sum, item) => sum + (steuerDaten.value[item.key] || 0), 0)
  })

  const zuVersteuern = computed(() => {
    if (!steuerDaten.value) return 0
    return (steuerDaten.value.mieteinnahmen || 0) - totalDeductions.value
  })

  const expenseGroups = computed(() => {
    if (!expenses.value.length) return []
    const groups = new Map<string, { category: string; total: number; items: any[] }>()
    for (const exp of expenses.value) {
      const cat = exp.kategorie || exp.category || 'Sonstige'
      if (!groups.has(cat)) {
        groups.set(cat, { category: cat, total: 0, items: [] })
      }
      const group = groups.get(cat)!
      group.items.push(exp)
      group.total += exp.betrag || exp.amount || 0
    }
    return [...groups.values()].sort((a, b) => b.total - a.total)
  })

  function mahnstufeBgClass(stufe: number | undefined): string {
    const s = stufe || 0
    if (s === 0) return 'bg-[var(--va-text-tertiary)]'
    if (s === 1) return 'bg-[var(--va-warning)]'
    if (s === 2) return 'bg-[var(--va-danger)]'
    return 'bg-[var(--va-text-primary)]'
  }

  function categoryIcon(category: string): string {
    const map: Record<string, string> = {
      'Instandhaltung': 'mdi-wrench-outline',
      'Versicherung': 'mdi-shield-check-outline',
      'Grundsteuer': 'mdi-file-document-outline',
      'Hausgeld': 'mdi-home-city-outline',
      'Zinsen': 'mdi-bank-outline',
      'Nebenkosten': 'mdi-flash-outline',
      'Verwaltung': 'mdi-briefcase-outline',
    }
    return map[category] || 'mdi-receipt-text-outline'
  }

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  async function loadData() {
    loading.value = true
    try {
      const [stats, overdue, portfolios] = await Promise.all([
        getPaymentStats(),
        getOverduePayments(),
        getPortfolios(),
      ])
      payStats.value = stats
      overduePayments.value = overdue || []

      if (portfolios?.length > 0 && portfolios[0].properties?.length > 0) {
        portfolioPropertyId.value = portfolios[0].properties[0].id
        const [exp] = await Promise.all([
          getExpenses(portfolioPropertyId.value!),
        ])
        expenses.value = exp || []
      }

      await loadSteuer()
    } catch {
      // silent
    } finally {
      loading.value = false
    }
  }

  async function loadSteuer() {
    if (!portfolioPropertyId.value) return
    steuerLoading.value = true
    try {
      steuerDaten.value = await getSteuerDaten(portfolioPropertyId.value, steuerJahr.value)
    } catch {
      steuerDaten.value = null
    } finally {
      steuerLoading.value = false
    }
  }

  function refresh() {
    loadData()
  }

  onMounted(loadData)

  return {
    fmtCur,
    fmtNum,
    loading,
    steuerLoading,
    activeTab,
    payStats,
    overduePayments,
    expenses,
    steuerDaten,
    steuerJahr,
    portfolioPropertyId,
    deductionItems,
    totalDeductions,
    zuVersteuern,
    expenseGroups,
    mahnstufeBgClass,
    categoryIcon,
    formatDate,
    loadData,
    loadSteuer,
    refresh,
  }
}
