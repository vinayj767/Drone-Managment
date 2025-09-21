'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { 
  HomeIcon, 
  CpuChipIcon, 
  MapIcon, 
  UsersIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  PowerIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface SidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  closeSidebar: () => void
}

const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
  { id: 'drones', name: 'Drone Fleet', icon: CpuChipIcon },
  { id: 'missions', name: 'Missions', icon: MapIcon },
  { id: 'users', name: 'Users', icon: UsersIcon },
  { id: 'reports', name: 'Reports', icon: ChartBarIcon },
  { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
]

export default function Sidebar({ currentPage, setCurrentPage, closeSidebar }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <motion.div 
      className="h-full bg-white shadow-xl border-r border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-drone-primary to-drone-secondary rounded-lg flex items-center justify-center">
              <CpuChipIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Drone Fleet</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </motion.div>
          
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 border-b border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              user?.role === 'admin' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role}
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <motion.button
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-drone-primary text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-drone-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            )
          })}
        </nav>

        {/* Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 border-t border-gray-200"
        >
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <PowerIcon className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">Version 1.0.0</p>
            <p className="text-xs text-gray-400">© 2024 Drone Fleet</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}