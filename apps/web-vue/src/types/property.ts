export interface Property {
  id: string
  name: string
  address: string
  city: string
  zipCode: string
  type: 'apartment' | 'house' | 'commercial' | 'mixed'
  status: 'active' | 'vacant' | 'renovation'
  purchasePrice: number
  currentValue: number
  area: number
  units: number
  yearBuilt: number
  image?: string
  coordinates?: { lat: number; lng: number }
}

export interface PropertyUnit {
  id: string
  propertyId: string
  name: string
  area: number
  rooms: number
  floor: number
  rentCold: number
  rentWarm: number
  status: 'occupied' | 'vacant' | 'notice'
  tenantId?: string
}

export interface PropertyKpis {
  totalValue: number
  totalRent: number
  avgYield: number
  occupancyRate: number
  maintenanceCosts: number
}
