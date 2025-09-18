'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface Report {
  _id: string
  missionId: {
    _id: string
    name: string
    description: string
  }
  droneId: {
    _id: string
    name: string
    droneModel: string
  }
  userId: {
    _id: string
    username: string
  }
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
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'success' | 'partial' | 'failed'>('all')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchReports()
  }, [router])

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports')
      setReports(response.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  )

  const calculateStats = () => {
    const total = reports.length
    const successful = reports.filter(r => r.status === 'success').length
    const partial = reports.filter(r => r.status === 'partial').length
    const failed = reports.filter(r => r.status === 'failed').length
    const totalDistance = reports.reduce((sum, r) => sum + r.distanceFlown, 0)
    const totalArea = reports.reduce((sum, r) => sum + r.areaCovered, 0)
    const totalImages = reports.reduce((sum, r) => sum + r.imagesCapture, 0)
    
    return {
      total,
      successful,
      partial,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : '0',
      totalDistance: totalDistance.toFixed(1),
      totalArea: totalArea.toFixed(1),
      totalImages
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Mission Reports</h1>
          <p className="mt-2 text-gray-600">Comprehensive analytics and reports from completed missions</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalDistance} km</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Images Captured</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalImages.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          {(['all', 'success', 'partial', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border'
              }`}
            >
              {status === 'all' ? 'All Reports' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600">Reports will appear here after mission completion.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <div key={report._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.missionId?.name || 'Unknown Mission'}
                      </h3>
                      <p className="text-sm text-gray-600">{report.missionId?.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">{formatDuration(report.duration)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="font-medium">{report.distanceFlown.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Area Covered</p>
                      <p className="font-medium">{report.areaCovered.toFixed(1)} km²</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg Speed</p>
                      <p className="font-medium">{report.averageSpeed} km/h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Battery Used</p>
                      <p className="font-medium">{report.batteryUsed}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Images</p>
                      <p className="font-medium">{report.imagesCapture}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Drone: {report.droneId?.name || 'Unknown'}</span>
                      <span>Pilot: {report.userId?.username || 'Unknown'}</span>
                      <span>Generated: {formatDate(report.generatedAt)}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      View Details
                    </button>
                  </div>

                  {report.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Notes:</strong> {report.notes}
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