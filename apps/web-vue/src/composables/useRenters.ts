import { ref, computed, onMounted } from 'vue'
import { getRenters } from '@/services/api'

// ─── Mock / Demo Renters (fallback when API is unavailable) ───
const MOCK_RENTERS: any[] = [
  {
    id: '1',
    name: 'Maria Schmidt',
    email: 'maria.schmidt@email.de',
    status: 'aktiv',
    unitName: 'Whg. 3 OG links',
    propertyId: 'bestand-1',
    propertyName: 'Berliner Str. 42, 10115 Berlin',
    propertyLocation: 'Berliner Str. 42, 10115 Berlin',
    kaltmiete: 850,
    vertragStart: '2023-04-01',
  },
  {
    id: '2',
    name: 'Thomas Müller',
    email: 'thomas.mueller@email.de',
    status: 'aktiv',
    unitName: 'Whg. 1 EG rechts',
    propertyId: 'bestand-2',
    propertyName: 'Hauptstr. 15, 80331 München',
    propertyLocation: 'Hauptstr. 15, 80331 München',
    kaltmiete: 1200,
    vertragStart: '2022-01-01',
  },
  {
    id: '3',
    name: 'Anna Weber',
    email: 'anna.weber@email.de',
    status: 'gekuendigt',
    unitName: 'Whg. 5 DG',
    propertyId: 'bestand-3',
    propertyName: 'Schillerstr. 8, 60313 Frankfurt',
    propertyLocation: 'Schillerstr. 8, 60313 Frankfurt',
    kaltmiete: 680,
    vertragStart: '2021-06-01',
  },
]

export function useRenters() {
  const loading = ref(true)
  const renters = ref<any[]>([])
  const search = ref('')
  const statusFilter = ref('alle')
  const usingMockData = ref(false)

  // Status counts
  const statusCounts = computed(() => {
    const counts = { alle: renters.value.length, aktiv: 0, gekuendigt: 0 }
    for (const r of renters.value) {
      if (r.status === 'aktiv') counts.aktiv++
      else if (r.status === 'gekuendigt' || r.status === 'gekündigt') counts.gekuendigt++
    }
    return counts
  })

  const statusOptions = computed(() => [
    { label: `Alle (${statusCounts.value.alle})`, value: 'alle' },
    { label: `Aktiv (${statusCounts.value.aktiv})`, value: 'aktiv' },
    { label: `Gekündigt (${statusCounts.value.gekuendigt})`, value: 'gekuendigt' },
  ])

  // Client-side filtering by status + search
  const filteredRenters = computed(() => {
    let list = renters.value

    // Search filter (client-side for mock data)
    if (search.value) {
      const q = search.value.toLowerCase()
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.unitName?.toLowerCase().includes(q) ||
          r.propertyName?.toLowerCase().includes(q) ||
          r.propertyLocation?.toLowerCase().includes(q),
      )
    }

    // Status filter
    if (statusFilter.value === 'aktiv') return list.filter((r) => r.status === 'aktiv')
    if (statusFilter.value === 'gekuendigt')
      return list.filter((r) => r.status === 'gekuendigt' || r.status === 'gekündigt')
    return list
  })

  // Debounced search — when using mock data, filtering is handled client-side
  let debounceTimer: ReturnType<typeof setTimeout>
  function debounceSearch() {
    if (usingMockData.value) return // client-side filtering via computed
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      loadRenters()
    }, 400)
  }

  async function loadRenters() {
    loading.value = true
    try {
      const result = await getRenters(search.value || undefined)
      const items = Array.isArray(result) ? result : result?.items || []
      if (items.length > 0) {
        renters.value = items
        usingMockData.value = false
      } else {
        // API returned empty — use mock data as fallback
        renters.value = MOCK_RENTERS
        usingMockData.value = true
      }
    } catch {
      // API unavailable — use mock data as fallback
      renters.value = MOCK_RENTERS
      usingMockData.value = true
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    search.value = ''
    statusFilter.value = 'alle'
    loadRenters()
  }

  function getInitials(name: string): string {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  function getStatusLabel(status: string): string {
    if (status === 'aktiv') return 'Aktiv'
    if (status === 'gekuendigt' || status === 'gekündigt') return 'Gekündigt'
    if (status === 'inaktiv') return 'Inaktiv'
    return status || '-'
  }

  function getStatusColor(status: string): string {
    if (status === 'aktiv') return 'success'
    if (status === 'gekuendigt' || status === 'gekündigt') return 'danger'
    if (status === 'inaktiv') return 'warning'
    return 'secondary'
  }

  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-'
    try {
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  onMounted(loadRenters)

  return {
    loading,
    renters,
    search,
    statusFilter,
    statusCounts,
    statusOptions,
    filteredRenters,
    usingMockData,
    debounceSearch,
    loadRenters,
    resetFilters,
    getInitials,
    getStatusLabel,
    getStatusColor,
    formatDate,
  }
}
