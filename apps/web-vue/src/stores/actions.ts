import { defineStore } from 'pinia'

export interface ActionItem {
  id: string
  type: 'urgent' | 'proactive' | 'opportunity'
  icon: string
  title: string
  description: string
  ctaLabel: string
  ctaRoute?: string
  ctaAction?: string
  timestamp: string
  priority: number // 1=highest
}

export const useActionsStore = defineStore('actions', {
  state: () => ({
    items: [] as ActionItem[],
    loading: false,
    dismissed: new Set<string>(),
  }),
  getters: {
    activeItems: (state) =>
      state.items
        .filter((i) => !state.dismissed.has(i.id))
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 5),
    urgentCount: (state) =>
      state.items.filter((i) => i.type === 'urgent' && !state.dismissed.has(i.id)).length,
  },
  actions: {
    async fetchActions() {
      this.loading = true
      try {
        // TODO: Replace with real API call when endpoint exists
        // const data = await api.get('/actions/urgent').then(unwrap)
        this.items = getMockActions()
      } finally {
        this.loading = false
      }
    },
    dismiss(id: string) {
      this.dismissed.add(id)
    },
  },
})

function getMockActions(): ActionItem[] {
  return [
    {
      id: 'a1',
      type: 'urgent',
      icon: 'mdi-alert-circle',
      title: 'Zahlung 14 Tage überfällig',
      description: 'Mieter Schmidt, Mozartstr. 12 -- Kaltmiete März: 850 EUR',
      ctaLabel: 'Mahnung senden',
      ctaRoute: '/messaging',
      timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
      priority: 1,
    },
    {
      id: 'a2',
      type: 'proactive',
      icon: 'mdi-file-document-alert',
      title: 'Mietvertrag läuft in 58 Tagen aus',
      description: 'Huber, Schillerstr. 8 / WE 3 -- Befristung endet 15.05.2026',
      ctaLabel: 'Verlängerung vorbereiten',
      ctaRoute: '/documents',
      timestamp: new Date().toISOString(),
      priority: 2,
    },
    {
      id: 'a3',
      type: 'opportunity',
      icon: 'mdi-home-search',
      title: 'Neues Objekt: Score 87',
      description: 'Beethovenstr. 5, Leipzig -- 1.420 EUR/m2, Rendite ~6.2%',
      ctaLabel: 'Analyse starten',
      ctaRoute: '/properties',
      timestamp: new Date().toISOString(),
      priority: 3,
    },
    {
      id: 'a4',
      type: 'urgent',
      icon: 'mdi-wrench-clock',
      title: 'Wartungsticket offen seit 7 Tagen',
      description: 'Heizung defekt, Mozartstr. 12 / WE 1 -- Mieter drängt',
      ctaLabel: 'Ticket bearbeiten',
      ctaRoute: '/maintenance',
      timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
      priority: 1,
    },
    {
      id: 'a5',
      type: 'proactive',
      icon: 'mdi-message-reply-text',
      title: '2 KI-Nachrichten warten auf Review',
      description: 'Auto-generierte Antworten für Mieter Weber und Koch',
      ctaLabel: 'Review öffnen',
      ctaRoute: '/messaging',
      timestamp: new Date().toISOString(),
      priority: 2,
    },
  ]
}
