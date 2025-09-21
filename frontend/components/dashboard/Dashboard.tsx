'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import StatsCard from './StatsCard'
import DroneStatusChart from './DroneStatusChart'
import RecentMissions from './RecentMissions'
import FleetMap from './FleetMap'
import {
  CpuChipIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalDrones: number
  activeDrones: number
  activeMissions: number
  totalMissions: number
  alertsCount: number
  totalUsers: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDrones: 0,
    activeDrones: 0,
    activeMissions: 0,
    totalMissions: 0,
    alertsCount: 0,
    totalUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for demonstration
        setStats({
          totalDrones: 24,
          activeDrones: 18,
          activeMissions: 7,
          totalMissions: 156,
          alertsCount: 3,
          totalUsers: 12,
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const statsCards = [
    {
      title: 'Total Drones',
      value: stats.totalDrones,
      subtitle: `${stats.activeDrones} active`,
      icon: CpuChipIcon,
      color: 'blue',
      trend: '+12%',
    },
    {
      title: 'Active Missions',
      value: stats.activeMissions,
      subtitle: `${stats.totalMissions} total`,
      icon: MapPinIcon,
      color: 'green',
      trend: '+8%',
    },
    {
      title: 'Flight Hours',
      value: '1,247',
      subtitle: 'This month',
      icon: ClockIcon,
      color: 'purple',
      trend: '+15%',
    },
    {
      title: 'Alerts',
      value: stats.alertsCount,
      subtitle: 'Requires attention',
      icon: ExclamationTriangleIcon,
      color: stats.alertsCount > 0 ? 'red' : 'gray',
      trend: stats.alertsCount > 0 ? 'High' : 'Normal',
    },
    {
      title: 'Analytics',
      value: '98.5%',
      subtitle: 'Success rate',
      icon: ChartBarIcon,
      color: 'emerald',
      trend: '+2.1%',
    },
    {
      title: 'Team Members',
      value: stats.totalUsers,
      subtitle: 'Active users',
      icon: UsersIcon,
      color: 'indigo',
      trend: '+1',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-drone-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Fleet Overview
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and control of your drone operations
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Drone Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="xl:col-span-1"
        >
          <DroneStatusChart />
        </motion.div>

        {/* Recent Missions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-1"
        >
          <RecentMissions />
        </motion.div>

        {/* Fleet Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 xl:col-span-1"
        >
          <FleetMap />
        </motion.div>
      </div>

      {/* Additional Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-drone-light hover:border-drone-primary transition-all duration-200">
            <CpuChipIcon className="w-8 h-8 text-drone-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Drone</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-drone-light hover:border-drone-primary transition-all duration-200">
            <MapPinIcon className="w-8 h-8 text-drone-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">New Mission</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-drone-light hover:border-drone-primary transition-all duration-200">
            <ChartBarIcon className="w-8 h-8 text-drone-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-drone-light hover:border-drone-primary transition-all duration-200">
            <UsersIcon className="w-8 h-8 text-drone-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}