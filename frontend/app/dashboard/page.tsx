'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'

interface DashboardStats {
  totalDrones: number
  activeMissions: number
  completedMissions: number
  totalReports: number
  totalFlightTime: number
  totalDistance: number
  averageSuccess: number
  dronesInFlight: number
  lowBatteryDrones: number
  maintenanceAlerts: number
}

interface RecentActivity {
  id: string
  type: 'mission' | 'drone' | 'report' | 'alert'
  message: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

interface FleetHealth {
  droneId: string
  droneName: string
  batteryLevel: number
  status: 'active' | 'idle' | 'maintenance' | 'low-battery'
  lastMission: string
  flightHours: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [fleetHealth, setFleetHealth] = useState<FleetHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [dronesRes, missionsRes, reportsRes] = await Promise.all([
        api.get('/drones'),
        api.get('/missions'),
        api.get('/reports')
      ])

      const drones = dronesRes.data
      const missions = missionsRes.data
      const reports = reportsRes.data

      // Calculate statistics
      const totalDrones = drones.length
      const activeMissions = missions.filter((m: any) => m.status === 'in-progress').length
      const completedMissions = missions.filter((m: any) => m.status === 'completed').length
      const totalReports = reports.length
      const totalFlightTime = reports.reduce((sum: number, r: any) => sum + r.duration, 0)
      const totalDistance = reports.reduce((sum: number, r: any) => sum + r.distanceFlown, 0)
      const successfulMissions = reports.filter((r: any) => r.status === 'success').length
      const averageSuccess = reports.length > 0 ? (successfulMissions / reports.length) * 100 : 0
      const dronesInFlight = drones.filter((d: any) => d.status === 'active').length
      const lowBatteryDrones = drones.filter((d: any) => d.batteryLevel < 20).length
      const maintenanceAlerts = drones.filter((d: any) => d.status === 'maintenance').length

      setStats({
        totalDrones,
        activeMissions,
        completedMissions,
        totalReports,
        totalFlightTime,
        totalDistance,
        averageSuccess,
        dronesInFlight,
        lowBatteryDrones,
        maintenanceAlerts
      })

      // Generate fleet health data
      const fleetData: FleetHealth[] = drones.map((drone: any) => ({
        droneId: drone._id,
        droneName: drone.name,
        batteryLevel: drone.batteryLevel,
        status: drone.batteryLevel < 20 ? 'low-battery' : drone.status,
        lastMission: drone.lastMissionDate ? new Date(drone.lastMissionDate).toLocaleDateString() : 'Never',
        flightHours: Math.floor(Math.random() * 100) // Mock data
      }))
      setFleetHealth(fleetData)

      // Generate recent activity
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'mission',
          message: 'Mission "Urban Survey" completed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'drone',
          message: 'Drone "Sky Guardian" battery low (15%)',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: 'warning'
        },
        {
          id: '3',
          type: 'report',
          message: 'New report generated for Agricultural Survey',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          status: 'info'
        },
        {
          id: '4',
          type: 'alert',
          message: 'Weather alert: High winds in sector 7',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          status: 'error'
        }
      ]
      setRecentActivity(activities)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mission':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'drone':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )
      case 'report':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level >= 60) return 'bg-green-500'
    if (level >= 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
          <p className="mt-2 text-gray-600">Real-time drone fleet monitoring and mission control dashboard</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fleet Size</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalDrones || 0}</p>
                <p className="text-sm text-green-600">{stats?.dronesInFlight || 0} in flight</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.averageSuccess.toFixed(1) || 0}%</p>
                <p className="text-sm text-gray-600">{stats?.completedMissions || 0} completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalDistance.toFixed(0) || 0} km</p>
                <p className="text-sm text-gray-600">{Math.floor((stats?.totalFlightTime || 0) / 60)}h flight time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{(stats?.lowBatteryDrones || 0) + (stats?.maintenanceAlerts || 0)}</p>
                <p className="text-sm text-red-600">{stats?.lowBatteryDrones || 0} low battery</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fleet Health Status */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Fleet Health Monitor</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {fleetHealth.map((drone) => (
                    <div key={drone.droneId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          drone.status === 'active' ? 'bg-green-500' :
                          drone.status === 'low-battery' ? 'bg-red-500' :
                          drone.status === 'maintenance' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{drone.droneName}</p>
                          <p className="text-sm text-gray-600">Last mission: {drone.lastMission}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{drone.batteryLevel}%</p>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${getBatteryColor(drone.batteryLevel)}`}
                              style={{ width: `${drone.batteryLevel}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{drone.flightHours}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/missions/new')}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Mission
              </button>
              <button 
                onClick={() => router.push('/drones/new')}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Drone
              </button>
              <button 
                onClick={() => router.push('/reports')}
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}