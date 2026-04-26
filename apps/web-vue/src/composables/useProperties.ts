import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getProperties, toggleFavorite, toggleHidden } from '@/services/api'
import { mockProperties as sharedMockProperties, mockToListProperty } from '@/data/mockProperties'
import type { MockTriageProperty } from '@/data/mockProperties'

type TriageProperty = MockTriageProperty

export function useProperties() {
  const router = useRouter()

  // ---------- Compare Mode ----------
  const compareMode = ref(false)
  const selectedForCompare = ref<Set<string>>(new Set())

  function toggleCompareMode() {
    compareMode.value = !compareMode.value
    if (!compareMode.value) {
      selectedForCompare.value = new Set()
    }
  }

  function toggleCompareSelection(id: string) {
    const next = new Set(selectedForCompare.value)
    if (next.has(id)) {
      next.delete(id)
    } else if (next.size < 3) {
      next.add(id)
    }
    selectedForCompare.value = next
  }

  function goToCompare() {
    const ids = Array.from(selectedForCompare.value).join(',')
    router.push({ path: '/properties/compare', query: { ids } })
  }

  // ---------- View Mode ----------
  const viewMode = ref<'list' | 'triage'>('list')
  const viewModeOptions = [
    { label: 'Liste', value: 'list' },
    { label: 'Triage', value: 'triage' },
  ]

  // ---------- List State ----------
  const properties = ref<any[]>([])
  const total = ref(0)
  const loading = ref(false)
  const loadingMore = ref(false)

  const phaseOptions = [
    { text: 'Phase 1', value: 1 },
    { text: 'Phase 2', value: 2 },
    { text: 'Phase 3', value: 3 },
  ]

  const sortOptions = [
    { text: 'Datum', value: 'createdAt' },
    { text: 'Preis', value: 'kaufpreis' },
    { text: 'Score', value: 'score' },
    { text: 'Fläche', value: 'wohnflaeche' },
  ]

  const filter = reactive({
    page: 1,
    limit: 24,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    isHidden: false,
    search: '',
    phase: undefined as number | undefined,
  })

  const activeFilterCount = computed(() => {
    let count = 0
    if (filter.search) count++
    if (filter.phase != null) count++
    if (filter.sortBy !== 'createdAt') count++
    return count
  })

  // ---------- Filter helpers ----------
  let debounceTimer: ReturnType<typeof setTimeout>
  function debounceApply() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(applyFilters, 400)
  }

  function toggleSortOrder() {
    filter.sortOrder = filter.sortOrder === 'asc' ? 'desc' : 'asc'
    applyFilters()
  }

  function applyFilters() {
    loadProperties()
  }

  function resetFilters() {
    Object.assign(filter, {
      page: 1,
      limit: 24,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      isHidden: false,
      search: '',
      phase: undefined,
    })
    loadProperties()
  }

  // ---------- Phase gradient ----------
  function phaseGradient(phase: number | undefined) {
    switch (phase) {
      case 1:
        return 'bg-gradient-to-br from-[#1e3a5f] via-[#2d6a9f] to-[#4a9bd9]'
      case 2:
        return 'bg-gradient-to-br from-[#3b1e5f] via-[#6a2d9f] to-[#9b4ad9]'
      case 3:
        return 'bg-gradient-to-br from-[#1e5f3a] via-[#2d9f6a] to-[#4ad99b]'
      default:
        return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
    }
  }

  // ---------- Data loading ----------
  async function loadProperties() {
    loading.value = true
    filter.page = 1
    try {
      const result = await getProperties(filter)
      properties.value = result?.items || []
      total.value = result?.total || 0
    } catch {
      // silent
    }
    // Fallback: if API returned nothing (no backend running), use mock demo data
    if (properties.value.length === 0) {
      properties.value = sharedMockProperties.map(mockToListProperty)
      total.value = properties.value.length
    }
    loading.value = false
  }

  async function loadMore() {
    loadingMore.value = true
    filter.page++
    try {
      const result = await getProperties(filter)
      properties.value.push(...(result?.items || []))
      total.value = result?.total || total.value
    } catch {
      // silent
    } finally {
      loadingMore.value = false
    }
  }

  async function doToggleFavorite(p: any) {
    try {
      const result = await toggleFavorite(p.id)
      p.isFavorite = result?.isFavorite ?? !p.isFavorite
    } catch {
      // silent
    }
  }

  // ==================== TRIAGE MODE ====================

  const mockProperties: TriageProperty[] = [...sharedMockProperties]

  const triageProperties = ref<TriageProperty[]>([...mockProperties])
  const triageIndex = ref(0)
  const triageTransition = ref('triage-slide-left')
  const triageStats = reactive({ favorited: 0, rejected: 0, skipped: 0 })

  const currentTriageProperty = computed(() =>
    triageProperties.value[triageIndex.value] ?? null,
  )

  const triageComplete = computed(() =>
    triageIndex.value >= triageProperties.value.length,
  )

  const triageProgressPercent = computed(() => {
    if (triageProperties.value.length === 0) return 0
    return Math.round((triageIndex.value / triageProperties.value.length) * 100)
  })

  function advanceTriage() {
    triageIndex.value++
  }

  async function handleTriageReject(id: string) {
    triageTransition.value = 'triage-slide-left'
    triageStats.rejected++
    try {
      await toggleHidden(id)
    } catch {
      // mock mode — ignore API errors
    }
    advanceTriage()
  }

  function handleTriageSkip(_id: string) {
    triageTransition.value = 'triage-slide-left'
    triageStats.skipped++
    advanceTriage()
  }

  async function handleTriageFavorite(id: string) {
    triageTransition.value = 'triage-slide-right'
    triageStats.favorited++
    try {
      await toggleFavorite(id)
    } catch {
      // mock mode — ignore API errors
    }
    advanceTriage()
  }

  function resetTriage() {
    triageIndex.value = 0
    triageStats.favorited = 0
    triageStats.rejected = 0
    triageStats.skipped = 0
    triageTransition.value = 'triage-slide-left'
  }

  // Keyboard shortcuts for triage
  function handleTriageKeydown(e: KeyboardEvent) {
    if (viewMode.value !== 'triage' || triageComplete.value || !currentTriageProperty.value) return
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        handleTriageReject(currentTriageProperty.value.id)
        break
      case 'ArrowDown':
        e.preventDefault()
        handleTriageSkip(currentTriageProperty.value.id)
        break
      case 'ArrowRight':
        e.preventDefault()
        handleTriageFavorite(currentTriageProperty.value.id)
        break
    }
  }

  // Reset triage when switching into triage mode
  watch(viewMode, (newMode) => {
    if (newMode === 'triage') {
      resetTriage()
    }
  })

  onMounted(() => {
    loadProperties()
    window.addEventListener('keydown', handleTriageKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleTriageKeydown)
  })

  return {
    // Compare
    compareMode,
    selectedForCompare,
    toggleCompareMode,
    toggleCompareSelection,
    goToCompare,
    // View mode
    viewMode,
    viewModeOptions,
    // List
    properties,
    total,
    loading,
    loadingMore,
    phaseOptions,
    sortOptions,
    filter,
    activeFilterCount,
    debounceApply,
    toggleSortOrder,
    applyFilters,
    resetFilters,
    phaseGradient,
    loadProperties,
    loadMore,
    doToggleFavorite,
    // Triage
    triageProperties,
    triageIndex,
    triageTransition,
    triageStats,
    currentTriageProperty,
    triageComplete,
    triageProgressPercent,
    handleTriageReject,
    handleTriageSkip,
    handleTriageFavorite,
    resetTriage,
  }
}
