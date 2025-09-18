'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { 
  Plane, 
  Battery, 
  MapPin, 
  Plus, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Drone as DroneType, Mission, Report } from '@/types'

const fetcher = (url: string) => api.get(url).then(res => res.data)

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: drones, error: dronesError } = useSWR<DroneType[]>('/drones', fetcher)
  const { data: missions, error: missionsError } = useSWR<Mission[]>('/missions', fetcher)
  const { data: reports, error: reportsError } = useSWR<Report[]>('/reports', fetcher)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100'
      case 'in-mission': return 'text-blue-600 bg-blue-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      case 'offline': return 'text-red-600 bg-red-100'
      case 'planned': return 'text-gray-600 bg-gray-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'aborted': return 'text-red-600 bg-red-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600'
    if (level > 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const stats = [
    {
      name: 'Total Drones',
      value: drones?.length || 0,
      icon: Plane,
      color: 'text-blue-600'
    },
    {
      name: 'Active Missions',
      value: missions?.filter(m => m.status === 'in-progress').length || 0,
      icon: Activity,
      color: 'text-green-600'
    },
    {
      name: 'Completed Today',
      value: missions?.filter(m => 
        m.status === 'completed' && 
        new Date(m.endTime!).toDateString() === new Date().toDateString()
      ).length || 0,
      icon: CheckCircle,
      color: 'text-purple-600'
    },
    {
      name: 'Total Reports',
      value: reports?.length || 0,
      icon: Activity,
      color: 'text-indigo-600'
    }
  ]

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user?.username}! Here's what's happening with your drone fleet.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {item.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drones List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Drone Fleet
              </h3>
              {user?.role === 'admin' && (
                <Link
                  href="/drones/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Drone
                </Link>
              )}
            </div>
            
            <div className="space-y-3">
              {drones?.slice(0, 5).map((drone) => (
                <div key={drone._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Plane className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{drone.name}</p>
                      <p className="text-xs text-gray-500">{drone.droneModel}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Battery className={`w-4 h-4 ${getBatteryColor(drone.batteryLevel)}`} />
                      <span className="text-xs text-gray-600">{drone.batteryLevel}%</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(drone.status)}`}>
                      {drone.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {drones && drones.length > 5 && (
                <Link
                  href="/drones"
                  className="block text-center text-sm text-primary-600 hover:text-primary-500 pt-2"
                >
                  View all drones ({drones.length})
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Recent Missions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Missions
              </h3>
              <Link
                href="/missions/new"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Mission
              </Link>
            </div>
            
            <div className="space-y-3">
              {missions?.slice(0, 5).map((mission) => (
                <div key={mission._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mission.name}</p>
                      <p className="text-xs text-gray-500">
                        {typeof mission.droneId === 'object' ? mission.droneId.name : 'Unknown Drone'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {mission.status === 'in-progress' && (
                      <div className="text-xs text-gray-600">
                        {mission.progress}%
                      </div>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                      {mission.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {missions && missions.length > 5 && (
                <Link
                  href="/missions"
                  className="block text-center text-sm text-primary-600 hover:text-primary-500 pt-2"
                >
                  View all missions ({missions.length})
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}