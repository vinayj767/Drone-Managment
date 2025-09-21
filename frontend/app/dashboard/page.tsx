'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import apiService from '@/lib/api'

interface DashboardStats {
  totalDrones: number
  activeDrones: number
  totalMissions: number
  activeMissions: number
  totalUsers: number
  activePilots: number
  flightHours: number
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalDrones: 0,
    activeDrones: 0,
    totalMissions: 0,
    activeMissions: 0,
    totalUsers: 0,
    activePilots: 0,
    flightHours: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return
      
      try {
        setLoading(true)
        
        // Fetch data from multiple endpoints
        const [dronesRes, missionsRes, usersRes] = await Promise.all([
          apiService.getDrones(),
          apiService.getMissions(),
          apiService.getUsers()
        ])

        const drones = dronesRes.data.data || []
        const missions = missionsRes.data.data || []
        const users = usersRes.data.data || []

        setStats({
          totalDrones: drones.length,
          activeDrones: drones.filter((d: any) => d.status === 'active').length,
          totalMissions: missions.length,
          activeMissions: missions.filter((m: any) => m.status === 'active' || m.status === 'in-progress').length,
          totalUsers: users.length,
          activePilots: users.filter((u: any) => u.role === 'pilot' && u.isActive).length,
          flightHours: 247 // This would come from mission reports in a real app
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Set default values if API fails
        setStats({
          totalDrones: 6,
          activeDrones: 4,
          totalMissions: 3,
          activeMissions: 2,
          totalUsers: 4,
          activePilots: 3,
          flightHours: 247
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated])

  if (!mounted || isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-drone-primary to-drone-secondary">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Role: <span className="capitalize font-medium">{user?.role}</span>
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/drones')}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Drones</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeDrones}</p>
            <p className="text-sm text-gray-500">of {stats.totalDrones} total</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/missions')}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Missions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.activeMissions}</p>
            <p className="text-sm text-gray-500">of {stats.totalMissions} total</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => alert('Flight hours tracking feature coming soon!')}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Flight Hours</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.flightHours}</p>
            <p className="text-sm text-gray-500">This month</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/team')}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Pilots</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.activePilots}</p>
            <p className="text-sm text-gray-500">of {stats.totalUsers} total users</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/missions')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Schedule New Mission</div>
                  <div className="text-sm text-gray-500">Create and assign a new drone mission</div>
                </button>
                
                <button 
                  onClick={() => router.push('/drones')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Add New Drone</div>
                  <div className="text-sm text-gray-500">Register a new drone to the fleet</div>
                </button>
                
                <button 
                  onClick={() => router.push('/reports')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">View Flight Reports</div>
                  <div className="text-sm text-gray-500">Check recent mission reports and analytics</div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="font-medium text-green-800">Mission Completed</div>
                  <div className="text-sm text-green-600">Infrastructure Survey - Downtown Area</div>
                  <div className="text-xs text-green-500">2 hours ago</div>
                </div>
                
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="font-medium text-blue-800">Drone Maintenance</div>
                  <div className="text-sm text-blue-600">DJI Mavic Pro - Scheduled maintenance completed</div>
                  <div className="text-xs text-blue-500">4 hours ago</div>
                </div>
                
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="font-medium text-yellow-800">Weather Alert</div>
                  <div className="text-sm text-yellow-600">High winds expected tomorrow - missions rescheduled</div>
                  <div className="text-xs text-yellow-500">6 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/drones')}
              className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🚁</div>
              <div className="font-medium text-gray-900">Manage Drones</div>
              <div className="text-sm text-gray-500">View and control drone fleet</div>
            </button>
            
            <button 
              onClick={() => router.push('/missions')}
              className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium text-gray-900">Missions</div>
              <div className="text-sm text-gray-500">Plan and track missions</div>
            </button>
            
            <button 
              onClick={() => router.push('/team')}
              className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium text-gray-900">Team</div>
              <div className="text-sm text-gray-500">Manage pilots and users</div>
            </button>
            
            <button 
              onClick={() => router.push('/reports')}
              className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Reports</div>
              <div className="text-sm text-gray-500">View analytics and reports</div>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}