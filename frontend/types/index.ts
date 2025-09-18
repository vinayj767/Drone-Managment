export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'operator'
}

export interface Drone {
  _id: string
  name: string
  droneModel: string
  serialNumber: string
  status: 'available' | 'in-mission' | 'maintenance' | 'offline'
  batteryLevel: number
  currentLocation: {
    latitude: number
    longitude: number
  }
  maxSpeed: number
  maxAltitude: number
  flightTime: number
  lastMaintenance: string
  createdAt: string
  updatedAt: string
}

export interface Waypoint {
  latitude: number
  longitude: number
  altitude: number
  order: number
}

export interface Mission {
  _id: string
  name: string
  description?: string
  droneId: Drone | string
  userId: User | string
  waypoints: Waypoint[]
  polygon: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  altitude: number
  speed: number
  overlap: number
  status: 'planned' | 'in-progress' | 'completed' | 'aborted' | 'paused'
  startTime?: string
  endTime?: string
  estimatedDuration: number
  currentWaypoint: number
  progress: number
  createdAt: string
  updatedAt: string
}

export interface Report {
  _id: string
  missionId: Mission | string
  droneId: Drone | string
  userId: User | string
  duration: number
  distanceFlown: number
  areaCovered: number
  averageSpeed: number
  averageAltitude: number
  batteryUsed: number
  imagesCapture: number
  status: 'success' | 'partial' | 'failed'
  notes?: string
  generatedAt: string
  createdAt: string
  updatedAt: string
}

export interface TelemetryData {
  missionId: string
  droneId: string
  position: {
    latitude: number
    longitude: number
    altitude: number
  }
  speed: number
  batteryLevel: number
  progress: number
  currentWaypoint: number
  totalWaypoints: number
  eta: number
  timestamp: string
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}