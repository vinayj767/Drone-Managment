'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'

export default function NewDronePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    droneModel: '',
    serialNumber: '',
    maxSpeed: '',
    maxAltitude: '',
    flightTime: '',
    currentLocation: {
      latitude: '',
      longitude: ''
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const droneData = {
        ...formData,
        maxSpeed: parseInt(formData.maxSpeed),
        maxAltitude: parseInt(formData.maxAltitude),
        flightTime: parseInt(formData.flightTime),
        currentLocation: {
          latitude: parseFloat(formData.currentLocation.latitude),
          longitude: parseFloat(formData.currentLocation.longitude)
        },
        status: 'available',
        batteryLevel: 100
      }

      await api.post('/drones', droneData)
      router.push('/drones')
    } catch (error) {
      console.error('Error creating drone:', error)
      alert('Failed to create drone')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Drone</h1>
          <p className="mt-2 text-gray-600">Register a new drone to your fleet</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drone Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., SkyMaster Pro X1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drone Model *
                </label>
                <select
                  name="droneModel"
                  value={formData.droneModel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a model</option>
                  <option value="DJI Phantom 4 RTK">DJI Phantom 4 RTK</option>
                  <option value="DJI Matrice 600 Pro">DJI Matrice 600 Pro</option>
                  <option value="Parrot ANAFI USA">Parrot ANAFI USA</option>
                  <option value="Skydio 2+">Skydio 2+</option>
                  <option value="Yuneec H520E">Yuneec H520E</option>
                  <option value="Autel EVO II Pro">Autel EVO II Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number *
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., DJI-P4RTK-007"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Speed (km/h) *
                </label>
                <input
                  type="number"
                  name="maxSpeed"
                  value={formData.maxSpeed}
                  onChange={handleChange}
                  required
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 72"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Altitude (m) *
                </label>
                <input
                  type="number"
                  name="maxAltitude"
                  value={formData.maxAltitude}
                  onChange={handleChange}
                  required
                  min="1"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 6000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flight Time (minutes) *
                </label>
                <input
                  type="number"
                  name="flightTime"
                  value={formData.flightTime}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    name="currentLocation.latitude"
                    value={formData.currentLocation.latitude}
                    onChange={handleChange}
                    required
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 40.7589"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    name="currentLocation.longitude"
                    value={formData.currentLocation.longitude}
                    onChange={handleChange}
                    required
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., -73.9851"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/drones')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Drone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}