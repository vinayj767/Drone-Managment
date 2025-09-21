'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import apiService from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Mission {
  _id: string
  title: string
  description: string
  type: 'survey' | 'inspection' | 'monitoring' | 'emergency' | 'commercial'
  status: 'planned' | 'in-progress' | 'paused' | 'completed' | 'aborted' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedDrone: string
  assignedPilot: string
  scheduledStart: string
  scheduledEnd: string
  altitude: number
  speed: number
  surveyArea: {
    type: 'polygon' | 'circle' | 'rectangle'
    coordinates: Array<{
      latitude: number
      longitude: number
    }>
  }
  estimatedDuration?: number
}

export default function MissionsPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [missions, setMissions] = useState<Mission[]>([])
  const [drones, setDrones] = useState<any[]>([])
  const [pilots, setPilots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMission, setEditingMission] = useState<Mission | null>(null)
  const [viewingMission, setViewingMission] = useState<Mission | null>(null)
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    type: 'survey' as 'survey' | 'inspection' | 'monitoring' | 'emergency' | 'commercial',
    status: 'planned' as 'planned' | 'in-progress' | 'paused' | 'completed' | 'aborted' | 'failed',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    assignedDrone: '',
    assignedPilot: '',
    scheduledStart: '',
    scheduledEnd: '',
    altitude: 50,
    speed: 5,
    surveyArea: {
      type: 'rectangle' as 'polygon' | 'circle' | 'rectangle',
      coordinates: [
        { latitude: 40.7128, longitude: -74.0060 }, // Default NYC coordinates
        { latitude: 40.7138, longitude: -74.0050 },
        { latitude: 40.7118, longitude: -74.0050 },
        { latitude: 40.7118, longitude: -74.0060 }
      ]
    }
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      const [missionsRes, dronesRes, usersRes] = await Promise.all([
        apiService.getMissions(),
        apiService.getDrones(),
        apiService.getUsers()
      ])
      
      setMissions(missionsRes.data.data || [])
      setDrones(dronesRes.data.data || [])
      setPilots(usersRes.data.data?.filter((u: any) => u.role === 'pilot') || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMission = async () => {
    try {
      const response = await apiService.createMission(newMission)
      setMissions([...missions, response.data.data])
      setShowAddModal(false)
      setNewMission({
        title: '',
        description: '',
        type: 'survey',
        status: 'planned',
        priority: 'medium',
        assignedDrone: '',
        assignedPilot: '',
        scheduledStart: '',
        scheduledEnd: '',
        altitude: 50,
        speed: 5,
        surveyArea: {
          type: 'rectangle',
          coordinates: [
            { latitude: 40.7128, longitude: -74.0060 },
            { latitude: 40.7138, longitude: -74.0050 },
            { latitude: 40.7118, longitude: -74.0050 },
            { latitude: 40.7118, longitude: -74.0060 }
          ]
        }
      })
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Mission created successfully'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create mission'
      })
    }
  }

  const handleEditMission = async () => {
    if (!editingMission) return
    
    try {
      const response = await apiService.updateMission(editingMission._id, editingMission)
      setMissions(missions.map(m => m._id === editingMission._id ? response.data.data : m))
      setEditingMission(null)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Mission updated successfully'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update mission'
      })
    }
  }

  const handleDeleteMission = async (missionId: string) => {
    if (!window.confirm('Are you sure you want to delete this mission?')) return
    
    try {
      await apiService.deleteMission(missionId)
      setMissions(missions.filter(m => m._id !== missionId))
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Mission deleted successfully'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete mission'
      })
    }
  }

  const handleStartMission = async (missionId: string) => {
    try {
      await apiService.startMission(missionId)
      setMissions(missions.map(m => 
        m._id === missionId ? { ...m, status: 'in-progress' as const } : m
      ))
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Mission started successfully'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to start mission'
      })
    }
  }

  const handlePauseMission = async (missionId: string) => {
    try {
      await apiService.pauseMission(missionId)
      setMissions(missions.map(m => 
        m._id === missionId ? { ...m, status: 'paused' as const } : m
      ))
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Mission paused successfully'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to pause mission'
      })
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-green-100 text-green-800'
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'aborted': return 'bg-red-100 text-red-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mission Control</h1>
            <p className="text-gray-600 mt-2">Plan, monitor, and manage drone missions</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Schedule Mission
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Missions</h3>
            <p className="text-2xl font-bold text-gray-900">{missions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active</h3>
            <p className="text-2xl font-bold text-green-600">
              {missions.filter(m => m.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Planned</h3>
            <p className="text-2xl font-bold text-blue-600">
              {missions.filter(m => m.status === 'planned').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
            <p className="text-2xl font-bold text-gray-600">
              {missions.filter(m => m.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Missions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mission Schedule</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading missions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pilot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {missions.map((mission) => (
                    <motion.tr
                      key={mission._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{mission.title}</div>
                          <div className="text-sm text-gray-500">
                            {mission.surveyArea ? 
                              `${mission.surveyArea.coordinates[0]?.latitude.toFixed(4)}, ${mission.surveyArea.coordinates[0]?.longitude.toFixed(4)}` : 
                              'No coordinates'
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mission.status)}`}>
                          {mission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(mission.priority)}`}>
                          {mission.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof mission.assignedDrone === 'string' ? mission.assignedDrone : 
                         mission.assignedDrone?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof mission.assignedPilot === 'string' ? mission.assignedPilot : 
                         mission.assignedPilot?.name || mission.assignedPilot?.email || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mission.scheduledStart ? new Date(mission.scheduledStart).toLocaleDateString() : 'Not scheduled'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => setViewingMission(mission)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {mission.status === 'planned' && (
                          <button 
                            onClick={() => handleStartMission(mission._id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Start
                          </button>
                        )}
                        {mission.status === 'in-progress' && (
                          <button 
                            onClick={() => handlePauseMission(mission._id)}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            Pause
                          </button>
                        )}
                        <button 
                          onClick={() => setEditingMission(mission)}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteMission(mission._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Mission Modal */}
      {(showAddModal || editingMission) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {editingMission ? 'Edit Mission' : 'Add New Mission'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mission Title</label>
                <input
                  type="text"
                  value={editingMission ? editingMission.title : newMission.title}
                  onChange={(e) => editingMission 
                    ? setEditingMission({...editingMission, title: e.target.value})
                    : setNewMission({...newMission, title: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingMission ? editingMission.description : newMission.description}
                  onChange={(e) => editingMission 
                    ? setEditingMission({...editingMission, description: e.target.value})
                    : setNewMission({...newMission, description: e.target.value})
                  }
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Mission Type</label>
                <select
                  value={editingMission ? editingMission.type : newMission.type}
                  onChange={(e) => editingMission 
                    ? setEditingMission({...editingMission, type: e.target.value as Mission['type']})
                    : setNewMission({...newMission, type: e.target.value as Mission['type']})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="survey">Survey</option>
                  <option value="inspection">Inspection</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="emergency">Emergency</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={editingMission ? editingMission.priority : newMission.priority}
                  onChange={(e) => editingMission 
                    ? setEditingMission({...editingMission, priority: e.target.value as 'low' | 'medium' | 'high'})
                    : setNewMission({...newMission, priority: e.target.value as 'low' | 'medium' | 'high'})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Drone</label>
                <input
                  type="text"
                  value={editingMission ? editingMission.assignedDrone || '' : newMission.assignedDrone}
                  onChange={(e) => editingMission 
                    ? setEditingMission({...editingMission, assignedDrone: e.target.value})
                    : setNewMission({...newMission, assignedDrone: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Pilot</label>
                <input
                  type="text"
                  value={editingMission ? editingMission.assignedPilot || '' : newMission.assignedPilot}
                  onChange={(e) => editingMission 
                    ? setEditingMission({...editingMission, assignedPilot: e.target.value})
                    : setNewMission({...newMission, assignedPilot: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Scheduled Start</label>
                <input
                  type="datetime-local"
                  value={editingMission 
                    ? editingMission.scheduledStart ? new Date(editingMission.scheduledStart).toISOString().slice(0, 16) : ''
                    : newMission.scheduledStart
                  }
                  onChange={(e) => editingMission 
                    ? setEditingMission({...editingMission, scheduledStart: e.target.value})
                    : setNewMission({...newMission, scheduledStart: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Scheduled End</label>
                <input
                  type="datetime-local"
                  value={editingMission 
                    ? editingMission.scheduledEnd ? new Date(editingMission.scheduledEnd).toISOString().slice(0, 16) : ''
                    : newMission.scheduledEnd
                  }
                  onChange={(e) => editingMission 
                    ? setEditingMission({...editingMission, scheduledEnd: e.target.value})
                    : setNewMission({...newMission, scheduledEnd: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingMission ? handleEditMission : handleAddMission}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingMission ? 'Update' : 'Add'} Mission
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingMission(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Mission Modal */}
      {viewingMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Mission Details</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="text-sm text-gray-900">{viewingMission.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{viewingMission.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Survey Area</label>
                <p className="text-sm text-gray-900">
                  {viewingMission.surveyArea ? 
                    `${viewingMission.surveyArea.coordinates[0]?.latitude.toFixed(4)}, ${viewingMission.surveyArea.coordinates[0]?.longitude.toFixed(4)}` : 
                    'Not specified'
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingMission.status)}`}>
                  {viewingMission.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(viewingMission.priority)}`}>
                  {viewingMission.priority}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Drone</label>
                <p className="text-sm text-gray-900">
                  {typeof viewingMission.assignedDrone === 'string' ? viewingMission.assignedDrone : 
                   viewingMission.assignedDrone?.name || 'Unassigned'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Pilot</label>
                <p className="text-sm text-gray-900">
                  {typeof viewingMission.assignedPilot === 'string' ? viewingMission.assignedPilot : 
                   viewingMission.assignedPilot?.name || viewingMission.assignedPilot?.email || 'Unassigned'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Scheduled Start</label>
                <p className="text-sm text-gray-900">
                  {viewingMission.scheduledStart 
                    ? new Date(viewingMission.scheduledStart).toLocaleString() 
                    : 'Not scheduled'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingMission(null)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}