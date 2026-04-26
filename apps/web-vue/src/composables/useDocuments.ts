import { ref, computed, onMounted } from 'vue'
import { getDocuments, getTemplates } from '@/services/api'

export function useDocuments() {
  const loading = ref(true)
  const documents = ref<any[]>([])
  const categoryFilter = ref('alle')

  const categoryOptions = computed(() => [
    { label: 'Alle', value: 'alle' },
    { label: 'Verträge', value: 'vertrag' },
    { label: 'Abrechnungen', value: 'abrechnung' },
    { label: 'Objekt', value: 'objekt' },
    { label: 'Vorlagen', value: 'vorlage' },
  ])

  // Client-side filtering by category
  const filteredDocuments = computed(() => {
    if (categoryFilter.value === 'alle') return documents.value
    return documents.value.filter((d) => normalizeCategory(d.category) === categoryFilter.value)
  })

  function normalizeCategory(cat: string | undefined): string {
    if (!cat) return ''
    const lower = cat.toLowerCase()
    if (lower.includes('vertrag') || lower.includes('contract') || lower.includes('mietvertrag')) return 'vertrag'
    if (lower.includes('abrechnung') || lower.includes('rechnung') || lower.includes('billing')) return 'abrechnung'
    if (lower.includes('objekt') || lower.includes('property') || lower.includes('immobilie')) return 'objekt'
    if (lower.includes('vorlage') || lower.includes('template')) return 'vorlage'
    return lower
  }

  function getCategoryIcon(cat: string | undefined): string {
    const norm = normalizeCategory(cat)
    if (norm === 'vertrag') return 'mdi-file-sign'
    if (norm === 'abrechnung') return 'mdi-receipt-text-outline'
    if (norm === 'objekt') return 'mdi-home-city-outline'
    if (norm === 'vorlage') return 'mdi-file-document-edit-outline'
    return 'mdi-file-outline'
  }

  function getCategoryClass(cat: string | undefined): string {
    return normalizeCategory(cat) || 'default'
  }

  function getCategoryLabel(cat: string | undefined): string {
    const norm = normalizeCategory(cat)
    if (norm === 'vertrag') return 'Vertrag'
    if (norm === 'abrechnung') return 'Abrechnung'
    if (norm === 'objekt') return 'Objekt'
    if (norm === 'vorlage') return 'Vorlage'
    return cat || '-'
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

  async function loadDocuments() {
    loading.value = true
    try {
      const [docs, templates] = await Promise.all([
        getDocuments().catch(() => []),
        getTemplates().catch(() => []),
      ])

      const docList = Array.isArray(docs) ? docs : docs?.items || []
      const tmplList = (Array.isArray(templates) ? templates : templates?.items || []).map((t: any) => ({
        ...t,
        category: t.category || 'vorlage',
      }))

      documents.value = [...docList, ...tmplList]
    } catch {
      documents.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(loadDocuments)

  return {
    loading,
    documents,
    categoryFilter,
    categoryOptions,
    filteredDocuments,
    normalizeCategory,
    getCategoryIcon,
    getCategoryClass,
    getCategoryLabel,
    formatDate,
    loadDocuments,
  }
}
