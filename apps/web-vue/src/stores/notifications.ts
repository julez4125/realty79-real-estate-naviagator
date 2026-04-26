import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: string
  type: 'maintenance' | 'payment' | 'document' | 'ai' | 'property' | 'system'
  title: string
  message: string
  icon: string
  color: string
  read: boolean
  createdAt: string
  route?: string
}

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([])
  const loading = ref(false)

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length)
  const sortedItems = computed(() =>
    [...items.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )

  async function fetchNotifications() {
    loading.value = true
    try {
      // TODO: Replace with real API call
      items.value = getMockNotifications()
    } finally {
      loading.value = false
    }
  }

  function markAsRead(id: string) {
    const item = items.value.find((n) => n.id === id)
    if (item) item.read = true
  }

  function markAllAsRead() {
    items.value.forEach((n) => (n.read = true))
  }

  function dismiss(id: string) {
    items.value = items.value.filter((n) => n.id !== id)
  }

  return { items, loading, unreadCount, sortedItems, fetchNotifications, markAsRead, markAllAsRead, dismiss }
})

function getMockNotifications(): Notification[] {
  const now = Date.now()
  return [
    {
      id: 'n1',
      type: 'maintenance',
      title: 'Wartungsticket erstellt',
      message: 'Heizung defekt — Mozartstr. 12, WE 1. Handwerker wurde benachrichtigt.',
      icon: 'mdi-wrench-clock',
      color: 'warning',
      read: false,
      createdAt: new Date(now - 30 * 60000).toISOString(),
      route: '/maintenance',
    },
    {
      id: 'n2',
      type: 'payment',
      title: 'Mieteingang verbucht',
      message: 'Maria Schmidt — 1.050 EUR Kaltmiete März 2026 eingegangen.',
      icon: 'mdi-cash-check',
      color: 'success',
      read: false,
      createdAt: new Date(now - 2 * 3600000).toISOString(),
      route: '/accounting',
    },
    {
      id: 'n3',
      type: 'document',
      title: 'Nebenkostenabrechnung fertig',
      message: 'NK-Abrechnung 2025 für Schillerstr. 8 wurde generiert.',
      icon: 'mdi-file-document-check',
      color: 'info',
      read: false,
      createdAt: new Date(now - 5 * 3600000).toISOString(),
      route: '/documents',
    },
    {
      id: 'n4',
      type: 'ai',
      title: 'AI-Analyse abgeschlossen',
      message: 'Standort-Scoring für Beethovenstr. 5, Leipzig fertig. Score: 87/100.',
      icon: 'mdi-robot-outline',
      color: 'primary',
      read: true,
      createdAt: new Date(now - 12 * 3600000).toISOString(),
      route: '/properties',
    },
    {
      id: 'n5',
      type: 'property',
      title: 'Neues Objekt in Pipeline',
      message: 'Gartenweg 8, Dresden — automatisch in Phase 1 aufgenommen.',
      icon: 'mdi-home-plus',
      color: 'accent',
      read: true,
      createdAt: new Date(now - 24 * 3600000).toISOString(),
      route: '/properties',
    },
  ]
}
