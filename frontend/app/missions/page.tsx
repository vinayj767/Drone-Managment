'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'

interface Mission {
  _id: string
  name: string
  description: string
  droneId: {
    _id: string
    name: string
    droneModel: string
  }
  userId: {
    _id: string
    username: string
  }
  missionType: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'planned' | 'in-progress' | 'completed' | 'aborted' | 'paused'
  progress: number
  startTime: string
  endTime?: string
  estimatedDuration: number
  location: {
    latitude: number
    longitude: number
    address: string
  }
  altitude: number
  speed: number
  createdAt: string
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'planned' | 'in-progress' | 'completed' | 'aborted'>('all')
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchMissions()
  }, [router])

  const handleViewDetails = (missionId: string) => {
    router.push(`/missions/${missionId}`)
  }

  const handleStartMission = async (missionId: string) => {
    try {
      await api.patch(`/missions/${missionId}`, { status: 'in-progress' })
      fetchMissions() // Refresh the list
    } catch (error) {
      console.error('Error starting mission:', error)
    }
  }

  const handleMonitorLive = (missionId: string) => {
    router.push(`/missions/${missionId}/monitor`)
  }

  const fetchMissions = async () => {
    try {
      const response = await api.get('/missions')
      setMissions(response.data)
    } catch (error) {
      console.error('Error fetching missions:', error)
      setError('Failed to load missions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'aborted':
        return 'bg-red-100 text-red-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMissions = missions.filter(mission => 
    filter === 'all' || mission.status === filter
  )

  const calculateStats = () => {
    const total = missions.length
    const planned = missions.filter(m => m.status === 'planned').length
    const inProgress = missions.filter(m => m.status === 'in-progress').length
    const completed = missions.filter(m => m.status === 'completed').length
    const aborted = missions.filter(m => m.status === 'aborted').length
    
    return { total, planned, inProgress, completed, aborted }
  }

  const stats = calculateStats()

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
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mission Control</h1>
              <p className="mt-2 text-gray-600">Plan, monitor, and manage drone missions</p>
            </div>
            {(user?.role === 'admin' || user?.role === 'operator') && (
              <button
                onClick={() => router.push('/missions/new')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Plan New Mission
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.planned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
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
                <p className="text-sm font-medium text-gray-600">Aborted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aborted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          {(['all', 'planned', 'in-progress', 'completed', 'aborted'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border'
              }`}
            >
              {status === 'all' ? 'All Missions' : 
               status === 'in-progress' ? 'In Progress' : 
               status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Missions List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {filteredMissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No missions found</h3>
              <p className="text-gray-600 mb-4">Get started by planning your first drone mission.</p>
              <button
                onClick={() => router.push('/missions/new')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Plan New Mission
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMissions.map((mission) => (
                <div key={mission._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{mission.name}</h3>
                        <p className="text-sm text-gray-600">{mission.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(mission.priority)}`}>
                        {mission.priority} priority
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mission.status)}`}>
                        {mission.status}
                      </span>
                      {mission.status === 'in-progress' && (
                        <div className="text-sm text-gray-600">
                          {mission.progress}% complete
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Drone</p>
                      <p className="font-medium">{mission.droneId?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-medium">{mission.missionType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">{formatDuration(mission.estimatedDuration)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Altitude</p>
                      <p className="font-medium">{mission.altitude}m</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Speed</p>
                      <p className="font-medium">{mission.speed} km/h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium">{mission.location?.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Pilot: {mission.userId?.username || 'Unknown'}</span>
                      <span>Created: {formatDate(mission.createdAt)}</span>
                      {mission.startTime && (
                        <span>Started: {formatDate(mission.startTime)}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDetails(mission._id)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Details
                      </button>
                      {mission.status === 'planned' && (user?.role === 'admin' || user?.role === 'operator' || user?.role === 'pilot') && (
                        <button 
                          onClick={() => handleStartMission(mission._id)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Start Mission
                        </button>
                      )}
                      {mission.status === 'in-progress' && (user?.role === 'admin' || user?.role === 'operator' || user?.role === 'pilot') && (
                        <button 
                          onClick={() => handleMonitorLive(mission._id)}
                          className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                        >
                          Monitor Live
                        </button>
                      )}
                    </div>
                  </div>

                  {mission.status === 'in-progress' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${mission.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}