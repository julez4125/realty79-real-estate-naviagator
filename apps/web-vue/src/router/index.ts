import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard' },
  },
  // Public: Landing
  {
    path: '/landing',
    name: 'landing',
    component: () => import('@/pages/landing/LandingPage.vue'),
  },
  // Auth routes
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('@/pages/auth/LoginPage.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  // Legacy redirect
  { path: '/login', redirect: '/auth/login' },
  // Authenticated routes (AppLayout)
  {
    name: 'app',
    path: '/',
    component: AppLayout,
    redirect: { name: 'dashboard' },
    meta: { requiresAuth: true },
    children: [
      // Scout
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
      },
      {
        name: 'search',
        path: 'suche',
        component: () => import('@/pages/search/SearchPage.vue'),
      },
      {
        name: 'properties',
        path: 'properties',
        component: () => import('@/pages/properties/PropertyListPage.vue'),
      },
      {
        name: 'property-compare',
        path: 'properties/compare',
        component: () => import('@/pages/properties/PropertyComparisonPage.vue'),
      },
      {
        name: 'property-detail',
        path: 'properties/:id',
        component: () => import('@/pages/properties/PropertyDetailPage.vue'),
      },
      // Verwaltung
      {
        name: 'portfolio',
        path: 'portfolio',
        component: () => import('@/pages/portfolio/PortfolioPage.vue'),
      },
      {
        name: 'renters',
        path: 'renters',
        component: () => import('@/pages/renters/RentersPage.vue'),
      },
      {
        name: 'renter-detail',
        path: 'renters/:id',
        component: () => import('@/pages/renters/RenterDetailPage.vue'),
      },
      {
        name: 'documents',
        path: 'documents',
        component: () => import('@/pages/documents/DocumentsPage.vue'),
      },
      {
        name: 'maintenance',
        path: 'maintenance',
        component: () => import('@/pages/maintenance/MaintenancePage.vue'),
      },
      {
        name: 'accounting',
        path: 'accounting',
        component: () => import('@/pages/accounting/AccountingPage.vue'),
      },
      {
        name: 'tools',
        path: 'tools',
        component: () => import('@/pages/tools/ToolsPage.vue'),
      },
      // AI
      {
        name: 'chat',
        path: 'chat',
        component: () => import('@/pages/chat/ChatPage.vue'),
      },
      {
        name: 'messaging',
        path: 'messaging',
        component: () => import('@/pages/messaging/MessagingPage.vue'),
      },
      // System
      {
        name: 'settings',
        path: 'settings',
        component: () => import('@/pages/settings/SettingsPage.vue'),
      },
      {
        name: 'onboarding',
        path: 'onboarding',
        component: () => import('@/pages/onboarding/OnboardingPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    window.scrollTo(0, 0)
  },
  routes,
})

// Auth guard
router.beforeEach((to) => {
  const token = localStorage.getItem('r79_token')
  if (to.matched.some((r) => r.meta.requiresAuth) && !token) {
    return { name: 'login' }
  }
})

export default router
