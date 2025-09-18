'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { LogOut, User, Settings } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) return null

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/missions', label: 'Missions' },
      { href: '/reports', label: 'Reports' }
    ]

    if (user.role === 'admin') {
      // Admins can access everything
      return [
        ...baseItems,
        { href: '/drones', label: 'Fleet Management' },
        { href: '/weather', label: 'Weather Command' }
      ]
    } else if (user.role === 'operator') {
      // Operators can view drones but not manage fleet
      return [
        ...baseItems,
        { href: '/drones', label: 'Fleet Status' },
        { href: '/weather', label: 'Weather' }
      ]
    } else {
      // Pilots have limited access
      return [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/missions', label: 'My Missions' },
        { href: '/weather', label: 'Weather' }
      ]
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-primary-600">
              Drone Survey System
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2 border-l pl-4">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.username}</span>
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-red-600 px-2 py-1 rounded-md text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}