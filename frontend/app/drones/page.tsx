'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import apiService from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Drone {
  _id: string
  name: string
  droneModel: string
  manufacturer: string
  serialNumber: string
  type: 'quadcopter' | 'hexacopter' | 'octocopter' | 'fixed-wing'
  status: 'available' | 'in-mission' | 'maintenance' | 'offline' | 'charging'
  batteryLevel?: number
  maxFlightTime: number
  maxRange: number
  maxAltitude: number
  maxSpeed: number
  weight: number
  camera: {
    resolution: string
    hasGimbal: boolean
    hasZoom: boolean
    videoFormats: string[]
  }
  gps: {
    accuracy: number
    hasRTK: boolean
  }
  purchaseDate: string
  location?: string
  flightHours?: number
  healthStatus?: string
  hoursUntilMaintenance?: number
  currentLocation?: {
    latitude: number
    longitude: number
    altitude: number
  }
}

export default function AdvancedDronesPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [drones, setDrones] = useState<Drone[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null)
  const [viewingDrone, setViewingDrone] = useState<Drone | null>(null)
  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'map'>('grid')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLiveTracking, setIsLiveTracking] = useState(false)
  
  // Camera feed states
  const [showCameraFeed, setShowCameraFeed] = useState(false)
  const [selectedCameraDrone, setSelectedCameraDrone] = useState<Drone | null>(null)
  const [activeCameraFeeds, setActiveCameraFeeds] = useState<Set<string>>(new Set())
  const [cameraSettings, setCameraSettings] = useState({
    zoom: 1,
    brightness: 50,
    contrast: 50,
    quality: 'HD',
    recording: false
  })
  
  const [newDrone, setNewDrone] = useState({
    name: '',
    droneModel: '',
    manufacturer: '',
    serialNumber: '',
    type: 'quadcopter' as 'quadcopter' | 'hexacopter' | 'octocopter' | 'fixed-wing',
    status: 'available' as 'available' | 'in-mission' | 'maintenance' | 'offline' | 'charging',
    maxFlightTime: 30,
    maxRange: 1000,
    maxAltitude: 120,
    maxSpeed: 15,
    weight: 1500,
    camera: {
      resolution: '4K',
      hasGimbal: true,
      hasZoom: false,
      videoFormats: ['MP4', 'MOV']
    },
    gps: {
      accuracy: 1.5,
      hasRTK: false
    },
    purchaseDate: new Date().toISOString().split('T')[0],
    batteryLevel: 100,
    location: '',
    flightHours: 0
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    fetchDrones()
  }, [isAuthenticated])

  // Advanced tracking states
  const [flightPaths, setFlightPaths] = useState<{[key: string]: Array<{lat: number, lng: number, timestamp: Date, altitude: number}>}>({})
  const [weatherData, setWeatherData] = useState({
    temperature: 22,
    windSpeed: 8,
    humidity: 65,
    visibility: 10,
    conditions: 'Clear'
  })
  const [alertSystem, setAlertSystem] = useState<Array<{id: string, type: 'warning' | 'error' | 'info', message: string, droneId: string}>>([])

  // Simulate real-time updates with advanced features
  useEffect(() => {
    if (!isLiveTracking) return
    
    const interval = setInterval(() => {
      setDrones(prevDrones => 
        prevDrones.map(drone => {
          const newBatteryLevel = Math.max(0, (drone.batteryLevel || 100) - (Math.random() * 2 + 0.5))
          const isInMission = drone.status === 'in-mission'
          
          let newLocation = drone.currentLocation
          if (isInMission) {
            // Simulate GPS movement with more realistic patterns
            const baseLocation = { lat: 28.6139, lng: 77.2090 }
            const timeOffset = Date.now() / 10000 // Slower movement
            const radius = 0.005 // Movement radius
            
            newLocation = {
              latitude: baseLocation.lat + Math.sin(timeOffset + drone._id.length) * radius,
              longitude: baseLocation.lng + Math.cos(timeOffset + drone._id.length) * radius,
              altitude: 50 + Math.sin(timeOffset) * 30 + Math.random() * 10
            }
            
            // Update flight path
            if (newLocation && newLocation.latitude !== undefined && newLocation.longitude !== undefined) {
              setFlightPaths(prev => ({
                ...prev,
                [drone._id]: [
                  ...(prev[drone._id] || []).slice(-50), // Keep last 50 points
                  {
                    lat: newLocation.latitude,
                    lng: newLocation.longitude,
                    timestamp: new Date(),
                    altitude: newLocation.altitude
                  }
                ]
              }))
            }
          }
          
          // Generate alerts based on conditions
          if (newBatteryLevel < 20 && drone.status === 'in-mission') {
            setAlertSystem(prev => {
              const existingAlert = prev.find(alert => alert.droneId === drone._id && alert.type === 'warning')
              if (!existingAlert) {
                return [...prev, {
                  id: `${drone._id}-battery-${Date.now()}`,
                  type: 'warning',
                  message: `${drone.name}: Low battery (${newBatteryLevel.toFixed(1)}%) - Return to base recommended`,
                  droneId: drone._id
                }]
              }
              return prev
            })
          }
          
          if (newBatteryLevel < 10) {
            setAlertSystem(prev => {
              const existingAlert = prev.find(alert => alert.droneId === drone._id && alert.type === 'error')
              if (!existingAlert) {
                return [...prev, {
                  id: `${drone._id}-critical-${Date.now()}`,
                  type: 'error',
                  message: `${drone.name}: CRITICAL BATTERY (${newBatteryLevel.toFixed(1)}%) - Emergency landing required`,
                  droneId: drone._id
                }]
              }
              return prev
            })
          }

          return {
            ...drone,
            batteryLevel: newBatteryLevel,
            currentLocation: newLocation,
            healthStatus: newBatteryLevel > 50 ? 'excellent' : newBatteryLevel > 20 ? 'good' : 'critical',
            hoursUntilMaintenance: drone.hoursUntilMaintenance ? Math.max(0, drone.hoursUntilMaintenance - 0.01) : 50
          }
        })
      )
      
      // Update weather data occasionally
      if (Math.random() < 0.1) {
        setWeatherData(prev => ({
          temperature: prev.temperature + (Math.random() - 0.5) * 2,
          windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 3),
          humidity: Math.max(10, Math.min(100, prev.humidity + (Math.random() - 0.5) * 5)),
          visibility: Math.max(1, Math.min(20, prev.visibility + (Math.random() - 0.5) * 2)),
          conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Wind'][Math.floor(Math.random() * 4)]
        }))
      }
    }, 3000) // Update every 3 seconds for smoother tracking

    return () => clearInterval(interval)
  }, [isLiveTracking])

  const fetchDrones = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      const response = await apiService.getDrones()
      setDrones(response.data.data || [])
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load drones'
      })
      console.error('Error fetching drones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDrone = async () => {
    try {
      if (!newDrone.name || !newDrone.droneModel || !newDrone.manufacturer || !newDrone.serialNumber) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Please fill in all required fields'
        })
        return
      }

      await apiService.createDrone(newDrone)
      addToast({
        type: 'success',
        title: 'Success',
        message: '🚁 Advanced drone added successfully!'
      })
      setShowAddModal(false)
      resetNewDrone()
      fetchDrones()
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add drone'
      })
    }
  }

  const resetNewDrone = () => {
    setNewDrone({
      name: '',
      droneModel: '',
      manufacturer: '',
      serialNumber: '',
      type: 'quadcopter',
      status: 'available',
      maxFlightTime: 30,
      maxRange: 1000,
      maxAltitude: 120,
      maxSpeed: 15,
      weight: 1500,
      camera: {
        resolution: '4K',
        hasGimbal: true,
        hasZoom: false,
        videoFormats: ['MP4', 'MOV']
      },
      gps: {
        accuracy: 1.5,
        hasRTK: false
      },
      purchaseDate: new Date().toISOString().split('T')[0],
      batteryLevel: 100,
      location: '',
      flightHours: 0
    })
  }

  const handleEditDrone = async () => {
    try {
      if (!editingDrone) return

      await apiService.updateDrone(editingDrone._id, editingDrone)
      addToast({
        type: 'success',
        title: 'Success',
        message: '🔧 Drone updated successfully!'
      })
      setEditingDrone(null)
      fetchDrones()
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update drone'
      })
    }
  }

  const handleDeleteDrone = async (id: string) => {
    try {
      if (window.confirm('⚠️ Are you sure you want to delete this drone from the fleet?')) {
        await apiService.deleteDrone(id)
        addToast({
          type: 'success',
          title: 'Success',
          message: '🗑️ Drone removed from fleet'
        })
        fetchDrones()
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete drone'
      })
    }
  }

  const handleStartMission = (droneId: string) => {
    setDrones(prevDrones => 
      prevDrones.map(drone => 
        drone._id === droneId 
          ? { ...drone, status: 'in-mission' as const } 
          : drone
      )
    )
    addToast({
      type: 'success',
      title: 'Success',
      message: '🚀 Mission started! Drone is now airborne'
    })
  }

  const handleLandDrone = (droneId: string) => {
    setDrones(prevDrones => 
      prevDrones.map(drone => 
        drone._id === droneId 
          ? { ...drone, status: 'available' as const } 
          : drone
      )
    )
    addToast({
      type: 'success',
      title: 'Success',
      message: '🛬 Drone has landed safely'
    })
  }

  // Camera feed functions
  const handleOpenCameraFeed = (drone: Drone) => {
    setSelectedCameraDrone(drone)
    setShowCameraFeed(true)
    setActiveCameraFeeds(prev => new Set([...prev, drone._id]))
    addToast({
      type: 'success',
      title: 'Camera Feed',
      message: `📹 Connected to ${drone.name} camera feed`
    })
  }

  const handleCloseCameraFeed = () => {
    if (selectedCameraDrone) {
      setActiveCameraFeeds(prev => {
        const newSet = new Set(prev)
        newSet.delete(selectedCameraDrone._id)
        return newSet
      })
    }
    setShowCameraFeed(false)
    setSelectedCameraDrone(null)
    setCameraSettings({
      zoom: 1,
      brightness: 50,
      contrast: 50,
      quality: 'HD',
      recording: false
    })
  }

  const toggleRecording = () => {
    const isCurrentlyRecording = cameraSettings.recording
    setCameraSettings(prev => ({ ...prev, recording: !prev.recording }))
    addToast({
      type: isCurrentlyRecording ? 'info' : 'success',
      title: 'Recording',
      message: isCurrentlyRecording ? '⏹️ Recording stopped' : '🔴 Recording started'
    })
  }

  const filteredDrones = drones.filter(drone => {
    const matchesSearch = drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drone.droneModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drone.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || drone.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">🚁 Loading Advanced Drone Fleet...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-mission': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'charging': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'offline': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅'
      case 'in-mission': return '🚀'
      case 'maintenance': return '🔧'
      case 'charging': return '🔋'
      case 'offline': return '❌'
      default: return '❓'
    }
  }

  const getBatteryColor = (battery?: number) => {
    if (!battery) return 'text-gray-600'
    if (battery > 70) return 'text-green-600'
    if (battery > 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBatteryIcon = (battery?: number) => {
    if (!battery) return '🔋'
    if (battery > 80) return '🔋'
    if (battery > 60) return '🔋'
    if (battery > 40) return '🪫'
    if (battery > 20) return '🪫'
    return '🔴'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚁 Advanced Drone Command Center
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Next-generation intelligent fleet management system
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg"
            >
              ← Command Center
            </button>
            <button
              onClick={() => setIsLiveTracking(!isLiveTracking)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-lg ${
                isLiveTracking 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
              }`}
            >
              {isLiveTracking ? '🔴 Stop Live Tracking' : '🟢 Start Live Tracking'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center space-x-2"
            >
              <span>🚁</span>
              <span>Add Advanced Drone</span>
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search drones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🌟 All Status</option>
                <option value="available">✅ Available</option>
                <option value="in-mission">🚀 In Mission</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="charging">🔋 Charging</option>
                <option value="offline">❌ Offline</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedView('grid')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedView === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Grid View
              </button>
              <button
                onClick={() => setSelectedView('list')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedView === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setSelectedView('map')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedView === 'map' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🗺️ Map View
              </button>
            </div>
          </div>
        </motion.div>

        {/* Real-time Alerts System */}
        <AnimatePresence>
          {alertSystem.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                  🚨 Live Alert System
                </h3>
                <button
                  onClick={() => setAlertSystem([])}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {alertSystem.slice(-5).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      alert.type === 'error' ? 'bg-red-100 border border-red-200' :
                      alert.type === 'warning' ? 'bg-yellow-100 border border-yellow-200' :
                      'bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {alert.type === 'error' ? '🔴' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                      </span>
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                    <button
                      onClick={() => setAlertSystem(prev => prev.filter(a => a.id !== alert.id))}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Weather & Conditions Monitor */}
        {isLiveTracking && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
          >
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-2xl mb-1">🌡️</div>
              <div className="text-sm opacity-90">Temperature</div>
              <div className="text-xl font-bold">{weatherData.temperature.toFixed(1)}°C</div>
            </div>
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-2xl mb-1">💨</div>
              <div className="text-sm opacity-90">Wind Speed</div>
              <div className="text-xl font-bold">{weatherData.windSpeed.toFixed(1)} km/h</div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-2xl mb-1">💧</div>
              <div className="text-sm opacity-90">Humidity</div>
              <div className="text-xl font-bold">{weatherData.humidity.toFixed(0)}%</div>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-2xl mb-1">👁️</div>
              <div className="text-sm opacity-90">Visibility</div>
              <div className="text-xl font-bold">{weatherData.visibility.toFixed(1)} km</div>
            </div>
            <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-2xl mb-1">☀️</div>
              <div className="text-sm opacity-90">Conditions</div>
              <div className="text-lg font-semibold">{weatherData.conditions}</div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Stats Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Total Fleet</h3>
                <p className="text-3xl font-bold">{drones.length}</p>
                <p className="text-xs opacity-75 mt-1">Advanced Drones</p>
              </div>
              <div className="text-4xl opacity-80">🚁</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Available</h3>
                <p className="text-3xl font-bold">{drones.filter(d => d.status === 'available').length}</p>
                <p className="text-xs opacity-75 mt-1">Ready to Deploy</p>
              </div>
              <div className="text-4xl opacity-80">✅</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">In Mission</h3>
                <p className="text-3xl font-bold">{drones.filter(d => d.status === 'in-mission').length}</p>
                <p className="text-xs opacity-75 mt-1">Currently Flying</p>
              </div>
              <div className="text-4xl opacity-80">🚀</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Maintenance</h3>
                <p className="text-3xl font-bold">{drones.filter(d => d.status === 'maintenance').length}</p>
                <p className="text-xs opacity-75 mt-1">Under Service</p>
              </div>
              <div className="text-4xl opacity-80">🔧</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Fleet Health</h3>
                <p className="text-3xl font-bold">
                  {Math.round((drones.filter(d => d.status === 'available').length / Math.max(drones.length, 1)) * 100)}%
                </p>
                <p className="text-xs opacity-75 mt-1">Operational</p>
              </div>
              <div className="text-4xl opacity-80">❤️</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Avg Battery</h3>
                <p className="text-3xl font-bold">
                  {Math.round(drones.reduce((acc, drone) => acc + (drone.batteryLevel || 0), 0) / Math.max(drones.length, 1))}%
                </p>
                <p className="text-xs opacity-75 mt-1">Power Level</p>
              </div>
              <div className="text-4xl opacity-80">🔋</div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Drone Display */}
        <AnimatePresence mode="wait">
          {selectedView === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {loading ? (
                <div className="col-span-full p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">🚁 Loading fleet data...</p>
                </div>
              ) : (
                filteredDrones.map((drone, index) => (
                  <motion.div
                    key={drone._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            🚁
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{drone.name}</h3>
                            <p className="text-sm text-gray-500">{drone.droneModel}</p>
                            <p className="text-xs text-gray-400">{drone.manufacturer}</p>
                          </div>
                        </div>
                        {isLiveTracking && drone.status === 'in-mission' && (
                          <div className="relative">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Status:</span>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(drone.status)}`}>
                            <span className="mr-1">{getStatusIcon(drone.status)}</span>
                            {drone.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Battery:</span>
                          <div className={`flex items-center space-x-1 text-sm font-medium ${getBatteryColor(drone.batteryLevel)}`}>
                            <span>{getBatteryIcon(drone.batteryLevel)}</span>
                            <span>{drone.batteryLevel || 'N/A'}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>📹 {drone.camera?.resolution}</div>
                          <div>⚖️ {drone.weight}g</div>
                          <div>⏱️ {drone.maxFlightTime}min</div>
                          <div>📍 {drone.maxRange}m</div>
                        </div>

                        {drone.currentLocation && isLiveTracking && (
                          <div className="bg-blue-50 rounded-lg p-2 text-xs">
                            <div className="text-blue-800 font-medium">📍 Live Location:</div>
                            <div className="text-blue-600">
                              {drone.currentLocation?.latitude?.toFixed(4) || '0.0000'}, {drone.currentLocation?.longitude?.toFixed(4) || '0.0000'}
                            </div>
                            <div className="text-blue-600">
                              ⬆️ {drone.currentLocation?.altitude?.toFixed(1) || '0.0'}m
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => setViewingDrone(drone)}
                          className="px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>📊</span>
                          <span>Details</span>
                        </button>
                        
                        <button 
                          onClick={() => handleOpenCameraFeed(drone)}
                          className={`px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                            activeCameraFeeds.has(drone._id) 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                          }`}
                        >
                          <span>{activeCameraFeeds.has(drone._id) ? '🔴' : '📹'}</span>
                          <span>{activeCameraFeeds.has(drone._id) ? 'Live' : 'Camera'}</span>
                        </button>
                        
                        {drone.status === 'available' ? (
                          <button 
                            onClick={() => handleStartMission(drone._id)}
                            className="px-3 py-2 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                          >
                            <span>🚀</span>
                            <span>Launch</span>
                          </button>
                        ) : drone.status === 'in-mission' ? (
                          <button 
                            onClick={() => handleLandDrone(drone._id)}
                            className="px-3 py-2 text-xs bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors flex items-center justify-center space-x-1"
                          >
                            <span>🛬</span>
                            <span>Land</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => setEditingDrone(drone)}
                            className="px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1"
                          >
                            <span>✏️</span>
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {selectedView === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    🗺️ Interactive Flight Map
                  </h3>
                  <p className="text-gray-600">Real-time drone tracking and flight path visualization</p>
                </div>
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    🔴 Live Tracking: {filteredDrones.filter(d => d.status === 'in-mission').length} Active
                  </span>
                </div>
              </div>

              {/* Flight Control Center */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Drones Live Tracking */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 h-96 relative overflow-hidden">
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🛰️</div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">Live Satellite View</h4>
                      <p className="text-gray-600">Real-time GPS tracking with 1-meter precision</p>
                    </div>
                    
                    {/* Simulated Flight Paths */}
                    <div className="absolute inset-0 opacity-30">
                      {Object.entries(flightPaths).map(([droneId, path]) => (
                        <div key={droneId} className="absolute inset-0">
                          {path.map((point, index) => (
                            <div
                              key={index}
                              className="absolute w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                              style={{
                                left: `${20 + (index % 20) * 3}%`,
                                top: `${30 + Math.sin(index * 0.5) * 20}%`,
                                animationDelay: `${index * 0.1}s`
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Live Drone Markers */}
                    {filteredDrones.filter(d => d.status === 'in-mission').map((drone, index) => (
                      <div
                        key={drone._id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{
                          left: `${40 + index * 15}%`,
                          top: `${40 + Math.sin(Date.now() / 3000 + index) * 20}%`
                        }}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
                            🚁
                          </div>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {drone.name}
                          </div>
                          {/* Signal waves */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-12 h-12 border-2 border-blue-400 rounded-full animate-ping opacity-75"></div>
                            <div className="w-16 h-16 border-2 border-blue-300 rounded-full animate-ping opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '0.5s'}}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flight Data Panel */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      📡 Active Missions
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {filteredDrones.filter(d => d.status === 'in-mission').map(drone => (
                        <div key={drone._id} className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{drone.name}</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600">LIVE</span>
                            </div>
                          </div>
                          {drone.currentLocation && (
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>📍 {drone.currentLocation?.latitude?.toFixed(6) || '0.000000'}, {drone.currentLocation?.longitude?.toFixed(6) || '0.000000'}</div>
                              <div>⬆️ Alt: {drone.currentLocation?.altitude?.toFixed(1) || '0.0'}m</div>
                              <div className="flex items-center justify-between">
                                <span>🔋 {drone.batteryLevel?.toFixed(1)}%</span>
                                <span className="text-xs">
                                  Path: {flightPaths[drone._id]?.length || 0} points
                                </span>
                              </div>
                              {/* Mini flight path indicator */}
                              {flightPaths[drone._id] && flightPaths[drone._id].length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-500 mb-1">Recent Path:</div>
                                  <div className="flex space-x-1">
                                    {flightPaths[drone._id].slice(-10).map((_, index) => (
                                      <div
                                        key={index}
                                        className="w-1 h-1 bg-blue-400 rounded-full"
                                        style={{opacity: (index + 1) / 10}}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {filteredDrones.filter(d => d.status === 'in-mission').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-3xl mb-2">🛌</div>
                          <p className="text-sm">No active missions</p>
                          <p className="text-xs">Start a mission to see live tracking</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Mission Controls */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">🎮 Quick Controls</h4>
                    <div className="space-y-2">
                      {filteredDrones.filter(d => d.status === 'available').slice(0, 3).map(drone => (
                        <button
                          key={drone._id}
                          onClick={() => handleStartMission(drone._id)}
                          className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-blue-50 transition-colors"
                        >
                          🚀 Launch {drone.name}
                        </button>
                      ))}
                      {filteredDrones.filter(d => d.status === 'in-mission').map(drone => (
                        <button
                          key={drone._id}
                          onClick={() => handleLandDrone(drone._id)}
                          className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-red-50 transition-colors text-red-600"
                        >
                          🛬 Land {drone.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {filteredDrones.filter(d => d.status === 'in-mission').length === 0 && (
                <p className="text-gray-500 mt-4 text-center">No drones currently in mission</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Add/Edit Modal */}
        {(showAddModal || editingDrone) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <span>🚁</span>
                <span>{editingDrone ? 'Edit Advanced Drone' : 'Add New Advanced Drone'}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">📋 Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Drone Name *</label>
                    <input
                      type="text"
                      value={editingDrone ? editingDrone.name : newDrone.name}
                      onChange={(e) => editingDrone 
                        ? setEditingDrone({...editingDrone, name: e.target.value})
                        : setNewDrone({...newDrone, name: e.target.value})
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Sky Guardian Alpha"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model *</label>
                    <input
                      type="text"
                      value={editingDrone ? editingDrone.droneModel : newDrone.droneModel}
                      onChange={(e) => editingDrone 
                        ? setEditingDrone({...editingDrone, droneModel: e.target.value})
                        : setNewDrone({...newDrone, droneModel: e.target.value})
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., DJI Phantom 4 Pro"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manufacturer *</label>
                    <input
                      type="text"
                      value={editingDrone ? editingDrone.manufacturer : newDrone.manufacturer}
                      onChange={(e) => editingDrone 
                        ? setEditingDrone({...editingDrone, manufacturer: e.target.value})
                        : setNewDrone({...newDrone, manufacturer: e.target.value})
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., DJI, Autel, Skydio"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Serial Number *</label>
                    <input
                      type="text"
                      value={editingDrone ? editingDrone.serialNumber : newDrone.serialNumber}
                      onChange={(e) => editingDrone 
                        ? setEditingDrone({...editingDrone, serialNumber: e.target.value})
                        : setNewDrone({...newDrone, serialNumber: e.target.value})
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., DJI001234567"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">⚙️ Specifications</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      value={editingDrone ? editingDrone.type : newDrone.type}
                      onChange={(e) => editingDrone 
                        ? setEditingDrone({...editingDrone, type: e.target.value as any})
                        : setNewDrone({...newDrone, type: e.target.value as any})
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="quadcopter">🚁 Quadcopter</option>
                      <option value="hexacopter">🚁 Hexacopter</option>
                      <option value="octocopter">🚁 Octocopter</option>
                      <option value="fixed-wing">✈️ Fixed-Wing</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Flight Time (min)</label>
                      <input
                        type="number"
                        min="1"
                        value={editingDrone ? editingDrone.maxFlightTime : newDrone.maxFlightTime}
                        onChange={(e) => editingDrone 
                          ? setEditingDrone({...editingDrone, maxFlightTime: parseInt(e.target.value) || 0})
                          : setNewDrone({...newDrone, maxFlightTime: parseInt(e.target.value) || 0})
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Range (m)</label>
                      <input
                        type="number"
                        min="100"
                        value={editingDrone ? editingDrone.maxRange : newDrone.maxRange}
                        onChange={(e) => editingDrone 
                          ? setEditingDrone({...editingDrone, maxRange: parseInt(e.target.value) || 0})
                          : setNewDrone({...newDrone, maxRange: parseInt(e.target.value) || 0})
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight (g)</label>
                      <input
                        type="number"
                        min="100"
                        value={editingDrone ? editingDrone.weight : newDrone.weight}
                        onChange={(e) => editingDrone 
                          ? setEditingDrone({...editingDrone, weight: parseInt(e.target.value) || 0})
                          : setNewDrone({...newDrone, weight: parseInt(e.target.value) || 0})
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Camera</label>
                      <select
                        value={editingDrone ? editingDrone.camera.resolution : newDrone.camera.resolution}
                        onChange={(e) => editingDrone 
                          ? setEditingDrone({...editingDrone, camera: {...editingDrone.camera, resolution: e.target.value}})
                          : setNewDrone({...newDrone, camera: {...newDrone.camera, resolution: e.target.value}})
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1080p">📹 1080p HD</option>
                        <option value="4K">📹 4K Ultra HD</option>
                        <option value="6K">📹 6K Cinema</option>
                        <option value="8K">📹 8K Professional</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={editingDrone ? handleEditDrone : handleAddDrone}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                >
                  <span>🚁</span>
                  <span>{editingDrone ? 'Update Drone' : 'Add to Fleet'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingDrone(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Enhanced View Drone Modal */}
        {viewingDrone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <span>🚁</span>
                <span>Advanced Drone Analysis: {viewingDrone.name}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">📋 Drone Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <strong>Name:</strong> <span>{viewingDrone.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Model:</strong> <span>{viewingDrone.droneModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Manufacturer:</strong> <span>{viewingDrone.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Type:</strong> <span>{viewingDrone.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Status:</strong> 
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingDrone.status)}`}>
                        {getStatusIcon(viewingDrone.status)} {viewingDrone.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">📊 Performance Metrics</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <strong>Battery Level:</strong> 
                      <span className={`${getBatteryColor(viewingDrone.batteryLevel)}`}>
                        {getBatteryIcon(viewingDrone.batteryLevel)} {viewingDrone.batteryLevel}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Max Flight Time:</strong> <span>⏱️ {viewingDrone.maxFlightTime} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Max Range:</strong> <span>📍 {viewingDrone.maxRange} meters</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Max Speed:</strong> <span>🚀 {viewingDrone.maxSpeed} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Weight:</strong> <span>⚖️ {viewingDrone.weight} grams</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">📷 Camera System</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <strong>Resolution:</strong> <span>📹 {viewingDrone.camera?.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Gimbal:</strong> <span>{viewingDrone.camera?.hasGimbal ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Zoom:</strong> <span>{viewingDrone.camera?.hasZoom ? '✅ Yes' : '❌ No'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">📡 GPS & Navigation</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <strong>GPS Accuracy:</strong> <span>📡 ±{viewingDrone.gps?.accuracy}m</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>RTK Precision:</strong> <span>{viewingDrone.gps?.hasRTK ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    {viewingDrone.currentLocation && (
                      <>
                        <div className="flex justify-between">
                          <strong>Current Location:</strong> 
                          <span className="text-blue-600">
                            📍 {viewingDrone.currentLocation?.latitude?.toFixed(4) || '0.0000'}, {viewingDrone.currentLocation?.longitude?.toFixed(4) || '0.0000'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <strong>Altitude:</strong> <span>⬆️ {viewingDrone.currentLocation?.altitude?.toFixed(1) || '0.0'}m</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setViewingDrone(null)}
                  className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Live Camera Feed Modal */}
        {showCameraFeed && selectedCameraDrone && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-xl w-full max-w-6xl mx-4 h-[90vh] flex flex-col"
            >
              {/* Camera Feed Header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold">LIVE</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    📹 {selectedCameraDrone.name} - Camera Feed
                  </h2>
                  <span className="text-gray-300 text-sm">
                    {selectedCameraDrone.camera.resolution} • {cameraSettings.quality}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">
                    Signal: Strong • Latency: 45ms
                  </span>
                  <button
                    onClick={handleCloseCameraFeed}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Main Camera View */}
              <div className="flex-1 flex bg-black">
                {/* Video Feed Area */}
                <div className="flex-1 relative overflow-hidden">
                  {/* Simulated Video Feed */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center relative">
                    {/* Crosshair overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-green-500 opacity-70">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-green-500"></div>
                        <div className="absolute left-1/2 top-0 w-px h-full bg-green-500"></div>
                      </div>
                    </div>
                    
                    {/* Simulated aerial view */}
                    <div className="text-center text-white p-8">
                      <div className="text-6xl mb-4">🌍</div>
                      <p className="text-2xl font-bold mb-2">Live Aerial Feed</p>
                      <p className="text-lg opacity-80">
                        Altitude: {selectedCameraDrone.currentLocation?.altitude?.toFixed(1) || '50.0'}m
                      </p>
                      <p className="text-sm opacity-60 mt-2">
                        Simulated 4K video stream from {selectedCameraDrone.name}
                      </p>
                    </div>

                    {/* HUD Overlay */}
                    <div className="absolute top-4 left-4 text-green-400 text-sm font-mono">
                      <div>📍 LAT: {selectedCameraDrone.currentLocation?.latitude?.toFixed(6) || '28.613900'}</div>
                      <div>📍 LON: {selectedCameraDrone.currentLocation?.longitude?.toFixed(6) || '77.209000'}</div>
                      <div>⬆️ ALT: {selectedCameraDrone.currentLocation?.altitude?.toFixed(1) || '50.0'}m</div>
                      <div>🔋 BAT: {selectedCameraDrone.batteryLevel?.toFixed(1) || '85.0'}%</div>
                    </div>

                    <div className="absolute top-4 right-4 text-green-400 text-sm font-mono text-right">
                      <div>🔍 ZOOM: {cameraSettings.zoom.toFixed(1)}x</div>
                      <div>💡 BRIGHT: {cameraSettings.brightness}%</div>
                      <div>🎨 CONTRAST: {cameraSettings.contrast}%</div>
                      <div className={`${cameraSettings.recording ? 'text-red-400 animate-pulse' : ''}`}>
                        {cameraSettings.recording ? '🔴 REC' : '⏸️ STANDBY'}
                      </div>
                    </div>

                    {/* Gimbal movement simulation */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg text-white text-sm">
                        📷 Gimbal: Stabilized • Focus: Auto • WB: Daylight
                      </div>
                    </div>
                  </div>
                </div>

                {/* Camera Controls Panel */}
                <div className="w-80 bg-gray-800 p-4 space-y-4 overflow-y-auto">
                  <h3 className="text-white font-semibold mb-4">📹 Camera Controls</h3>
                  
                  {/* Recording Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Recording</span>
                      <button
                        onClick={toggleRecording}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          cameraSettings.recording
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        {cameraSettings.recording ? '⏹️ Stop' : '🔴 Record'}
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Quality</label>
                      <select
                        value={cameraSettings.quality}
                        onChange={(e) => setCameraSettings(prev => ({ ...prev, quality: e.target.value }))}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      >
                        <option value="4K">4K (3840x2160)</option>
                        <option value="HD">HD (1920x1080)</option>
                        <option value="SD">SD (1280x720)</option>
                      </select>
                    </div>
                  </div>

                  {/* Camera Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        🔍 Zoom: {cameraSettings.zoom.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={cameraSettings.zoom}
                        onChange={(e) => setCameraSettings(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        💡 Brightness: {cameraSettings.brightness}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cameraSettings.brightness}
                        onChange={(e) => setCameraSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        🎨 Contrast: {cameraSettings.contrast}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cameraSettings.contrast}
                        onChange={(e) => setCameraSettings(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h4 className="text-gray-300 text-sm font-medium">Quick Actions</h4>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      📸 Take Photo
                    </button>
                    <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                      🎯 Auto Focus
                    </button>
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                      🔄 Reset Gimbal
                    </button>
                    <button className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors">
                      📡 Switch Camera
                    </button>
                  </div>

                  {/* Drone Status */}
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-white text-sm font-medium mb-2">Drone Status</h4>
                    <div className="space-y-1 text-xs text-gray-300">
                      <div>🔋 Battery: {selectedCameraDrone.batteryLevel?.toFixed(1)}%</div>
                      <div>📡 Signal: Strong (95%)</div>
                      <div>🌡️ Temp: 24°C</div>
                      <div>💨 Wind: 8 km/h</div>
                      <div>⏱️ Flight Time: 12:34</div>
                    </div>
                  </div>

                  {/* Multi-Camera View Toggle */}
                  <div className="space-y-2">
                    <h4 className="text-gray-300 text-sm font-medium">Other Camera Feeds</h4>
                    {drones.filter(d => d._id !== selectedCameraDrone._id && activeCameraFeeds.has(d._id)).map(drone => (
                      <button
                        key={drone._id}
                        onClick={() => setSelectedCameraDrone(drone)}
                        className="w-full text-left bg-gray-700 p-2 rounded text-sm text-white hover:bg-gray-600 transition-colors"
                      >
                        📹 {drone.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}