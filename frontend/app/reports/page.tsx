'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import apiService from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Report {
  _id: string
  title: string
  type: 'mission' | 'drone' | 'pilot' | 'analytics'
  generatedBy: string
  createdAt: string
  data: any
  summary: string
  status: 'generating' | 'completed' | 'failed'
}

interface AnalyticsData {
  totalFlights: number
  totalFlightTime: number
  averageFlightTime: number
  successRate: number
  dronesActive: number
  pilotsActive: number
  topPilot: string
  topDrone: string
  recentMissions: any[]
  flightHours: { month: string; hours: number }[]
  missionTypes: { type: string; count: number }[]
  droneUtilization: { drone: string; hours: number }[]
}

export default function ReportsPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedReportType, setSelectedReportType] = useState('all')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'analytics' as 'mission' | 'drone' | 'pilot' | 'analytics',
    timeRange: '30d',
    includeImages: false,
    includeCharts: true
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, selectedTimeRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch reports and real analytics data
      const [reportsResponse, analyticsResponse] = await Promise.all([
        apiService.getReports(),
        apiService.getAnalytics(selectedTimeRange)
      ])
      
      setReports(reportsResponse.data.data || [])
      setAnalytics(analyticsResponse.data.data || null)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      
      // Fallback to mock data if API fails
      const mockAnalytics: AnalyticsData = {
        totalFlights: 156,
        totalFlightTime: 2840, // minutes
        averageFlightTime: 18.2,
        successRate: 94.5,
        dronesActive: 12,
        pilotsActive: 8,
        topPilot: 'John Smith',
        topDrone: 'DJI Mavic Pro',
        recentMissions: [],
        flightHours: [
          { month: 'Jan', hours: 45 },
          { month: 'Feb', hours: 52 },
          { month: 'Mar', hours: 48 },
          { month: 'Apr', hours: 61 },
          { month: 'May', hours: 55 },
          { month: 'Jun', hours: 58 }
        ],
        missionTypes: [
          { type: 'Survey', count: 45 },
          { type: 'Inspection', count: 32 },
          { type: 'Monitoring', count: 28 },
          { type: 'Emergency', count: 15 },
          { type: 'Commercial', count: 36 }
        ],
        droneUtilization: [
          { drone: 'DJI Mavic Pro', hours: 85 },
          { drone: 'DJI Phantom 4', hours: 72 },
          { drone: 'Autel EVO', hours: 58 },
          { drone: 'DJI Mini 2', hours: 41 },
          { drone: 'Skydio 2', hours: 35 }
        ]
      }
      
      setAnalytics(mockAnalytics)
      addToast({
        type: 'warning',
        title: 'Warning',
        message: 'Using demo data - API connection failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const reportData = {
        ...newReport,
        summary: `${newReport.type} report for ${newReport.timeRange}`,
        data: analytics
      }
      
      const response = await apiService.generateReport(reportData)
      setReports([response.data.data, ...reports])
      setShowGenerateModal(false)
      setNewReport({
        title: '',
        type: 'analytics',
        timeRange: '30d',
        includeImages: false,
        includeCharts: true
      })
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Report generated successfully'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to generate report'
      })
    }
  }

  const handleDownloadReport = (reportId: string) => {
    // Mock download functionality
    addToast({
      type: 'info',
      title: 'Download',
      message: 'Report download started'
    })
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const filteredReports = reports.filter(report => 
    selectedReportType === 'all' || report.type === selectedReportType
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics & Reports
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive fleet performance insights</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              📊 Generate Report
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Time Range</h2>
            <div className="flex space-x-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Flights</p>
                  <p className="text-3xl font-bold">{analytics.totalFlights}</p>
                </div>
                <div className="text-4xl opacity-80">✈️</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Success Rate</p>
                  <p className="text-3xl font-bold">{analytics.successRate}%</p>
                </div>
                <div className="text-4xl opacity-80">✅</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Flight Hours</p>
                  <p className="text-3xl font-bold">{Math.round(analytics.totalFlightTime / 60)}</p>
                </div>
                <div className="text-4xl opacity-80">⏱️</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Active Drones</p>
                  <p className="text-3xl font-bold">{analytics.dronesActive}</p>
                </div>
                <div className="text-4xl opacity-80">🚁</div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Charts Section */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Flight Hours Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Hours by Month</h3>
              <div className="space-y-4">
                {analytics.flightHours.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{item.month}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${(item.hours / Math.max(...analytics.flightHours.map(h => h.hours))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-900 font-medium">{item.hours}h</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Types Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mission Types Distribution</h3>
              <div className="space-y-3">
                {analytics.missionTypes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{
                          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
                        }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Drone Utilization */}
        {analytics && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Drone Utilization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analytics.droneUtilization.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🚁</div>
                  <div className="text-sm font-medium text-gray-900">{item.drone}</div>
                  <div className="text-lg font-bold text-blue-600">{item.hours}h</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Generated Reports</h2>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="mission">Mission Reports</option>
                <option value="drone">Drone Reports</option>
                <option value="pilot">Pilot Reports</option>
                <option value="analytics">Analytics Reports</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading reports...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>No reports found. Generate your first report!</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{report.summary}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {report.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadReport(report._id)}
                          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          disabled={report.status !== 'completed'}
                        >
                          📥 Download
                        </button>
                        <button className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                          👁️ View
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Generate New Report</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Report Title</label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter report title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Report Type</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({...newReport, type: e.target.value as any})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="analytics">Analytics Report</option>
                  <option value="mission">Mission Report</option>
                  <option value="drone">Drone Report</option>
                  <option value="pilot">Pilot Report</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Range</label>
                <select
                  value={newReport.timeRange}
                  onChange={(e) => setNewReport({...newReport, timeRange: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newReport.includeCharts}
                    onChange={(e) => setNewReport({...newReport, includeCharts: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include Charts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newReport.includeImages}
                    onChange={(e) => setNewReport({...newReport, includeImages: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include Images</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleGenerateReport}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📊 Generate Report
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}