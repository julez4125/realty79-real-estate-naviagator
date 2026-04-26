export interface MaintenanceTicket {
  id: string
  propertyId: string
  unitId?: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'scheduled' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  createdAt: string
  dueDate?: string
  cost?: number
}
