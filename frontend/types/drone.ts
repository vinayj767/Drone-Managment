export interface Drone {
  _id: string
  name: string
  model: string
  serialNumber: string
  status: 'active' | 'inactive' | 'maintenance' | 'error'
  batteryLevel: number
  location: {
    latitude: number
    longitude: number
    altitude: number
  }
  lastMaintenance: Date
  flightHours: number
  maxFlightTime: number
  payload: {
    camera: boolean
    sensors: string[]
    maxWeight: number
  }
  health: {
    battery: number
    motors: number
    sensors: number
    communication: number
  }
  isAssigned: boolean
  currentMission?: string
  pilot?: string
  createdAt: Date
  updatedAt: Date
}

export interface DroneStats {
  totalDrones: number
  activeDrones: number
  inactiveDrones: number
  maintenanceDrones: number
  errorDrones: number
  totalFlightHours: number
  averageBatteryLevel: number
}

export interface DroneFormData {
  name: string
  model: string
  serialNumber: string
  maxFlightTime: number
  payload: {
    camera: boolean
    sensors: string[]
    maxWeight: number
  }
}