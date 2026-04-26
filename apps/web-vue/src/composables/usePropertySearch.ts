import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  mockSearchProperties,
  DEFAULT_FILTERS,
  type MockSearchProperty,
  type SearchFilters,
  type SavedSearch,
} from '@/data/mockSearchProperties'

const LS_SAVED = 'r79_saved_searches'

export function usePropertySearch() {
  const router = useRouter()

  // ─── Filters ───
  const filters = reactive<SearchFilters>({ ...DEFAULT_FILTERS })
  const sortBy = ref<keyof MockSearchProperty>('score')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const loading = ref(false)
  const viewMode = ref<'list' | 'split'>('list')

  // ─── Compare ───
  const compareMode = ref(false)
  const selectedForCompare = ref<Set<string>>(new Set())

  function toggleCompareMode() {
    compareMode.value = !compareMode.value
    if (!compareMode.value) selectedForCompare.value.clear()
  }

  function toggleCompareSelection(id: string) {
    const s = selectedForCompare.value
    if (s.has(id)) {
      s.delete(id)
    } else if (s.size < 3) {
      s.add(id)
    }
  }

  function goToCompare() {
    const ids = [...selectedForCompare.value].join(',')
    router.push({ name: 'property-compare', query: { ids } })
  }

  // ─── Filtering ───
  const filteredResults = computed(() => {
    return mockSearchProperties.filter((p) => {
      if (filters.stadtPlz) {
        const q = filters.stadtPlz.toLowerCase()
        if (
          !p.ort.toLowerCase().includes(q) &&
          !p.plz.includes(q) &&
          !p.adresse.toLowerCase().includes(q)
        )
          return false
      }
      if (filters.preisMin != null && p.kaufpreis < filters.preisMin) return false
      if (filters.preisMax != null && p.kaufpreis > filters.preisMax) return false
      if (filters.flaecheMin != null && p.wohnflaeche < filters.flaecheMin) return false
      if (filters.flaecheMax != null && p.wohnflaeche > filters.flaecheMax) return false
      if (filters.zimmerMin != null && p.zimmer < filters.zimmerMin) return false
      if (filters.baujahrMin != null && p.baujahr < filters.baujahrMin) return false
      if (filters.renditeMin != null && p.rendite < filters.renditeMin) return false
      if (filters.objekttyp && p.objekttyp !== filters.objekttyp) return false
      return true
    })
  })

  // ─── Sorting ───
  const sortedResults = computed(() => {
    const key = sortBy.value
    const dir = sortOrder.value === 'asc' ? 1 : -1
    return [...filteredResults.value].sort((a, b) => {
      const av = a[key] as number
      const bv = b[key] as number
      return (av - bv) * dir
    })
  })

  // ─── Summary stats ───
  const summaryStats = computed(() => {
    const r = filteredResults.value
    if (r.length === 0) {
      return { avgRendite: 0, avgScore: 0, aboveThreshold: 0, bestDeal: null as MockSearchProperty | null }
    }
    const avgRendite = +(r.reduce((s, p) => s + p.rendite, 0) / r.length).toFixed(1)
    const avgScore = Math.round(r.reduce((s, p) => s + p.score, 0) / r.length)
    const aboveThreshold = r.filter((p) => p.score >= 70).length
    const bestDeal = r.reduce((best, p) => (p.score > best.score ? p : best), r[0])
    return { avgRendite, avgScore, aboveThreshold, bestDeal }
  })

  // ─── Active filter count ───
  const activeFilterCount = computed(() => {
    let c = 0
    if (filters.stadtPlz) c++
    if (filters.preisMin != null) c++
    if (filters.preisMax != null) c++
    if (filters.flaecheMin != null) c++
    if (filters.flaecheMax != null) c++
    if (filters.zimmerMin != null) c++
    if (filters.baujahrMin != null) c++
    if (filters.renditeMin != null) c++
    if (filters.objekttyp) c++
    return c
  })

  function resetFilters() {
    Object.assign(filters, DEFAULT_FILTERS)
  }

  // ─── Simulate loading ───
  watch(
    () => ({ ...filters }),
    () => {
      loading.value = true
      setTimeout(() => {
        loading.value = false
      }, 300)
    },
  )

  // ─── Saved searches (localStorage) ───
  const savedSearches = ref<SavedSearch[]>(loadSaved())

  function loadSaved(): SavedSearch[] {
    try {
      const raw = localStorage.getItem(LS_SAVED)
      if (!raw) return []
      const list = JSON.parse(raw) as SavedSearch[]
      // Assign random "new" counts for demo
      return list.map((s) => ({ ...s, newResultCount: Math.floor(Math.random() * 6) }))
    } catch {
      return []
    }
  }

  function persistSaved() {
    localStorage.setItem(LS_SAVED, JSON.stringify(savedSearches.value))
  }

  function saveCurrentSearch(name: string) {
    const search: SavedSearch = {
      id: `saved-${Date.now()}`,
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      resultCount: filteredResults.value.length,
      newResultCount: 0,
    }
    savedSearches.value.push(search)
    persistSaved()
  }

  function loadSavedSearch(id: string) {
    const s = savedSearches.value.find((x) => x.id === id)
    if (s) {
      Object.assign(filters, s.filters)
      s.newResultCount = 0
      persistSaved()
    }
  }

  function deleteSavedSearch(id: string) {
    savedSearches.value = savedSearches.value.filter((x) => x.id !== id)
    persistSaved()
  }

  return {
    // Filters
    filters,
    sortBy,
    sortOrder,
    loading,
    viewMode,
    activeFilterCount,
    resetFilters,

    // Results
    sortedResults,
    filteredResults,
    summaryStats,

    // Compare
    compareMode,
    selectedForCompare,
    toggleCompareMode,
    toggleCompareSelection,
    goToCompare,

    // Saved searches
    savedSearches,
    saveCurrentSearch,
    loadSavedSearch,
    deleteSavedSearch,
  }
}
