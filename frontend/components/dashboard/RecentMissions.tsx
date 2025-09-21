'use client'

import { motion } from 'framer-motion'
import { 
  MapPinIcon, 
  ClockIcon, 
  Battery100Icon as BatteryIcon,
  SignalIcon 
} from '@heroicons/react/24/outline'

const recentMissions = [
  {
    id: 1,
    name: 'Solar Farm Inspection',
    drone: 'Phantom-001',
    status: 'active',
    progress: 65,
    timeRemaining: '12 min',
    battery: 78,
    signal: 95,
  },
  {
    id: 2,
    name: 'Wind Turbine Survey',
    drone: 'Mavic-003',
    status: 'active',
    progress: 32,
    timeRemaining: '28 min',
    battery: 91,
    signal: 87,
  },
  {
    id: 3,
    name: 'Construction Site Mapping',
    drone: 'Inspire-005',
    status: 'completed',
    progress: 100,
    timeRemaining: 'Completed',
    battery: 45,
    signal: 0,
  },
  {
    id: 4,
    name: 'Agricultural Analysis',
    drone: 'Matrice-002',
    status: 'planned',
    progress: 0,
    timeRemaining: 'Scheduled',
    battery: 100,
    signal: 0,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100'
    case 'completed':
      return 'text-blue-600 bg-blue-100'
    case 'planned':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export default function RecentMissions() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Recent Missions
        </h3>
        <p className="text-sm text-gray-600">
          Latest mission activity and status updates
        </p>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {recentMissions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">
                  {mission.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Drone: <span className="font-medium">{mission.drone}</span>
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(mission.status)}`}>
                {mission.status}
              </span>
            </div>

            {mission.status === 'active' && (
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{mission.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mission.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-drone-primary h-2 rounded-full"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{mission.timeRemaining}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <BatteryIcon className={`w-4 h-4 ${
                  mission.battery > 50 ? 'text-green-500' : 
                  mission.battery > 20 ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span className="text-gray-600">{mission.battery}%</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <SignalIcon className={`w-4 h-4 ${
                  mission.signal > 70 ? 'text-green-500' : 
                  mission.signal > 30 ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span className="text-gray-600">{mission.signal || 0}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-drone-primary hover:text-drone-secondary font-medium py-2 hover:bg-gray-50 rounded-lg transition-colors">
          View All Missions →
        </button>
      </div>
    </motion.div>
  )
}