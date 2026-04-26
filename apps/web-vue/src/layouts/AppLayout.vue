<template>
  <VaLayout
    :top="{ fixed: true, order: 2 }"
    :left="{ fixed: true, absolute: breakpoints.lgDown, order: 1, overlay: breakpoints.lgDown && !isSidebarMinimized }"
    @leftOverlayClick="isSidebarMinimized = true"
  >
    <template #top>
      <NavigationProgress />
      <a href="#main-content" class="skip-link">
        Zum Hauptinhalt springen
      </a>
      <AppNavbar :is-mobile="isMobile" />
    </template>

    <template #left>
      <AppSidebar :visible="!isSidebarMinimized" :mobile="isMobile" @update:visible="v => isSidebarMinimized = !v" />
    </template>

    <template #content>
      <div :class="{ minimized: isSidebarMinimized }" class="app-layout__sidebar-wrapper">
        <div v-if="isFullScreenSidebar" class="flex justify-end">
          <VaButton class="px-4 py-4" icon="mdi-close" preset="plain" aria-label="Seitenleiste schließen" @click="isSidebarMinimized = true" />
        </div>
      </div>
      <main id="main-content" class="p-4 pt-0">
        <article>
          <RouterView />
        </article>
      </main>
    </template>
  </VaLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteUpdate } from 'vue-router'
import { useBreakpoint } from 'vuestic-ui'
import { useGlobalStore } from '@/stores/global-store'
import AppNavbar from '@/components/navbar/AppNavbar.vue'
import AppSidebar from '@/components/sidebar/AppSidebar.vue'
import NavigationProgress from '@/components/shared/NavigationProgress.vue'

const globalStore = useGlobalStore()
const breakpoints = useBreakpoint()
const isMobile = ref(false)
const isTablet = ref(false)
const { isSidebarMinimized } = storeToRefs(globalStore)

const onResize = () => {
  isSidebarMinimized.value = breakpoints.lgDown
  isMobile.value = breakpoints.smDown
  isTablet.value = breakpoints.lgDown
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  onResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

onBeforeRouteUpdate(() => {
  if (breakpoints.lgDown) {
    isSidebarMinimized.value = true
  }
})

const isFullScreenSidebar = computed(() => isTablet.value && !isSidebarMinimized.value)
</script>

<style lang="scss" scoped>
.va-sidebar {
  width: unset !important;
  min-width: unset !important;
}
</style>
