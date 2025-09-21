'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

// Mock drone locations
const droneLocations = [
  { id: 1, name: 'Phantom-001', lat: 40.7128, lng: -74.0060, status: 'active', mission: 'Solar Farm Inspection' },
  { id: 2, name: 'Mavic-003', lat: 40.7589, lng: -73.9851, status: 'active', mission: 'Wind Turbine Survey' },
  { id: 3, name: 'Inspire-005', lat: 40.7831, lng: -73.9712, status: 'maintenance', mission: 'Construction Site Mapping' },
  { id: 4, name: 'Matrice-002', lat: 40.7505, lng: -73.9934, status: 'inactive', mission: 'Agricultural Analysis' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'inactive':
      return 'bg-gray-500'
    case 'maintenance':
      return 'bg-yellow-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export default function FleetMap() {
  const [selectedDrone, setSelectedDrone] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Fleet Map
        </h3>
        <p className="text-sm text-gray-600">
          Real-time locations of your drone fleet
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-64 mb-4 overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div 
                key={i} 
                className={`border border-gray-300 ${
                  Math.random() > 0.7 ? 'bg-green-100' : 
                  Math.random() > 0.8 ? 'bg-blue-100' : ''
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Drone Markers */}
        {droneLocations.map((drone, index) => (
          <motion.div
            key={drone.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getStatusColor(drone.status)}`}
            style={{
              left: `${20 + (index * 20)}%`,
              top: `${30 + (index * 15)}%`,
            }}
            onClick={() => setSelectedDrone(selectedDrone === drone.id ? null : drone.id)}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
          >
            {drone.status === 'active' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}

        {/* Selected Drone Info */}
        {selectedDrone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 min-w-48"
          >
            {(() => {
              const drone = droneLocations.find(d => d.id === selectedDrone)
              return drone ? (
                <div>
                  <h4 className="font-medium text-gray-800">{drone.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{drone.mission}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize text-white ${getStatusColor(drone.status)}`}>
                    {drone.status}
                  </span>
                </div>
              ) : null
            })()}
          </motion.div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <button className="block w-8 h-8 bg-white rounded shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-gray-600">
            +
          </button>
          <button className="block w-8 h-8 bg-white rounded shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-gray-600">
            -
          </button>
        </div>
      </div>

      {/* Drone List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Active Drones</h4>
        {droneLocations.map((drone, index) => (
          <motion.div
            key={drone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
              selectedDrone === drone.id ? 'bg-drone-light border border-drone-primary' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedDrone(selectedDrone === drone.id ? null : drone.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(drone.status)}`} />
              <div>
                <p className="text-sm font-medium text-gray-800">{drone.name}</p>
                <p className="text-xs text-gray-500">{drone.mission}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              drone.status === 'active' ? 'text-green-700 bg-green-100' :
              drone.status === 'maintenance' ? 'text-yellow-700 bg-yellow-100' :
              'text-gray-700 bg-gray-100'
            }`}>
              {drone.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}