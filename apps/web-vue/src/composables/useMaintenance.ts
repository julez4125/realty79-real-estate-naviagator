import { ref, computed, onMounted } from 'vue'
import { getMaintenanceTickets, getMaintenanceTasks, getHandwerker } from '@/services/api'
import { formatCurrency } from '@/utils/formatters'

export function useMaintenance() {
  const loading = ref(true)
  const activeTab = ref('tickets')

  const tickets = ref<any[]>([])
  const tasks = ref<any[]>([])
  const handwerker = ref<any[]>([])

  const fmtCur = formatCurrency

  function fmtDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function getInitials(name: string): string {
    if (!name) return '?'
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // -- KPIs computed from data --
  const kpis = computed(() => {
    const offeneTickets = tickets.value.filter(
      (t) => t.status && !['erledigt', 'geschlossen', 'closed', 'done'].includes(t.status.toLowerCase()),
    ).length

    const offeneAufgaben = tasks.value.filter(
      (t) => t.status && !['erledigt', 'geschlossen', 'closed', 'done'].includes(t.status.toLowerCase()),
    ).length

    const now = new Date()
    const ueberfaellig = tasks.value.filter((t) => {
      const due = t.faelligAm || t.dueDate
      if (!due) return false
      const statusLower = (t.status || '').toLowerCase()
      if (['erledigt', 'geschlossen', 'closed', 'done'].includes(statusLower)) return false
      return new Date(due) < now
    }).length

    const monatskosten = tickets.value.reduce((sum: number, t: any) => sum + (t.kosten || t.cost || 0), 0)

    return { offeneTickets, offeneAufgaben, ueberfaellig, monatskosten }
  })

  // -- Ticket grouping --
  const statusOrder = ['neu', 'offen', 'in bearbeitung', 'erledigt']
  const statusLabels: Record<string, string> = {
    neu: 'Neu',
    offen: 'Offen',
    'in bearbeitung': 'In Bearbeitung',
    erledigt: 'Erledigt',
  }

  const ticketGroups = computed(() => {
    const groups: Record<string, any[]> = {}
    for (const ticket of tickets.value) {
      const key = (ticket.status || 'offen').toLowerCase()
      if (!groups[key]) groups[key] = []
      groups[key].push(ticket)
    }

    const sorted = statusOrder
      .filter((s) => groups[s]?.length)
      .map((s) => ({
        status: s,
        label: statusLabels[s] || s,
        items: groups[s],
      }))

    // Add any remaining groups not in statusOrder
    for (const key of Object.keys(groups)) {
      if (!statusOrder.includes(key)) {
        sorted.push({
          status: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          items: groups[key],
        })
      }
    }

    return sorted
  })

  function statusIcon(status: string): string {
    const s = (status || '').toLowerCase()
    if (s === 'neu') return 'mdi-plus-circle-outline'
    if (s === 'offen') return 'mdi-alert-circle-outline'
    if (s === 'in bearbeitung') return 'mdi-progress-wrench'
    if (s === 'erledigt' || s === 'geschlossen' || s === 'closed' || s === 'done') return 'mdi-check-circle-outline'
    return 'mdi-circle-outline'
  }

  function statusColor(status: string): string {
    const s = (status || '').toLowerCase()
    if (s === 'neu') return 'info'
    if (s === 'offen') return 'warning'
    if (s === 'in bearbeitung') return 'primary'
    if (s === 'erledigt' || s === 'geschlossen' || s === 'closed' || s === 'done') return 'success'
    return 'secondary'
  }

  function priorityColor(priority: string): string {
    const p = (priority || '').toLowerCase()
    if (p === 'dringend' || p === 'urgent') return 'danger'
    if (p === 'hoch' || p === 'high') return 'warning'
    if (p === 'normal' || p === 'medium') return 'info'
    if (p === 'niedrig' || p === 'low') return 'success'
    return 'secondary'
  }

  async function loadData() {
    loading.value = true
    try {
      const [t, a, h] = await Promise.all([
        getMaintenanceTickets().catch(() => []),
        getMaintenanceTasks().catch(() => []),
        getHandwerker().catch(() => []),
      ])
      tickets.value = Array.isArray(t) ? t : t?.items || []
      tasks.value = Array.isArray(a) ? a : a?.items || []
      handwerker.value = Array.isArray(h) ? h : h?.items || []
    } catch {
      // silent
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)

  return {
    loading,
    activeTab,
    tickets,
    tasks,
    handwerker,
    kpis,
    ticketGroups,
    fmtCur,
    fmtDate,
    getInitials,
    statusIcon,
    statusColor,
    priorityColor,
    loadData,
  }
}
