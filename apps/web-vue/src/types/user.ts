export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'viewer'
  avatar?: string
  createdAt: string
}
