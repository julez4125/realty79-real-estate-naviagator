import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  // SaaS (no shell)
  { path: 'landing', loadComponent: () => import('./pages/landing/landing.page').then(m => m.LandingPage) },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  // Authenticated routes (with shell layout)
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      // Scout
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'properties', loadComponent: () => import('./pages/property-list/property-list.page').then(m => m.PropertyListPage) },
      { path: 'properties/:id', loadComponent: () => import('./pages/property-detail/property-detail.page').then(m => m.PropertyDetailPage) },
      // Verwaltung
      { path: 'portfolio', loadComponent: () => import('./pages/portfolio/portfolio.page').then(m => m.PortfolioPage) },
      { path: 'renters', loadComponent: () => import('./pages/renters/renters.page').then(m => m.RentersPage) },
      { path: 'documents', loadComponent: () => import('./pages/documents/documents.page').then(m => m.DocumentsPage) },
      { path: 'maintenance', loadComponent: () => import('./pages/maintenance/maintenance.page').then(m => m.MaintenancePage) },
      { path: 'accounting', loadComponent: () => import('./pages/accounting/accounting.page').then(m => m.AccountingPage) },
      // AI
      { path: 'chat', loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage) },
      { path: 'messaging', loadComponent: () => import('./pages/messaging/messaging.page').then(m => m.MessagingPage) },
      // Settings
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage) },
    ],
  },
];
