export interface Mission {
  _id: string
  name: string
  description: string
  type: 'survey' | 'inspection' | 'mapping' | 'delivery' | 'search_rescue'
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  drone?: string
  pilot?: string
  surveyArea: {
    name: string
    coordinates: Array<{
      latitude: number
      longitude: number
    }>
    altitude: number
    area: number
  }
  flightPlan: {
    waypoints: Array<{
      latitude: number
      longitude: number
      altitude: number
      action?: string
    }>
    estimatedDuration: number
    estimatedDistance: number
  }
  schedule: {
    startTime: Date
    endTime?: Date
    isRecurring: boolean
    recurrencePattern?: string
  }
  progress: {
    currentWaypoint: number
    totalWaypoints: number
    completedPercentage: number
    distanceCovered: number
    timeElapsed: number
  }
  parameters: {
    speed: number
    altitude: number
    gimbalAngle: number
    cameraSettings: {
      resolution: string
      frameRate: number
      iso: number
    }
  }
  weather: {
    windSpeed: number
    windDirection: number
    temperature: number
    humidity: number
    visibility: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface MissionStats {
  totalMissions: number
  activeMissions: number
  completedMissions: number
  plannedMissions: number
  cancelledMissions: number
  totalFlightTime: number
  totalDistance: number
}

export interface MissionFormData {
  name: string
  description: string
  type: Mission['type']
  priority: Mission['priority']
  surveyArea: Mission['surveyArea']
  parameters: Mission['parameters']
  schedule: {
    startTime: Date
    isRecurring: boolean
    recurrencePattern?: string
  }
}