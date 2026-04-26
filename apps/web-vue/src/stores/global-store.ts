import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGlobalStore = defineStore('global', () => {
  // Sidebar
  const isSidebarMinimized = ref(false)
  function toggleSidebar() {
    isSidebarMinimized.value = !isSidebarMinimized.value
  }

  // Global loading states
  const globalLoading = ref(false)
  const pageLoading = ref<Record<string, boolean>>({})

  function setPageLoading(page: string, loading: boolean) {
    pageLoading.value[page] = loading
  }
  const isAnyLoading = computed(() =>
    globalLoading.value || Object.values(pageLoading.value).some(Boolean),
  )

  // Theme
  const isDarkMode = ref(document.documentElement.getAttribute('data-theme') === 'dark')
  function setDarkMode(dark: boolean) {
    isDarkMode.value = dark
  }

  // Online status
  const isOnline = ref(navigator.onLine)
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => (isOnline.value = true))
    window.addEventListener('offline', () => (isOnline.value = false))
  }

  return {
    isSidebarMinimized,
    toggleSidebar,
    globalLoading,
    pageLoading,
    setPageLoading,
    isAnyLoading,
    isDarkMode,
    setDarkMode,
    isOnline,
  }
})
