// Re-export from modular API structure for backward compatibility
// New code should import from '@/services/api/...' directly
export { api, unwrap } from './api/client'
export * from './api/properties'
export * from './api/auth'
export * from './api/portfolio'
export * from './api/messaging'
export * from './api/maintenance'
export * from './api/accounting'
export * from './api/misc'
