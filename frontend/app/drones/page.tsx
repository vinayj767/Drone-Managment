'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Drone } from '@/types'

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchDrones()
  }, [router])

  const fetchDrones = async () => {
    try {
      const response = await api.get('/drones')
      setDrones(response.data)
    } catch (error) {
      console.error('Error fetching drones:', error)
      setError('Failed to load drones')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'in-mission':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600'
    if (level > 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drone Fleet</h1>
            <p className="mt-2 text-gray-600">Manage your drone fleet and monitor status</p>
          </div>
          <button
            onClick={() => router.push('/drones/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add New Drone
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drones.map((drone) => (
            <div key={drone._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{drone.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(drone.status)}`}>
                    {drone.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-medium">{drone.droneModel}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Serial Number</p>
                    <p className="font-medium font-mono text-sm">{drone.serialNumber}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Battery Level</p>
                      <p className={`font-bold ${getBatteryColor(drone.batteryLevel)}`}>
                        {drone.batteryLevel}%
                      </p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          drone.batteryLevel > 60 ? 'bg-green-500' :
                          drone.batteryLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${drone.batteryLevel}%` }}
                      ></div>
                    </div>
                  </div>

                  {drone.currentLocation && (
                    <div>
                      <p className="text-sm text-gray-600">Current Location</p>
                      <p className="text-sm font-mono">
                        {drone.currentLocation.latitude.toFixed(4)}, {drone.currentLocation.longitude.toFixed(4)}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Max Speed</p>
                      <p className="text-sm font-medium">{drone.maxSpeed} km/h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Flight Time</p>
                      <p className="text-sm font-medium">{drone.flightTime} min</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm font-medium">
                    View Details
                  </button>
                  {drone.status === 'available' && (
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium">
                      Assign Mission
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {drones.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drones found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first drone to the fleet.</p>
            <button
              onClick={() => router.push('/drones/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Add First Drone
            </button>
          </div>
        )}
      </div>
    </div>
  )
}