'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import api from '@/lib/api'
import { Drone, Waypoint } from '@/types'

// Dynamically import the map component to avoid SSR issues
const WaypointMap = dynamic(() => import('@/components/WaypointMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
})

interface MissionForm {
  name: string
  description?: string
  droneId: string
  altitude: number
  speed: number
  overlap: number
}

const fetcher = (url: string) => api.get(url).then(res => res.data)

export default function NewMissionPage() {
  const router = useRouter()
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [polygon, setPolygon] = useState<number[][]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { data: drones } = useSWR<Drone[]>('/drones', fetcher)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MissionForm>()

  const onSubmit = async (data: MissionForm) => {
    if (waypoints.length < 3) {
      toast.error('Please add at least 3 waypoints')
      return
    }

    if (polygon.length < 3) {
      toast.error('Please draw a mission area on the map')
      return
    }

    setIsLoading(true)
    try {
      const estimatedDuration = calculateEstimatedDuration(waypoints, data.speed)
      
      const missionData = {
        ...data,
        waypoints,
        polygon: {
          type: 'Polygon',
          coordinates: [polygon]
        },
        estimatedDuration
      }

      await api.post('/missions', missionData)
      toast.success('Mission created successfully!')
      router.push('/missions')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create mission')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateEstimatedDuration = (waypoints: Waypoint[], speed: number): number => {
    let totalDistance = 0
    for (let i = 1; i < waypoints.length; i++) {
      const prev = waypoints[i - 1]
      const curr = waypoints[i]
      totalDistance += haversineDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      )
    }
    // Convert speed from km/h to km/min and calculate duration
    const speedKmPerMin = speed / 60
    return Math.round(totalDistance / speedKmPerMin)
  }

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const availableDrones = drones?.filter(drone => drone.status === 'available') || []

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Mission</h1>
          <p className="mt-1 text-sm text-gray-600">
            Plan a new survey mission by setting parameters and drawing the flight path on the map.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mission Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Mission Details
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mission Name
                  </label>
                  <input
                    {...register('name', { required: 'Mission name is required' })}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter mission name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter mission description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assign Drone
                  </label>
                  <select
                    {...register('droneId', { required: 'Please select a drone' })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select a drone</option>
                    {availableDrones.map((drone) => (
                      <option key={drone._id} value={drone._id}>
                        {drone.name} ({drone.droneModel}) - {drone.batteryLevel}%
                      </option>
                    ))}
                  </select>
                  {errors.droneId && (
                    <p className="mt-1 text-sm text-red-600">{errors.droneId.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Altitude (m)
                    </label>
                    <input
                      {...register('altitude', { 
                        required: 'Altitude is required',
                        min: { value: 10, message: 'Minimum altitude is 10m' },
                        max: { value: 500, message: 'Maximum altitude is 500m' }
                      })}
                      type="number"
                      min="10"
                      max="500"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="100"
                    />
                    {errors.altitude && (
                      <p className="mt-1 text-sm text-red-600">{errors.altitude.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Speed (km/h)
                    </label>
                    <input
                      {...register('speed', { 
                        required: 'Speed is required',
                        min: { value: 5, message: 'Minimum speed is 5 km/h' },
                        max: { value: 100, message: 'Maximum speed is 100 km/h' }
                      })}
                      type="number"
                      min="5"
                      max="100"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="25"
                    />
                    {errors.speed && (
                      <p className="mt-1 text-sm text-red-600">{errors.speed.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Overlap (%)
                    </label>
                    <input
                      {...register('overlap', { 
                        required: 'Overlap is required',
                        min: { value: 20, message: 'Minimum overlap is 20%' },
                        max: { value: 90, message: 'Maximum overlap is 90%' }
                      })}
                      type="number"
                      min="20"
                      max="90"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="60"
                    />
                    {errors.overlap && (
                      <p className="mt-1 text-sm text-red-600">{errors.overlap.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isLoading || waypoints.length < 3}
                      className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Mission'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/missions')}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Mission Map */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Mission Area & Waypoints
              </h3>
              
              <div className="h-96 border rounded-lg">
                <WaypointMap
                  waypoints={waypoints}
                  polygon={polygon}
                  onWaypointsChange={setWaypoints}
                  onPolygonChange={setPolygon}
                  mode="edit"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>• Click on the map to add waypoints</p>
                <p>• Draw a polygon to define the mission area</p>
                <p>• Minimum 3 waypoints required</p>
                <p>• Waypoints: {waypoints.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}